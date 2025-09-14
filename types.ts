
export enum ProjectStatus {
    Idea = 'Idea',
    Production = 'Production',
    Optimization = 'Optimization',
    Completed = 'Completed',
    Published = 'Published',
}

export interface Project {
    id: string;
    projectName: string;
    publishDateTime: string; // Changed from publishDate to include time
    status: ProjectStatus;
    videoTitle: string;
    thumbnailData: string;
    description: string;
    tags: string[];
    pinnedComment: string;
    communityPost: string;
    facebookPost: string;
    youtubeLink: string;
    script: string;
    thumbnailPrompt: string;
    stats?: YouTubeStats;
    voiceoverScript?: string;
    promptTable?: string;
    timecodeMap?: string;
    metadata?: string;
    seoMetadata?: string;
}

export interface YouTubeStats {
    views: number;
    likes: number;
    comments: number;
}

export interface YouTubeVideoDetails {
    title: string;
    description: string;
    tags: string[];
    thumbnailUrl: string;
}

export interface ViewHistoryData {
    daysAgo: number;
    views: number;
}

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface User {
    uid: string;
    name: string;
    email: string;
    avatar: string;
    status: 'pending' | 'active' | 'expired';
    expiresAt: string | null; // ISO date string
}

/**
 * A single string containing the entire identity of the channel.
 * Users can paste their complete channel description, including role, tone, audience, etc.
 */
export type ChannelDna = string;

export enum AutomationStepStatus {
    Pending = 'Pending',
    Running = 'Running',
    Completed = 'Completed',
    Error = 'Error',
}

export interface AutomationStepSetting {
    key: string;
    label: string; // translation key
    type: 'number' | 'text';
    defaultValue: string | number;
}

export interface AutomationStep {
    id: number;
    name: string;
    description: string;
    promptTemplate: string;
    settings?: AutomationStepSetting[];
}

export type AIProvider = 'gemini' | 'openai';

export type AIModel = 'gemini-2.5-flash' | 'gpt-4o' | 'gpt-4-turbo';

export interface ApiKeys {
    gemini: string;
    openai: string;
    youtube: string;
}