
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Project, ProjectStatus, YouTubeStats, ViewHistoryData, ToastMessage, ApiKeys, AIProvider, AIModel, Channel, User, Permission } from '../types';
import { getStatusOptions, PROJECT_TASKS } from '../constants';
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


export const ProjectModal: React.FC<ProjectModalProps> = ({ project, channels, apiKeys, selectedProvider, selectedModel, isSaving, channelMembers, onClose, onSave, onDelete, onCopy, onRerun, onMove, showToast, userPermissions }) => {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState<ModalTab>('content');
    
    const [formData, setFormData] = useState<Project>(() => {
        const initialData = {
            id: `local_${Date.now()}`,
            channelId: '',
            projectName: '',
            publishDateTime: new Date().toISOString(),
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
