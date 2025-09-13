import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Project, ProjectStatus, YouTubeStats, ViewHistoryData, ToastMessage, ApiKeys, AIProvider, AIModel } from '../types';
import { getStatusOptions } from '../constants';
import { fetchVideoStats } from '../services/youtubeService';
import { StatsChart } from './StatsChart';
import { X, Save, Trash2, Tag, Loader, Youtube, BarChart2, MessageSquare, ThumbsUp, Eye, FileText, Wand2, Image as ImageIcon, Calendar, Settings, UploadCloud, Sparkles, Mic, List, Clock, RotateCcw, Repeat, Info as InfoIcon, Code } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from '../hooks/useTranslation';


interface ProjectModalProps {
    project: Project | null;
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
    onClose: () => void;
    onSave: (project: Project) => void;
    onDelete: (projectId: string) => Promise<void>;
    onRerun: (project: Project) => void;
    showToast: (message: string, type: ToastMessage['type']) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div className="mr-3 text-primary">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    </div>
);

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, apiKeys, selectedProvider, selectedModel, onClose, onSave, onDelete, onRerun, showToast }) => {
    const { t, language } = useTranslation();
    const [formData, setFormData] = useState<Project | Omit<Project, 'id'>>({
        ...project,
        tags: project?.tags || [],
        script: project?.script || '',
        thumbnailPrompt: project?.thumbnailPrompt || '',
        thumbnailData: project?.thumbnailData || '',
        voiceoverScript: project?.voiceoverScript || '',
        promptTable: project?.promptTable || '',
        timecodeMap: project?.timecodeMap || '',
        metadata: project?.metadata || '',
        seoMetadata: project?.seoMetadata || '',
    });
    const [stats, setStats] = useState<YouTubeStats | null>(null);
    const [history, setHistory] = useState<ViewHistoryData[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const statusOptions = getStatusOptions(t);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !(formData as Project).tags.includes(newTag)) {
                setFormData(prev => ({...prev, tags: [...(prev as Project).tags, newTag]}));
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({...prev, tags: (prev as Project).tags.filter(tag => tag !== tagToRemove)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Project);
    };

    const handleDelete = async () => {
        if (window.confirm(t('projectModal.deleteConfirmation'))) {
            setIsDeleting(true);
            try {
                await onDelete((project as Project).id);
                // Modal will be closed by App.tsx on success
            } catch (error) {
                // Toast is shown in App.tsx
                setIsDeleting(false); // Re-enable button on failure
            }
        }
    };

    const handleClearForm = () => {
        if (window.confirm(t('projectModal.clearFormConfirmation'))) {
            setFormData(prev => ({
                ...prev,
                videoTitle: '',
                thumbnailData: '',
                description: '',
                tags: [],
                pinnedComment: '',
                communityPost: '',
                facebookPost: '',
                script: '',
                thumbnailPrompt: '',
                voiceoverScript: '',
                promptTable: '',
                timecodeMap: '',
                metadata: prev.metadata || '', // Keep metadata
                seoMetadata: '',
            }));
            showToast(t('toasts.formCleared'), 'info');
        }
    };
    
    const handleRerun = () => {
        onRerun(formData as Project);
    };
    
    const extractVideoId = (url: string): string | null => {
        if (!url) return null;
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const loadStats = useCallback(async (link: string) => {
        const videoId = extractVideoId(link);
        if (!videoId) {
            setStats(null);
            setHistory([]);
            return;
        }

        setIsLoadingStats(true);
        try {
            const result = await fetchVideoStats(link, apiKeys.youtube);
            if (result) {
                setStats(result.stats);
                setHistory(result.history);
                setFormData(prev => ({ ...prev, stats: result.stats }));
                if (result.stats.views > 10000 && project?.status === ProjectStatus.Published) {
                    showToast(t('toasts.milestone', { title: project.videoTitle }), 'info');
                }
            } else {
                setStats(null);
                setHistory([]);
            }
        } catch (error: any) {
            setStats(null);
            setHistory([]);
            showToast(error.message, 'error');
        } finally {
            setIsLoadingStats(false);
        }
    }, [project?.status, project?.videoTitle, showToast, apiKeys.youtube, t]);

    const handleGenerateWithAI = async (field: 'videoTitle' | 'description' | 'tags' | 'thumbnailPrompt') => {
        const aiApiKey = selectedProvider === 'gemini' ? apiKeys.gemini : apiKeys.openai;
        if (!aiApiKey) {
            showToast(t('toasts.aiKeyMissing', { provider: selectedProvider }), 'error');
            return;
        }

        setIsGenerating(field);
        try {
            let prompt = '';
            const context = formData.projectName || formData.videoTitle || 'a new video';
            const langInstruction = language === 'vi' ? ' The response must be in Vietnamese.' : '';
            let output = '';

            switch (field) {
                case 'videoTitle':
                    prompt = `Generate 5 engaging YouTube video titles for a video about: "${context}". Return as a numbered list.${langInstruction}`;
                    break;
                case 'description':
                    prompt = `Write a compelling YouTube video description for a video titled "${formData.videoTitle || context}". Start with a strong hook and include a call to action.${langInstruction}`;
                    break;
                case 'tags':
                    prompt = `Generate a list of 10-15 relevant SEO tags for a YouTube video titled "${formData.videoTitle || context}". The tags should be a single comma-separated string.${langInstruction}`;
                    break;
                case 'thumbnailPrompt':
                    prompt = `Create a concise, descriptive prompt for an AI image generator to create a thumbnail for a YouTube video titled: "${formData.videoTitle || context}". The prompt should focus on dynamic visual elements. The prompt must be in English.`;
                    break;
            }

            if (selectedProvider === 'gemini') {
                 const ai = new GoogleGenAI({ apiKey: aiApiKey });
                 const response = await ai.models.generateContent({
                    model: selectedModel,
                    contents: prompt,
                 });
                 output = response.text;
            } else { // OpenAI
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${aiApiKey}`,
                    },
                    body: JSON.stringify({
                        model: selectedModel,
                        messages: [{ role: 'user', content: prompt }],
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
                }
                const data = await response.json();
                output = data.choices[0].message.content;
            }

            if (field === 'tags') {
                const newTags = output.split(',').map(t => t.trim()).filter(Boolean);
                setFormData(prev => ({ ...prev, tags: [...new Set([...(prev as Project).tags, ...newTags])] }));
            } else if (field === 'videoTitle') {
                setFormData(prev => ({ ...prev, [field]: output.split('\n')[0].replace(/^\d+\.\s*/, '') }));
            }
             else {
                setFormData(prev => ({ ...prev, [field]: output.trim() }));
            }
            showToast(t(`toasts.generated.${field}`), 'success');
        } catch (error) {
            console.error("Error generating content:", error);
            showToast(t('toasts.generateFailed'), 'error');
        } finally {
            setIsGenerating(null);
        }
    };

    const handleGenerateImage = async () => {
        const aiApiKey = selectedProvider === 'gemini' ? apiKeys.gemini : apiKeys.openai;
        if (!aiApiKey) {
            showToast(t('toasts.aiKeyMissing', { provider: selectedProvider }), 'error');
            return;
        }
        if (!formData.thumbnailPrompt) {
            showToast(t('toasts.promptRequired'), 'info');
            return;
        }

        setIsGeneratingImage(true);
        try {
             if (selectedProvider === 'gemini') {
                const ai = new GoogleGenAI({ apiKey: aiApiKey });
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: formData.thumbnailPrompt,
                    config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/png',
                      aspectRatio: '16:9',
                    },
                });

                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                setFormData(prev => ({ ...prev, thumbnailData: imageUrl }));
            } else { // OpenAI DALL-E 3
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${aiApiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'dall-e-3',
                        prompt: formData.thumbnailPrompt,
                        n: 1,
                        size: '1792x1024', // 16:9 aspect ratio
                        response_format: 'b64_json',
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`OpenAI Image Generation error: ${errorData.error?.message || 'Unknown error'}`);
                }
                const data = await response.json();
                const base64Image = data.data[0].b64_json;
                const imageUrl = `data:image/png;base64,${base64Image}`;
                setFormData(prev => ({ ...prev, thumbnailData: imageUrl }));
            }
            showToast(t('toasts.imageGenerated'), 'success');
        } catch (error) {
            console.error("Error generating image:", error);
            showToast(t('toasts.imageGenerateFailed'), 'error');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    useEffect(() => {
        if (project?.youtubeLink) {
            loadStats(project.youtubeLink);
        }
    }, [project?.youtubeLink, apiKeys.youtube, loadStats]);

    const handleImageUpload = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64String = e.target?.result as string;
                setFormData(prev => ({ ...prev, thumbnailData: base64String }));
            };
            reader.readAsDataURL(file);
        } else {
            showToast(t('toasts.invalidImageFile'), 'error');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    };
    
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const file = e.clipboardData.files[0];
        if (file && file.type.startsWith('image/')) {
            e.preventDefault();
            handleImageUpload(file);
        }
    };

    if (!project) return null;
    
    const isNewProject = !('id' in project) || !project.id;

    const GenerateButton = ({ field }: { field: 'videoTitle' | 'description' | 'tags' | 'thumbnailPrompt' }) => (
      <button
        type="button"
        onClick={() => handleGenerateWithAI(field)}
        disabled={!!isGenerating || isGeneratingImage}
        className="text-xs flex items-center gap-1 text-purple-500 hover:text-purple-700 disabled:opacity-50 disabled:cursor-wait"
      >
        {isGenerating === field ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
        {t('projectModal.generate')}
      </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-light-card dark:bg-dark-card z-10">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{isNewProject ? t('projectModal.createTitle') : t('projectModal.editTitle')}</h2>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Column 1: Core Content */}
                        <div className="space-y-4 lg:col-span-1">
                            <div>
                                <label className="font-semibold">{t('projectModal.projectName')}</label>
                                <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" required />
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label className="font-semibold">{t('projectModal.videoTitle')}</label>
                                    <GenerateButton field="videoTitle" />
                                </div>
                                <input type="text" name="videoTitle" value={formData.videoTitle} onChange={handleInputChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                            <div>
                                <label className="font-semibold flex items-center gap-2"><FileText size={16} /> {t('projectModal.script')}</label>
                                <textarea name="script" value={formData.script} onChange={handleInputChange} rows={10} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.scriptPlaceholder')}/>
                            </div>
                             <div>
                                <div className="flex justify-between items-center">
                                    <label className="font-semibold">{t('projectModal.description')}</label>
                                    <GenerateButton field="description" />
                                </div>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                             <div>
                                <div className="flex justify-between items-center">
                                    <label className="font-semibold flex items-center gap-2"><Tag size={16}/> {t('projectModal.tags')}</label>
                                    <GenerateButton field="tags" />
                                </div>
                                <div className="flex flex-wrap gap-2 p-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-md min-h-[40px]">
                                    {(formData as Project).tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 bg-primary/20 text-primary-dark dark:text-red-300 px-2 py-1 text-sm rounded-full">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="ml-1"><X size={12} /></button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder={t('projectModal.addTagPlaceholder')}
                                        className="bg-transparent outline-none flex-grow"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Column 2: Automation & Publishing */}
                        <div className="space-y-4 lg:col-span-1">
                             <div>
                                <label className="font-semibold flex items-center gap-2"><Mic size={16} /> {t('projectModal.voiceoverScript')}</label>
                                <textarea name="voiceoverScript" value={formData.voiceoverScript} onChange={handleInputChange} rows={6} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.voiceoverScriptPlaceholder')}/>
                            </div>
                             <div>
                                <label className="font-semibold flex items-center gap-2"><List size={16} /> {t('projectModal.promptTable')}</label>
                                <textarea name="promptTable" value={formData.promptTable} onChange={handleInputChange} rows={6} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.promptTablePlaceholder')}/>
                            </div>
                             <div>
                                <label className="font-semibold flex items-center gap-2"><Clock size={16} /> {t('projectModal.timecodeMap')}</label>
                                <textarea name="timecodeMap" value={formData.timecodeMap} onChange={handleInputChange} rows={6} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.timecodeMapPlaceholder')}/>
                            </div>
                             <div>
                                <label className="font-semibold flex items-center gap-2"><Code size={16} /> {t('projectModal.seoMetadata')}</label>
                                <textarea name="seoMetadata" value={formData.seoMetadata} onChange={handleInputChange} rows={6} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.seoMetadataPlaceholder')}/>
                            </div>
                            <div>
                                <label className="font-semibold">{t('projectModal.pinnedComment')}</label>
                                <textarea name="pinnedComment" value={formData.pinnedComment} onChange={handleInputChange} rows={3} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                            <div>
                                <label className="font-semibold">{t('projectModal.communityPost')}</label>
                                <textarea name="communityPost" value={formData.communityPost} onChange={handleInputChange} rows={3} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                            <div>
                                <label className="font-semibold">{t('projectModal.facebookPost')}</label>
                                <textarea name="facebookPost" value={formData.facebookPost} onChange={handleInputChange} rows={3} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                            </div>
                             <div>
                                <label className="font-semibold flex items-center gap-2"><InfoIcon size={16} /> {t('projectModal.metadata')}</label>
                                <textarea name="metadata" value={formData.metadata} onChange={handleInputChange} rows={4} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.metadataPlaceholder')}/>
                            </div>
                        </div>

                        {/* Column 3: Metadata & Stats */}
                        <div className="space-y-4 lg:col-span-1">
                             <div>
                                <label className="font-semibold flex items-center gap-2"><Calendar size={16}/> {t('projectModal.publishDate')}</label>
                                <input type="datetime-local" name="publishDateTime" value={formData.publishDateTime} onChange={handleInputChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" required />
                            </div>
                            <div>
                                <label className="font-semibold">{t('projectModal.status')}</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md">
                                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                             <div className="space-y-2 p-3 bg-light-bg/50 dark:bg-dark-bg/50 rounded-lg">
                                <label className="font-semibold flex items-center gap-2"><ImageIcon size={16}/> {t('projectModal.thumbnail')}</label>
                                <div className="relative">
                                    {formData.thumbnailData ? (
                                        <img src={formData.thumbnailData} alt={t('projectModal.thumbnailPreview')} className="w-full aspect-video rounded-md object-cover bg-gray-100 dark:bg-gray-900" />
                                    ) : (
                                        <div className="w-full aspect-video rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <ImageIcon className="text-gray-400 dark:text-gray-500" size={48} />
                                        </div>
                                    )}
                                    {isGeneratingImage && (
                                        <div className="absolute inset-0 bg-black/50 flex justify-center items-center rounded-md">
                                            <Loader className="animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <div 
                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary"
                                    onClick={() => fileInputRef.current?.click()}
                                    onPaste={handlePaste}
                                >
                                    <div className="space-y-1 text-center">
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                            <p className="pl-1">{t('projectModal.uploadOrPaste')}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">{t('projectModal.uploadHint')}</p>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

                                <div className="flex justify-between items-center pt-2">
                                    <label className="font-semibold flex items-center gap-2"><Wand2 size={16}/> {t('projectModal.thumbnailPrompt')}</label>
                                    <div className="flex items-center gap-4">
                                        <GenerateButton field="thumbnailPrompt" />
                                        <button
                                            type="button"
                                            onClick={handleGenerateImage}
                                            disabled={isGeneratingImage || !!isGenerating}
                                            className="text-xs flex items-center gap-1 text-purple-500 hover:text-purple-700 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isGeneratingImage ? <Loader size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                                            {t('projectModal.generateImage')}
                                        </button>
                                    </div>
                                </div>
                                <textarea name="thumbnailPrompt" value={formData.thumbnailPrompt} onChange={handleInputChange} rows={3} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.thumbnailPromptPlaceholder')}/>
                            </div>
                             <div>
                                <label className="font-semibold flex items-center gap-2"><Youtube size={16}/> {t('projectModal.youtubeLink')}</label>
                                <input type="url" name="youtubeLink" value={formData.youtubeLink} onChange={handleInputChange} onBlur={(e) => loadStats(e.target.value)} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder="https://www.youtube.com/watch?v=..." />
                            </div>

                            <div className="bg-light-bg/50 dark:bg-dark-bg/50 p-4 rounded-lg space-y-4">
                               <h3 className="font-bold flex items-center gap-2"><BarChart2 size={20}/> {t('projectModal.performanceStats')}</h3>
                                {isLoadingStats ? (
                                    <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-primary" /></div>
                                ) : !apiKeys.youtube ? (
                                    <div className="text-center text-gray-500 py-16">
                                        <Settings size={24} className="mx-auto mb-2"/>
                                        <p>{t('projectModal.setApiKey')}</p>
                                    </div>
                                ) : stats ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <StatCard icon={<Eye size={24}/>} label={t('projectCard.views')} value={stats.views.toLocaleString(language)} />
                                            <StatCard icon={<ThumbsUp size={24}/>} label={t('projectCard.likes')} value={stats.likes.toLocaleString(language)} />
                                            <StatCard icon={<MessageSquare size={24}/>} label={t('projectCard.comments')} value={stats.comments.toLocaleString(language)} />
                                        </div>
                                        <div className="h-48">
                                            <StatsChart data={history} />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-gray-500 py-16">{t('projectModal.enterLinkForStats')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center sticky bottom-0">
                         <div className="flex gap-2">
                            {!isNewProject && (
                               <>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold py-2 px-4 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                                    {isDeleting ? t('projectModal.deleting') : t('projectModal.delete')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearForm}
                                    className="flex items-center gap-2 text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-400 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-500/10"
                                >
                                    <RotateCcw size={16} /> {t('projectModal.clearForm')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRerun}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 font-semibold py-2 px-4 rounded-lg hover:bg-blue-500/10"
                                >
                                    <Repeat size={16} /> {t('projectModal.rerunAutomation')}
                                </button>
                               </>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('common.cancel')}</button>
                            <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                <Save size={16} /> {t('projectModal.save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
