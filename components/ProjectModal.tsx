
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Project, ProjectStatus, YouTubeStats, ViewHistoryData, ToastMessage, ApiKeys, AIProvider, AIModel, Channel, User, Permission } from '../types';
import { getStatusOptions, PROJECT_TASKS } from '../constants';
import { fetchVideoStats } from '../services/youtubeService';
import { StatsChart } from './StatsChart';
// FIX: Import 'Check' icon from 'lucide-react' to resolve 'Cannot find name' error.
import { X, Save, Trash2, Tag, Loader, Youtube, BarChart2, MessageSquare, ThumbsUp, Eye, FileText, Wand2, Image as ImageIcon, Calendar, Settings, UploadCloud, Sparkles, Mic, List, Clock, RotateCcw, Repeat, Info as InfoIcon, Code, Sheet, Copy, Move, Cloud, Laptop, Check } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useTranslation } from '../hooks/useTranslation';


interface ProjectModalProps {
    project: Project | null;
    projects: Project[];
    channels: Channel[];
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
    isSaving: boolean;
    channelMembers: Record<string, User>;
    onClose: () => void;
    onSave: (project: Project) => void;
    onDelete: (projectId: string) => Promise<void>;
    onCopy: (project: Project) => void;
    onRerun: (project: Project) => void;
    onMove: (project: Project, newChannelId: string) => void;
    showToast: (message: string, type: ToastMessage['type']) => void;
    userPermissions: Permission[];
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
    hidden?: boolean;
}> = ({ label, icon, isActive, onClick, hidden }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-light-text dark:hover:text-dark-text'
        } ${hidden ? 'hidden' : ''}`}
    >
        {icon}
        {label}
    </button>
);


export const ProjectModal: React.FC<ProjectModalProps> = ({ project, projects, channels, apiKeys, selectedProvider, selectedModel, isSaving, channelMembers, onClose, onSave, onDelete, onCopy, onRerun, onMove, showToast, userPermissions }) => {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState<ModalTab>('content');
    
    const [formData, setFormData] = useState<Project>(() => {
        const initialData = {
            id: `local_${Date.now()}`,
            channelId: '',
            projectName: '',
            publishDateTime: new Date().toISOString(),
            plannedPublishDateTime: '',
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
            tasks: {},
            ...project,
        };
        
        const date = new Date(initialData.publishDateTime);
         if (isNaN(date.getTime())) {
            initialData.publishDateTime = new Date().toISOString();
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
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [scheduleConflict, setScheduleConflict] = useState<string | null>(null);

    useEffect(() => {
        if (!formData.plannedPublishDateTime) {
            setScheduleConflict(null);
            return;
        }

        try {
            const plannedTime = new Date(formData.plannedPublishDateTime).getTime();
            if (isNaN(plannedTime)) {
                setScheduleConflict(null);
                return;
            }

            const conflictingProject = projects.find(p =>
                p.id !== formData.id &&
                p.plannedPublishDateTime &&
                new Date(p.plannedPublishDateTime).getTime() === plannedTime
            );

            if (conflictingProject) {
                setScheduleConflict(conflictingProject.projectName || conflictingProject.videoTitle);
            } else {
                setScheduleConflict(null);
            }
        } catch (e) {
            setScheduleConflict(null);
        }
    }, [formData.plannedPublishDateTime, formData.id, projects]);

    const handleCopyField = (fieldValue: string, fieldName: string) => {
        if (!fieldValue) return;
        navigator.clipboard.writeText(fieldValue).then(() => {
            showToast(t('toasts.copied'), 'success');
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        }).catch(err => {
            console.error('Failed to copy text:', err);
            showToast(t('toasts.copyFailed'), 'error');
        });
    };

    const hasPermission = useCallback((p: Permission) => userPermissions.includes(p), [userPermissions]);
    const hasAnyEditPermission = useMemo(() => userPermissions.some(p => p.startsWith('edit_') || p.startsWith('action_')), [userPermissions]);

    const movableChannels = channels.filter(c => c.id !== (formData as Project).channelId);
    
    const currentChannel = channels.find(c => c.id === (formData as Project).channelId);
    const currentChannelMembers = currentChannel?.memberIds?.map(id => channelMembers[id]).filter(Boolean) || [];

    useEffect(() => {
        return () => {
            if (confirmTimer.current) {
                clearTimeout(confirmTimer.current);
            }
        };
    }, []);

    const handleConfirmClick = (action: 'delete' | 'clear') => {
        if (confirmAction === action) {
            if (action === 'delete' && project && 'id' in project) onDelete(project.id);
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
            metadata: '',
            seoMetadata: '',
            visualPrompts: '',
            youtubeLink: '',
            tasks: {},
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTaskChange = (taskId: string, isChecked: boolean) => {
        setFormData(prev => {
            const currentTasks = prev.tasks || {};
            const newTasks = { ...currentTasks, [taskId]: isChecked };
            return { ...prev, tasks: newTasks };
        });
    };
    
    const addTagsFromString = (tagString: string) => {
        const newTags = tagString.split(',').map(t => t.trim()).filter(Boolean);
        if (newTags.length > 0) {
            setFormData(prev => {
                const projectData = prev as Project;
                const currentTags = projectData.tags || [];
                const uniqueNewTags = newTags.filter(t => !currentTags.includes(t));
                if (uniqueNewTags.length > 0) {
                    return { ...prev, tags: [...currentTags, ...uniqueNewTags] };
                }
                return prev;
            });
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTagsFromString(tagInput);
            setTagInput('');
        }
    };

    const handleTagPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText.includes(',')) {
            e.preventDefault();
            addTagsFromString(pastedText);
        }
    };

    const handleTagInputBlur = () => {
        if (tagInput.trim()) {
            addTagsFromString(tagInput);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({...prev, tags: (prev as Project).tags.filter(tag => tag !== tagToRemove)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const projectToSave = { ...formData } as Project;
        const pendingTagsString = tagInput.trim();

        if (pendingTagsString) {
            const newTags = pendingTagsString.split(',').map(t => t.trim()).filter(Boolean);
            const currentTags = projectToSave.tags || [];
            const uniqueNewTags = newTags.filter(t => !currentTags.includes(t));
            if (uniqueNewTags.length > 0) {
                projectToSave.tags = [...currentTags, ...uniqueNewTags];
            }
        }

        onSave(projectToSave);
    };

    const handleImageUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast(t('toasts.invalidImageFile'), 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result.length > 1000000) { // Approx 1MB, base64 is ~33% larger
                 showToast(t('toasts.thumbnailTooLarge'), 'error');
                return;
            }
            setFormData(prev => ({...prev, thumbnailData: result}));
        };
        reader.readAsDataURL(file);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                    handleImageUpload(blob);
                }
                break;
            }
        }
    };
    
    const handleExport = useCallback(() => {
        const p = formData as Project;
        const clean = (field: any) => String(field || '').replace(/"/g, '""').replace(/\n/g, ' ').replace(/\t/g, ' ');

        const headers = [
            'Project Name', 'Video Title', 'Status', 'Publish DateTime', 'Planned Publish DateTime',
            'Description', 'Tags', 'Pinned Comment', 'Community Post',
            'Facebook Post', 'YouTube Link', 'Thumbnail Prompt', 'Script Outline',
            'Voiceover Script', 'Visual Prompts', 'Prompt Table', 'Timecode Map', 'SEO Metadata'
        ].join('\t');
        
        const data = [
            clean(p.projectName), clean(p.videoTitle), clean(p.status), clean(p.publishDateTime), clean(p.plannedPublishDateTime),
            clean(p.description), (p.tags || []).join(', '), clean(p.pinnedComment), clean(p.communityPost),
            clean(p.facebookPost), clean(p.youtubeLink), clean(p.thumbnailPrompt), clean(p.script),
            clean(p.voiceoverScript), clean(p.visualPrompts), clean(p.promptTable), clean(p.timecodeMap), clean(p.seoMetadata)
        ].join('\t');
        
        const tsvContent = `${headers}\n${data}`;
        
        navigator.clipboard.writeText(tsvContent).then(() => {
            showToast(t('toasts.projectExported'), 'success');
        }).catch(err => {
            console.error('Failed to copy project data:', err);
            showToast(t('toasts.exportFailed'), 'error');
        });
    }, [formData, showToast, t]);


    const handleGenerate = async (field: 'videoTitle' | 'description' | 'tags' | 'thumbnailPrompt') => {
        const aiApiKey = selectedProvider === 'gemini' ? apiKeys.gemini : apiKeys.openai;
        if (!aiApiKey) {
            showToast(t('toasts.aiKeyMissing', {provider: selectedProvider}), 'error');
            return;
        }

        setIsGenerating(field);

        let prompt = '';
        const baseInfo = `
            Video Idea/Project Name: ${formData.projectName}
            Full Script: ${formData.script}
            Existing Video Title: ${formData.videoTitle}
            Existing Description: ${formData.description}
            Existing Tags: ${(formData.tags || []).join(', ')}
        `;

        switch (field) {
            case 'videoTitle':
                prompt = `Based on the following script and project name, generate 5 viral, SEO-friendly YouTube titles. Return only the titles, each on a new line.\n${baseInfo}`;
                break;
            case 'description':
                prompt = `Based on the following title and script, write a compelling, SEO-friendly YouTube description (under 500 characters) that includes relevant keywords and 3-5 hashtags.\n${baseInfo}`;
                break;
            case 'tags':
                prompt = `Based on the following title, description and script, generate a list of 15-20 relevant YouTube tags (comma-separated). Return only the tags.\n${baseInfo}`;
                break;
            case 'thumbnailPrompt':
                prompt = `Based on the following title and script, generate a short, descriptive prompt for an AI image generator (like Midjourney or DALL-E) to create a viral thumbnail. The prompt should be in English, visually dynamic, and attention-grabbing. Focus on one key scene or concept.\n${baseInfo}`;
                break;
        }

        try {
            let result = '';
            if (selectedProvider === 'gemini') {
                const ai = new GoogleGenAI({ apiKey: aiApiKey });
                const response = await ai.models.generateContent({ model: selectedModel, contents: prompt });
                result = response.text;
            } else { // OpenAI
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` },
                    body: JSON.stringify({ model: selectedModel, messages: [{ role: 'user', content: prompt }] }),
                });
                 if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
                }
                const data = await response.json();
                result = data.choices[0].message.content.trim();
            }
            
            if (field === 'tags') {
                addTagsFromString(result);
            } else {
                 setFormData(prev => ({ ...prev, [field]: result }));
            }
            showToast(t(`toasts.generated.${field}`), 'success');

        } catch (error) {
            console.error(`Error generating ${field}:`, error);
            showToast(t('toasts.generateFailed'), 'error');
        } finally {
            setIsGenerating(null);
        }
    };
    
    const handleGenerateImage = async () => {
        if (!formData.thumbnailPrompt) {
            showToast(t('toasts.promptRequired'), 'error');
            return;
        }
        const aiApiKey = selectedProvider === 'gemini' ? apiKeys.gemini : apiKeys.openai;
        if (!aiApiKey) {
            showToast(t('toasts.aiKeyMissing', {provider: selectedProvider}), 'error');
            return;
        }

        setIsGeneratingImage(true);
        try {
             let base64Image = '';
             if (selectedProvider === 'gemini') {
                 // The Gemini API does not have a dedicated image generation endpoint in this library version.
                 // This is a placeholder for future implementation.
                 showToast('Image generation with Gemini is not yet supported in this demo.', 'info');
                 setIsGeneratingImage(false);
                 return;

             } else { // OpenAI DALL-E
                 const response = await fetch('https://api.openai.com/v1/images/generations', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` },
                     body: JSON.stringify({
                         prompt: formData.thumbnailPrompt,
                         n: 1,
                         size: '1024x1024',
                         response_format: 'b64_json'
                     }),
                 });
                 if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`OpenAI Image API error: ${errorData.error?.message || 'Unknown error'}`);
                }
                const data = await response.json();
                base64Image = data.data[0].b64_json;
             }

            if (base64Image) {
                setFormData(prev => ({ ...prev, thumbnailData: `data:image/png;base64,${base64Image}` }));
                showToast(t('toasts.imageGenerated'), 'success');
            }

        } catch (error) {
            console.error('Error generating image:', error);
            showToast(t('toasts.imageGenerateFailed'), 'error');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'stats' && formData.youtubeLink && apiKeys.youtube) {
            const fetchStats = async () => {
                setIsLoadingStats(true);
                setStats(null);
                setHistory([]);
                try {
                    const result = await fetchVideoStats(formData.youtubeLink!, apiKeys.youtube);
                    if (result) {
                        setStats(result.stats);
                        setHistory(result.history);
                    }
                } catch (error: any) {
                    console.error("Error fetching stats:", error);
                    showToast(error.message, 'error');
                } finally {
                    setIsLoadingStats(false);
                }
            };
            fetchStats();
        }
    }, [activeTab, formData.youtubeLink, apiKeys.youtube, showToast]);


    if (!project) return null;

    const storageType = formData.storage || (formData.id && formData.id.startsWith('local_') ? 'local' : 'cloud');
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold truncate pr-4">{project.id ? t('projectModal.editTitle') : t('projectModal.createTitle')}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                    </div>
                     <div className="border-b border-gray-200 dark:border-gray-700 mt-2">
                        <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                            <TabButton label={t('projectModal.tabContent')} icon={<FileText size={16}/>} isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                            <TabButton label={t('projectModal.tabPublishing')} icon={<UploadCloud size={16}/>} isActive={activeTab === 'publishing'} onClick={() => setActiveTab('publishing')} />
                            <TabButton label={t('projectModal.tabThumbnail')} icon={<ImageIcon size={16}/>} isActive={activeTab === 'thumbnail'} onClick={() => setActiveTab('thumbnail')} />
                            <TabButton label={t('projectModal.tabAiAssets')} icon={<Sparkles size={16}/>} isActive={activeTab === 'ai_assets'} onClick={() => setActiveTab('ai_assets')} />
                            <TabButton label={t('projectModal.tabStats')} icon={<BarChart2 size={16}/>} isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} hidden={!formData.youtubeLink} />
                        </nav>
                    </div>
                </div>

                <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-grow">
                    {/* Common Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <label htmlFor="projectName" className="font-semibold text-sm mb-1 block">{t('projectModal.projectName')}</label>
                            <div className="relative group">
                                <input id="projectName" name="projectName" value={formData.projectName} onChange={handleInputChange} disabled={!hasPermission('edit_project_name')} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.projectName, 'projectName')} title={t('common.copy')} className="absolute top-1/2 right-1 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    {copiedField === 'projectName' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="publishDateTime" className="font-semibold text-sm mb-1 block">{t('projectModal.publishDate')}</label>
                            <input id="publishDateTime" type="datetime-local" name="publishDateTime" value={formData.publishDateTime ? formData.publishDateTime.substring(0, 16) : ''} onChange={handleInputChange} disabled={!hasPermission('edit_publish_date')} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="plannedPublishDateTime" className="font-semibold text-sm mb-1 block">{t('projectModal.plannedPublishDate')}</label>
                            <input id="plannedPublishDateTime" type="datetime-local" name="plannedPublishDateTime" value={formData.plannedPublishDateTime ? formData.plannedPublishDateTime.substring(0, 16) : ''} onChange={handleInputChange} disabled={!hasPermission('edit_publish_date')} className={`w-full p-2 bg-light-bg dark:bg-dark-bg border rounded-md ${scheduleConflict ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {scheduleConflict && (
                                <p className="text-red-500 text-xs mt-1">
                                    {t('projectModal.scheduleConflictWarning', { projectName: scheduleConflict })}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="status" className="font-semibold text-sm mb-1 block">{t('projectModal.status')}</label>
                            <select id="status" name="status" value={formData.status} onChange={handleInputChange} disabled={!hasPermission('edit_status')} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md">
                                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Tabs Content */}
                    <div className={activeTab === 'content' ? 'block' : 'hidden'}>
                        {/* Content Tab */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div className="md:col-span-2">
                                    <label htmlFor="videoTitle" className="font-semibold text-sm mb-1 block">{t('projectModal.videoTitle')}</label>
                                    <div className="flex gap-2">
                                        <div className="relative group w-full">
                                            <input id="videoTitle" name="videoTitle" value={formData.videoTitle} onChange={handleInputChange} disabled={!hasPermission('edit_video_title')} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                            <button type="button" onClick={() => handleCopyField(formData.videoTitle, 'videoTitle')} title={t('common.copy')} className="absolute top-1/2 right-1 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                {copiedField === 'videoTitle' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                        {hasPermission('action_generate_ai_content') && <button type="button" onClick={() => handleGenerate('videoTitle')} disabled={isGenerating === 'videoTitle'} className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex-shrink-0">{isGenerating === 'videoTitle' ? <Loader size={20} className="animate-spin" /> : <Wand2 size={20}/>}</button>}
                                    </div>
                                </div>
                                <div>
                                    <label className="font-semibold text-sm mb-1 block">{t('projectTasks.title')}</label>
                                    <div className="space-y-2 rounded-md bg-light-bg dark:bg-dark-bg p-3 border border-gray-200 dark:border-gray-700">
                                        {PROJECT_TASKS.map(task => (
                                            <label key={task.id} className={`flex items-center gap-3 ${hasPermission('edit_tasks') ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={!!formData.tasks?.[task.id]}
                                                    onChange={(e) => hasPermission('edit_tasks') && handleTaskChange(task.id, e.target.checked)}
                                                    disabled={!hasPermission('edit_tasks')}
                                                />
                                                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                                                    formData.tasks?.[task.id]
                                                        ? 'bg-orange-500 border-orange-500'
                                                        : 'border-gray-400 bg-white dark:bg-dark-card'
                                                }`}>
                                                    {formData.tasks?.[task.id] && <Check size={16} className="text-white" />}
                                                </div>
                                                <span className={`text-sm ${formData.tasks?.[task.id] ? 'line-through text-gray-500' : 'text-light-text dark:text-dark-text'}`}>{t(task.labelKey)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="description" className="font-semibold text-sm mb-1 block">{t('projectModal.description')}</label>
                                    <div className="flex gap-2">
                                        <div className="relative group w-full">
                                            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} disabled={!hasPermission('edit_description')} rows={6} placeholder={t('projectModal.description')} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                            <button type="button" onClick={() => handleCopyField(formData.description, 'description')} title={t('common.copy')} className="absolute top-1 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                                {copiedField === 'description' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                        {hasPermission('action_generate_ai_content') && <button type="button" onClick={() => handleGenerate('description')} disabled={isGenerating === 'description'} className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex-shrink-0 self-start">{isGenerating === 'description' ? <Loader size={20} className="animate-spin" /> : <Wand2 size={20}/>}</button>}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="tags" className="font-semibold text-sm mb-1 block flex items-center gap-2">
                                        <Tag size={14}/>
                                        {t('projectModal.tags')}
                                        <button type="button" onClick={() => handleCopyField((formData.tags || []).join(', '), 'tags')} className="p-1 text-gray-400 hover:text-primary rounded-md" title={t('common.copy')}>
                                            {copiedField === 'tags' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} onPaste={handleTagPaste} onBlur={handleTagInputBlur} placeholder={t('projectModal.addTagPlaceholder')} disabled={!hasPermission('edit_tags')} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md" />
                                        {hasPermission('action_generate_ai_content') && <button type="button" onClick={() => handleGenerate('tags')} disabled={isGenerating === 'tags'} className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex-shrink-0">{isGenerating === 'tags' ? <Loader size={20} className="animate-spin" /> : <Wand2 size={20}/>}</button>}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 p-2 bg-light-bg dark:bg-dark-bg rounded-md min-h-[52px]">
                                        {(formData.tags || []).map(tag => (
                                            <span key={tag} className="flex items-center gap-1.5 bg-primary/20 text-primary-dark dark:text-red-300 px-2 py-0.5 text-sm rounded-full">
                                                {tag}
                                                {hasPermission('edit_tags') && <button type="button" onClick={() => removeTag(tag)}><X size={12} /></button>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={activeTab === 'publishing' ? 'block' : 'hidden'}>
                        {/* Publishing Tab */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group">
                                <label htmlFor="pinnedComment" className="font-semibold text-sm mb-1 block">{t('projectModal.pinnedComment')}</label>
                                <textarea id="pinnedComment" name="pinnedComment" value={formData.pinnedComment} onChange={handleInputChange} disabled={!hasPermission('edit_pinned_comment')} rows={4} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.pinnedComment, 'pinnedComment')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'pinnedComment' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div className="relative group">
                                <label htmlFor="communityPost" className="font-semibold text-sm mb-1 block">{t('projectModal.communityPost')}</label>
                                <textarea id="communityPost" name="communityPost" value={formData.communityPost} onChange={handleInputChange} disabled={!hasPermission('edit_community_post')} rows={4} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.communityPost, 'communityPost')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'communityPost' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div className="relative group">
                                <label htmlFor="facebookPost" className="font-semibold text-sm mb-1 block">{t('projectModal.facebookPost')}</label>
                                <textarea id="facebookPost" name="facebookPost" value={formData.facebookPost} onChange={handleInputChange} disabled={!hasPermission('edit_facebook_post')} rows={4} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.facebookPost, 'facebookPost')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'facebookPost' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                             <div>
                                <label htmlFor="youtubeLink" className="font-semibold text-sm mb-1 block">{t('projectModal.youtubeLink')}</label>
                                <div className="relative group">
                                    <input id="youtubeLink" name="youtubeLink" value={formData.youtubeLink} onChange={handleInputChange} disabled={!hasPermission('edit_youtube_link')} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                    <button type="button" onClick={() => handleCopyField(formData.youtubeLink, 'youtubeLink')} title={t('common.copy')} className="absolute top-1/2 right-1 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        {copiedField === 'youtubeLink' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={activeTab === 'thumbnail' ? 'block' : 'hidden'}>
                        {/* Thumbnail Tab */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                 <label className="font-semibold text-sm mb-1 block">{t('projectModal.thumbnailPreview')}</label>
                                <div
                                    className="aspect-video w-full bg-light-bg dark:bg-dark-bg border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary"
                                    onClick={() => hasPermission('edit_thumbnail') && fileInputRef.current?.click()}
                                    onPaste={e => hasPermission('edit_thumbnail') && handlePaste(e)}
                                    onDrop={e => { e.preventDefault(); hasPermission('edit_thumbnail') && handleImageUpload(e.dataTransfer.files[0]); }}
                                    onDragOver={e => e.preventDefault()}
                                >
                                    {formData.thumbnailData ? (
                                        <img src={formData.thumbnailData} alt="Thumbnail preview" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <ImageIcon size={48} className="mx-auto" />
                                            <p className="mt-2 text-sm">{t('projectModal.uploadOrPaste')}</p>
                                            <p className="text-xs">{t('projectModal.uploadHint')}</p>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files && handleImageUpload(e.target.files[0])} />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="thumbnailPrompt" className="font-semibold text-sm mb-1 block">{t('projectModal.thumbnailPrompt')}</label>
                                    <div className="flex gap-2">
                                         <div className="relative group w-full">
                                            <textarea id="thumbnailPrompt" name="thumbnailPrompt" value={formData.thumbnailPrompt} onChange={handleInputChange} placeholder={t('projectModal.thumbnailPromptPlaceholder')} disabled={!hasPermission('edit_thumbnail_prompt')} rows={3} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                            <button type="button" onClick={() => handleCopyField(formData.thumbnailPrompt, 'thumbnailPrompt')} title={t('common.copy')} className="absolute top-1 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                                {copiedField === 'thumbnailPrompt' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                        {hasPermission('action_generate_ai_content') && <button type="button" onClick={() => handleGenerate('thumbnailPrompt')} disabled={isGenerating === 'thumbnailPrompt'} className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 self-start">{isGenerating === 'thumbnailPrompt' ? <Loader size={20} className="animate-spin"/> : <Wand2 size={20}/>}</button>}
                                    </div>
                                </div>
                                {hasPermission('action_generate_thumbnail_image') && <button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage || !formData.thumbnailPrompt} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                                    {isGeneratingImage ? <Loader size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                                    {t('projectModal.generateImage')}
                                </button>}
                            </div>
                        </div>
                    </div>

                    <div className={activeTab === 'ai_assets' ? 'block' : 'hidden'}>
                        {/* AI Assets Tab */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group">
                                <label htmlFor="script" className="font-semibold text-sm mb-1 block">{t('projectModal.script')}</label>
                                <textarea id="script" name="script" value={formData.script} onChange={handleInputChange} disabled={!hasPermission('edit_script')} placeholder={t('projectModal.scriptPlaceholder')} rows={12} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.script, 'script')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'script' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div className="relative group">
                                <label htmlFor="voiceoverScript" className="font-semibold text-sm mb-1 block">{t('projectModal.voiceoverScript')}</label>
                                <textarea id="voiceoverScript" name="voiceoverScript" value={formData.voiceoverScript} onChange={handleInputChange} disabled={!hasPermission('edit_voiceover_script')} placeholder={t('projectModal.voiceoverScriptPlaceholder')} rows={12} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.voiceoverScript, 'voiceoverScript')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'voiceoverScript' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                             <div className="relative group">
                                <label htmlFor="visualPrompts" className="font-semibold text-sm mb-1 block">{t('projectModal.visualPrompts')}</label>
                                <textarea id="visualPrompts" name="visualPrompts" value={formData.visualPrompts} onChange={handleInputChange} disabled={!hasPermission('edit_visual_prompts')} placeholder={t('projectModal.visualPromptsPlaceholder')} rows={12} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.visualPrompts, 'visualPrompts')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'visualPrompts' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                             <div className="relative group">
                                <label htmlFor="promptTable" className="font-semibold text-sm mb-1 block">{t('projectModal.promptTable')}</label>
                                <textarea id="promptTable" name="promptTable" value={formData.promptTable} onChange={handleInputChange} disabled={!hasPermission('edit_prompt_table')} placeholder={t('projectModal.promptTablePlaceholder')} rows={12} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.promptTable, 'promptTable')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'promptTable' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                             <div className="relative group">
                                <label htmlFor="timecodeMap" className="font-semibold text-sm mb-1 block">{t('projectModal.timecodeMap')}</label>
                                <textarea id="timecodeMap" name="timecodeMap" value={formData.timecodeMap} onChange={handleInputChange} disabled={!hasPermission('edit_timecode_map')} placeholder={t('projectModal.timecodeMapPlaceholder')} rows={12} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.timecodeMap, 'timecodeMap')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'timecodeMap' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                             <div className="relative group">
                                <label htmlFor="seoMetadata" className="font-semibold text-sm mb-1 block">{t('projectModal.seoMetadata')}</label>
                                <textarea id="seoMetadata" name="seoMetadata" value={formData.seoMetadata} onChange={handleInputChange} disabled={!hasPermission('edit_seo_metadata')} placeholder={t('projectModal.seoMetadataPlaceholder')} rows={12} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md pr-10" />
                                <button type="button" onClick={() => handleCopyField(formData.seoMetadata, 'seoMetadata')} title={t('common.copy')} className="absolute top-8 right-1 p-1.5 text-gray-400 hover:text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-light-bg/80 dark:bg-dark-bg/80">
                                    {copiedField === 'seoMetadata' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className={activeTab === 'stats' ? 'block' : 'hidden'}>
                        {/* Stats Tab */}
                        {isLoadingStats && <div className="flex justify-center items-center h-64"><Loader className="w-12 h-12 animate-spin text-primary" /></div>}
                        {!isLoadingStats && !stats && <div className="text-center h-64 flex flex-col justify-center items-center"><InfoIcon className="text-yellow-500 mb-2" size={32}/><p>{apiKeys.youtube ? t('projectModal.enterLinkForStats') : t('projectModal.setApiKey')}</p></div>}
                        {stats && history && (
                             <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <StatCard icon={<Eye size={24}/>} label={t('projectCard.views')} value={stats.views.toLocaleString(language)} />
                                    <StatCard icon={<ThumbsUp size={24}/>} label={t('projectCard.likes')} value={stats.likes.toLocaleString(language)} />
                                    <StatCard icon={<MessageSquare size={24}/>} label={t('projectCard.comments')} value={stats.comments.toLocaleString(language)} />
                                </div>
                                <div className="h-72 w-full">
                                    <StatsChart data={history} />
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4 flex-shrink-0">
                    <div className="flex flex-wrap items-center gap-2">
                        {hasPermission('action_delete_project') && <button type="button" onClick={() => handleConfirmClick('delete')} className={`flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${confirmAction === 'delete' ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-500/10'}`}>{isSaving ? <Loader size={16} className="animate-spin"/> : <Trash2 size={16} />} {confirmAction === 'delete' ? t('projectModal.deleteConfirmation') : t('projectModal.delete')}</button>}
                        {hasPermission('action_copy_project') && <button type="button" onClick={() => onCopy(formData as Project)} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg text-blue-500 hover:bg-blue-500/10"><Copy size={16} />{t('projectModal.copy')}</button>}
                        <button type="button" onClick={handleExport} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg text-green-600 hover:bg-green-600/10"><Sheet size={16} />{t('projectModal.exportToSheet')}</button>
                        {hasPermission('action_rerun_automation') && <button type="button" onClick={() => onRerun(formData as Project)} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg text-purple-500 hover:bg-purple-500/10"><Repeat size={16} />{t('projectModal.rerunAutomation')}</button>}
                    </div>
                     <div className="flex items-center gap-2">
                         {isMoving ? (
                             <>
                                <select value={destinationChannelId} onChange={e => setDestinationChannelId(e.target.value)} className="p-2 text-sm bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md">
                                    <option value="" disabled>{t('projectModal.moveToChannel')}</option>
                                    {movableChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                 </select>
                                 <button type="button" onClick={() => onMove(formData as Project, destinationChannelId)} disabled={!destinationChannelId || isSaving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg disabled:opacity-50">{isSaving ? <Loader size={16} className="animate-spin" /> : <Check size={16}/>}{t('projectModal.confirmMove')}</button>
                                 <button type="button" onClick={() => setIsMoving(false)} className="py-2 px-3 rounded-lg bg-gray-200 dark:bg-gray-600"><X size={16} /></button>
                             </>
                         ) : (
                             hasPermission('action_move_project') && <button type="button" onClick={() => setIsMoving(true)} disabled={storageType === 'local'} title={storageType === 'local' ? t('projectModal.moveDisabledLocal') : undefined} className="flex items-center gap-2 text-sm font-semibold py-2 px-3 rounded-lg text-green-600 hover:bg-green-600/10 disabled:opacity-50 disabled:cursor-not-allowed"><Move size={16} />{t('projectModal.move')}</button>
                         )}
                     </div>
                    <button type="submit" disabled={isSaving || !hasAnyEditPermission} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSaving ? t('projectModal.saving') : (storageType === 'local' ? t('projectModal.saveToCloud') : t('projectModal.save'))}
                    </button>
                </div>
            </form>
        </div>
    );
};
