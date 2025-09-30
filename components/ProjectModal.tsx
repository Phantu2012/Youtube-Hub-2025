
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Project, ProjectStatus, YouTubeStats, ViewHistoryData, ToastMessage, ApiKeys, AIProvider, AIModel, Channel } from '../types';
import { getStatusOptions } from '../constants';
import { fetchVideoStats } from '../services/youtubeService';
import { StatsChart } from './StatsChart';
import { X, Save, Trash2, Tag, Loader, Youtube, BarChart2, MessageSquare, ThumbsUp, Eye, FileText, Wand2, Image as ImageIcon, Calendar, Settings, UploadCloud, Sparkles, Mic, List, Clock, RotateCcw, Repeat, Info as InfoIcon, Code, Sheet, Copy, Move, Cloud, Laptop } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from '../hooks/useTranslation';


interface ProjectModalProps {
    project: Project | null;
    channels: Channel[];
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
    isSaving: boolean;
    onClose: () => void;
    onSave: (project: Project) => void;
    onDelete: (projectId: string) => Promise<void>;
    onCopy: (project: Project) => void;
    onRerun: (project: Project) => void;
    onMove: (project: Project, newChannelId: string) => void;
    showToast: (message: string, type: ToastMessage['type']) => void;
}

type ModalTab = 'content' | 'publishing' | 'thumbnail' | 'ai_assets' | 'stats';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
        <div className="mr-3 text-primary">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    </div>
);

const TabButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-light-text dark:hover:text-dark-text'
        }`}
    >
        {icon}
        {label}
    </button>
);


export const ProjectModal: React.FC<ProjectModalProps> = ({ project, channels, apiKeys, selectedProvider, selectedModel, isSaving, onClose, onSave, onDelete, onCopy, onRerun, onMove, showToast }) => {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState<ModalTab>('content');
    const [formData, setFormData] = useState<Project | Omit<Project, 'id'>>(() => {
        const defaultProject = {
            channelId: '',
            projectName: '',
            publishDateTime: new Date().toISOString().slice(0, 16),
            status: ProjectStatus.Idea,
            videoTitle: '',
            thumbnailData: '',
            description: '',
            tags: [],
            pinnedComment: '',
            communityPost: '',
            facebookPost: '',
            youtubeLink: '',
            script: '',
            thumbnailPrompt: '',
            voiceoverScript: '',
            promptTable: '',
            timecodeMap: '',
            metadata: '',
            seoMetadata: '',
            visualPrompts: '',
            storage: 'local' as const,
        };
        
        const initialData = { ...defaultProject, ...project };

        // Validate and format the publishDateTime for the datetime-local input.
        const date = new Date(initialData.publishDateTime);
        if (!initialData.publishDateTime || isNaN(date.getTime())) {
            initialData.publishDateTime = new Date().toISOString().slice(0, 16);
        } else {
            // Ensure it's in the correct format even if it was a valid but different string format
            initialData.publishDateTime = date.toISOString().slice(0, 16);
        }

        return initialData;
    });
    const [stats, setStats] = useState<YouTubeStats | null>(null);
    const [history, setHistory] = useState<ViewHistoryData[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const statusOptions = getStatusOptions(t);
    const [confirmAction, setConfirmAction] = useState<'delete' | 'clear' | null>(null);
    const confirmTimer = useRef<number | null>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [destinationChannelId, setDestinationChannelId] = useState('');

    const movableChannels = channels.filter(c => c.id !== (formData as Project).channelId);

    useEffect(() => {
        return () => {
            if (confirmTimer.current) {
                clearTimeout(confirmTimer.current);
            }
        };
    }, []);

    const handleConfirmClick = (action: 'delete' | 'clear') => {
        if (confirmAction === action) {
            if (action === 'delete' && 'id' in project) onDelete(project.id);
            if (action === 'clear') handleClearFormAction();
            
            setConfirmAction(null);
            if (confirmTimer.current) clearTimeout(confirmTimer.current);
        } else {
            setConfirmAction(action);
            if (confirmTimer.current) clearTimeout(confirmTimer.current);
            confirmTimer.current = window.setTimeout(() => {
                setConfirmAction(null);
            }, 4000);
        }
    };

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

    const handleClearFormAction = () => {
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
            visualPrompts: '',
        }));
        showToast(t('toasts.formCleared'), 'info');
    };
    
    const handleRerun = () => {
        onRerun(formData as Project);
    };

    const handleCopyProjectAction = () => {
        onCopy(formData as Project);
    };
    
    const handleStartMove = () => {
        if (movableChannels.length === 0) {
            showToast(t('toasts.noChannelsToMove'), 'info');
            return;
        }
        setDestinationChannelId(movableChannels[0].id);
        setIsMoving(true);
    };

    const handleConfirmMove = () => {
        if (destinationChannelId) {
            onMove(formData as Project, destinationChannelId);
        }
    };


    const handleExportToSheet = () => {
        const data = formData as Project;
        const tsvLines: string[] = [];

        // Helper to add a row to the TSV content
        const addLine = (labelKey: string, value: any) => {
            const label = t(labelKey);
            // Sanitize value for TSV: replace tabs with spaces and newlines with a carriage return for simple paste
            const cleanValue = String(value || '').replace(/\t/g, ' ').replace(/\n/g, '\r');
            tsvLines.push(`${label}\t${cleanValue}`);
        };

        addLine('projectModal.projectName', data.projectName);
        addLine('projectModal.videoTitle', data.videoTitle);
        addLine('projectModal.publishDate', data.publishDateTime);
        addLine('projectModal.status', data.status);
        addLine('projectModal.youtubeLink', data.youtubeLink);
        addLine('projectModal.description', data.description);
        addLine('projectModal.tags', Array.isArray(data.tags) ? data.tags.join(', ') : '');
        addLine('projectModal.pinnedComment', data.pinnedComment);
        addLine('projectModal.communityPost', data.communityPost);
        addLine('projectModal.facebookPost', data.facebookPost);
        addLine('projectModal.script', data.script);
        addLine('projectModal.thumbnailPrompt', data.thumbnailPrompt);
        addLine('projectModal.voiceoverScript', data.voiceoverScript);
        addLine('projectModal.visualPrompts', data.visualPrompts);
        addLine('projectModal.promptTable', data.promptTable);
        addLine('projectModal.timecodeMap', data.timecodeMap);
        addLine('projectModal.seoMetadata', data.seoMetadata);
        addLine('projectModal.metadata', data.metadata);
        
        const tsvContent = tsvLines.join('\n');

        navigator.clipboard.writeText(tsvContent).then(() => {
            showToast(t('toasts.projectExported'), 'success');
        }).catch(err => {
            console.error('Failed to copy to clipboard', err);
            showToast(t('toasts.exportFailed'), 'error');
        });
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
    const storageType = formData.storage || (project.id && !project.id.startsWith('local_') ? 'cloud' : 'local');

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
    
    const CopyButton = ({ textToCopy }: { textToCopy: string | string[] | undefined }) => {
        if (!textToCopy || (Array.isArray(textToCopy) && textToCopy.length === 0)) {
            return null;
        }

        const handleCopyClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            const text = Array.isArray(textToCopy) ? textToCopy.join(', ') : textToCopy;
            navigator.clipboard.writeText(text).then(() => {
                showToast(t('toasts.copied'), 'success');
            });
        };

        return (
            <button
                type="button"
                onClick={handleCopyClick}
                className="p-1 text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary-dark transition-colors"
                title={t('common.copy')}
            >
                <Copy size={14} />
            </button>
        );
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'content':
                return (
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold">{t('projectModal.projectName')}</label>
                                <CopyButton textToCopy={formData.projectName} />
                            </div>
                            <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" required />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold">{t('projectModal.videoTitle')}</label>
                                <div className="flex items-center gap-2">
                                    <CopyButton textToCopy={formData.videoTitle} />
                                    <GenerateButton field="videoTitle" />
                                </div>
                            </div>
                            <input type="text" name="videoTitle" value={formData.videoTitle} onChange={handleInputChange} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><FileText size={16} /> {t('projectModal.script')}</label>
                                <CopyButton textToCopy={formData.script} />
                            </div>
                            <textarea name="script" value={formData.script} onChange={handleInputChange} rows={12} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.scriptPlaceholder')}/>
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold">{t('projectModal.description')}</label>
                                <div className="flex items-center gap-2">
                                    <CopyButton textToCopy={formData.description} />
                                    <GenerateButton field="description" />
                                </div>
                            </div>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={6} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><Tag size={16}/> {t('projectModal.tags')}</label>
                                <div className="flex items-center gap-2">
                                    <CopyButton textToCopy={(formData as Project).tags} />
                                    <GenerateButton field="tags" />
                                </div>
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
                );
            case 'publishing':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold flex items-center gap-2">{t('projectModal.publishDate')}</label>
                            <input type="datetime-local" name="publishDateTime" value={formData.publishDateTime} onChange={handleInputChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" required />
                        </div>
                        <div>
                            <label className="font-semibold">{t('projectModal.status')}</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md">
                                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><Youtube size={16}/> {t('projectModal.youtubeLink')}</label>
                                <CopyButton textToCopy={formData.youtubeLink} />
                            </div>
                            <input type="url" name="youtubeLink" value={formData.youtubeLink} onChange={handleInputChange} onBlur={(e) => loadStats(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder="https://www.youtube.com/watch?v=..." />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold">{t('projectModal.pinnedComment')}</label>
                                <CopyButton textToCopy={formData.pinnedComment} />
                            </div>
                            <textarea name="pinnedComment" value={formData.pinnedComment} onChange={handleInputChange} rows={5} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold">{t('projectModal.communityPost')}</label>
                                <CopyButton textToCopy={formData.communityPost} />
                            </div>
                            <textarea name="communityPost" value={formData.communityPost} onChange={handleInputChange} rows={5} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold">{t('projectModal.facebookPost')}</label>
                                <CopyButton textToCopy={formData.facebookPost} />
                            </div>
                            <textarea name="facebookPost" value={formData.facebookPost} onChange={handleInputChange} rows={5} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                    </div>
                );
            case 'thumbnail':
                return (
                     <div className="space-y-4">
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
                                <CopyButton textToCopy={formData.thumbnailPrompt} />
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
                        <textarea name="thumbnailPrompt" value={formData.thumbnailPrompt} onChange={handleInputChange} rows={5} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.thumbnailPromptPlaceholder')}/>
                    </div>
                );
            case 'ai_assets':
                 return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><Mic size={16} /> {t('projectModal.voiceoverScript')}</label>
                                <CopyButton textToCopy={formData.voiceoverScript} />
                            </div>
                            <textarea name="voiceoverScript" value={formData.voiceoverScript} onChange={handleInputChange} rows={8} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.voiceoverScriptPlaceholder')}/>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><ImageIcon size={16} /> {t('projectModal.visualPrompts')}</label>
                                <CopyButton textToCopy={formData.visualPrompts} />
                            </div>
                            <textarea name="visualPrompts" value={formData.visualPrompts} onChange={handleInputChange} rows={8} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.visualPromptsPlaceholder')}/>
                        </div>
                         <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><List size={16} /> {t('projectModal.promptTable')}</label>
                                <CopyButton textToCopy={formData.promptTable} />
                            </div>
                            <textarea name="promptTable" value={formData.promptTable} onChange={handleInputChange} rows={8} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.promptTablePlaceholder')}/>
                        </div>
                         <div>
                             <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><Clock size={16} /> {t('projectModal.timecodeMap')}</label>
                                <CopyButton textToCopy={formData.timecodeMap} />
                            </div>
                            <textarea name="timecodeMap" value={formData.timecodeMap} onChange={handleInputChange} rows={8} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.timecodeMapPlaceholder')}/>
                        </div>
                         <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><Code size={16} /> {t('projectModal.seoMetadata')}</label>
                                <CopyButton textToCopy={formData.seoMetadata} />
                            </div>
                            <textarea name="seoMetadata" value={formData.seoMetadata} onChange={handleInputChange} rows={8} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.seoMetadataPlaceholder')}/>
                        </div>
                        <div className="lg:col-span-2">
                             <div className="flex justify-between items-center mb-1">
                                <label className="font-semibold flex items-center gap-2"><InfoIcon size={16} /> {t('projectModal.metadata')}</label>
                                <CopyButton textToCopy={formData.metadata} />
                            </div>
                            <textarea name="metadata" value={formData.metadata} onChange={handleInputChange} rows={4} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" placeholder={t('projectModal.metadataPlaceholder')}/>
                        </div>
                    </div>
                );
            case 'stats':
                return (
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
                                <div className="h-64">
                                    <StatsChart data={history} />
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500 py-16">{t('projectModal.enterLinkForStats')}</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };
    

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                {isNewProject ? t('projectModal.createTitle') : t('projectModal.editTitle')}
                                <span title={storageType === 'local' ? t('projectCard.local') : t('projectCard.cloud')} className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                                    {storageType === 'local' ? <Laptop size={12} /> : <Cloud size={12} />}
                                    {storageType === 'local' ? t('projectCard.local') : t('projectCard.cloud')}
                                </span>
                            </h2>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                         <div className="flex space-x-2 px-4">
                            <TabButton label={t('projectModal.tabContent')} icon={<FileText size={16} />} isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                            <TabButton label={t('projectModal.tabPublishing')} icon={<Youtube size={16} />} isActive={activeTab === 'publishing'} onClick={() => setActiveTab('publishing')} />
                            <TabButton label={t('projectModal.tabThumbnail')} icon={<ImageIcon size={16} />} isActive={activeTab === 'thumbnail'} onClick={() => setActiveTab('thumbnail')} />
                            <TabButton label={t('projectModal.tabAiAssets')} icon={<Sparkles size={16} />} isActive={activeTab === 'ai_assets'} onClick={() => setActiveTab('ai_assets')} />
                            <TabButton label={t('projectModal.tabStats')} icon={<BarChart2 size={16} />} isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-grow overflow-y-auto">
                        {renderContent()}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                         {isMoving ? (
                            <div className="w-full flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <label htmlFor="move-channel-select" className="font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{t('projectModal.moveToChannel')}</label>
                                    <select
                                        id="move-channel-select"
                                        value={destinationChannelId}
                                        onChange={(e) => setDestinationChannelId(e.target.value)}
                                        className="p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                                    >
                                        {movableChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                     <button type="button" onClick={() => setIsMoving(false)} disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">{t('common.cancel')}</button>
                                     <button type="button" onClick={handleConfirmMove} disabled={isSaving} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                        {t('projectModal.confirmMove')}
                                     </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex justify-between items-center">
                                <div className="flex gap-2 flex-wrap">
                                    {!isNewProject && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleConfirmClick('delete')}
                                            disabled={isSaving}
                                            className={`flex items-center gap-2 font-semibold py-2 px-3 rounded-lg text-sm transition-colors duration-200 disabled:opacity-50 ${
                                                confirmAction === 'delete' 
                                                ? 'bg-red-500 text-white' 
                                                : 'text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-500/10'
                                            }`}
                                        >
                                            <Trash2 size={16} /> 
                                            {confirmAction === 'delete' ? t('toasts.deleteConfirm') : t('projectModal.delete')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleStartMove}
                                            disabled={isSaving || storageType === 'local'}
                                            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-800 dark:hover:text-cyan-400 font-semibold py-2 px-3 rounded-lg text-sm hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={storageType === 'local' ? t('projectModal.moveDisabledLocal') : t('projectModal.move')}
                                        >
                                            <Move size={16} /> {t('projectModal.move')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCopyProjectAction}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 dark:hover:text-purple-400 font-semibold py-2 px-3 rounded-lg text-sm hover:bg-purple-500/10"
                                        >
                                            <Copy size={16} /> {t('projectModal.copy')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRerun}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 font-semibold py-2 px-3 rounded-lg text-sm hover:bg-blue-500/10"
                                        >
                                            <Repeat size={16} /> {t('projectModal.rerunAutomation')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExportToSheet}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 text-green-600 hover:text-green-800 dark:hover:text-green-400 font-semibold py-2 px-3 rounded-lg text-sm hover:bg-green-500/10"
                                        >
                                            <Sheet size={16} /> {t('projectModal.exportToSheet')}
                                        </button>
                                    </>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={onClose} disabled={isSaving} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">{t('common.cancel')}</button>
                                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:bg-opacity-70 disabled:cursor-wait">
                                        {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} 
                                        {isSaving ? t('projectModal.saving') : t('projectModal.save')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
