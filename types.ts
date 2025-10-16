

export enum ProjectStatus {
    Idea = 'Idea',
    Production = 'Production',
    Optimization = 'Optimization',
    Completed = 'Completed',
    Published = 'Published',
}

export enum Dream100VideoStatus {
    Pending = 'Pending',
    Analyzed = 'Analyzed',
    Remade = 'Remade',
}

export enum IdeaStatus {
    NotStarted = 'Not Started',
    Done = 'Done',
    Redo = 'Redo',
}

export interface Idea {
    id: string;
    title: string;
    status: IdeaStatus;
    content?: string;
}

export interface Dream100Video {
    id: string; // YouTube video ID
    title: string;
    thumbnailUrl: string;
    channelTitle: string;
    tags: string[];
    description: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string; // ISO string
    youtubeLink: string;
    status: Dream100VideoStatus;
}

export interface ChannelStats {
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
}

export interface Channel {
    id: string;
    name: string;
    ownerId: string;
    members: Record<string, 'owner' | 'editor'>;
    memberIds?: string[];
    dna: string;
    channelUrl?: string;
    stats?: ChannelStats;
    dream100Videos?: Dream100Video[];
    ideas?: Idea[];
    automationSteps?: AutomationStep[];
}

export interface Project {
    id: string;
    channelId: string; // Link to the parent channel
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
    visualPrompts?: string;
    storage?: 'local' | 'cloud';
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
    channelTitle: string;
    publishedAt: string;
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
    isAdmin?: boolean;
}

/**
 * An array of Channel objects, each defining the identity of a different YouTube channel.
 */
export type ChannelDna = Channel[];

export enum AutomationStepStatus {
    Pending = 'Pending',
    Running = 'Running',
    Completed = 'Completed',
    Error = 'Error',
    Skipped = 'Skipped',
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
    enabled?: boolean;
}

export type AIProvider = 'gemini' | 'openai';

export type AIModel = 'gemini-2.5-flash' | 'gpt-4o' | 'gpt-4-turbo';

export interface ApiKeys {
    gemini: string;
    openai: string;
    youtube: string;
}