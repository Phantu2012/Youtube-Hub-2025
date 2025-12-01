





export enum ProjectStatus {
    Idea = 'Idea',
    Production = 'Production',
    CreatingVoiceover = 'CreatingVoiceover',
    CreatingThumbnail = 'CreatingThumbnail',
    Optimization = 'Optimization',
    Completed = 'Completed',
    Scheduled = 'Scheduled',
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

export type Permission =
  // Project Fields
  | 'view_project_name' | 'edit_project_name'
  | 'view_video_title' | 'edit_video_title'
  | 'view_script' | 'edit_script'
  | 'view_description' | 'edit_description'
  | 'view_tags' | 'edit_tags'
  | 'view_publish_date' | 'edit_publish_date'
  | 'view_status' | 'edit_status'
  | 'view_assigned_to' | 'edit_assigned_to'
  | 'view_youtube_link' | 'edit_youtube_link'
  | 'view_pinned_comment' | 'edit_pinned_comment'
  | 'view_community_post' | 'edit_community_post'
  | 'view_facebook_post' | 'edit_facebook_post'
  | 'view_tasks' | 'edit_tasks'
  // Thumbnail Tab
  | 'view_thumbnail' | 'edit_thumbnail'
  | 'view_thumbnail_prompt' | 'edit_thumbnail_prompt'
  // AI Assets Tab
  | 'view_voiceover_script' | 'edit_voiceover_script'
  | 'view_visual_prompts' | 'edit_visual_prompts'
  | 'view_prompt_table' | 'edit_prompt_table'
  | 'view_timecode_map' | 'edit_timecode_map'
  | 'view_seo_metadata' | 'edit_seo_metadata'
  | 'view_metadata' | 'edit_metadata'
  // AI Actions
  | 'action_generate_ai_content' // for title, desc, tags
  | 'action_generate_thumbnail_image'
  // Project Actions
  | 'action_delete_project'
  | 'action_copy_project'
  | 'action_rerun_automation'
  | 'action_move_project'
  // Channel Management (for settings)
  | 'manage_channel_settings' // Edit name, DNA, URL
  | 'manage_channel_members' // Invite, remove, change roles
  | 'manage_channel_roles'   // Create, edit, delete roles
  | 'delete_channel';

export interface Role {
    id: string; // e.g., 'owner', 'editor', 'voice_actor', or a UUID
    name: string; // e.g., "Owner", "Editor", "Voice Actor"
    permissions: Permission[];
    isDefault?: boolean; // To prevent deletion of 'owner'
}

export interface Channel {
    id: string;
    name: string;
    ownerId: string;
    members: Record<string, string>; // maps userId to roleId
    memberIds?: string[];
    dna: string;
    channelUrl?: string;
    stats?: ChannelStats;
    dream100Videos?: Dream100Video[];
    ideas?: Idea[];
    automationSteps?: AutomationStep[];
    roles?: Role[];
}

export interface Project {
    id: string;
    channelId: string; // Link to the parent channel
    projectName: string;
    publishDateTime: string; // Changed from publishDate to include time
    plannedPublishDateTime?: string;
    status: ProjectStatus;
    assignedTo?: string; // UID of the assigned user
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
    tasks?: Record<string, boolean>;
    updatedAt?: any;
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

export type AIProvider = 'gemini' | 'openai' | 'claude';

export type AIModel = 'gemini-2.5-flash' | 'gpt-4o' | 'gpt-4-turbo' | 'claude-3-5-sonnet-20240620';

export interface ApiKeys {
    gemini: string;
    openai: string;
    claude: string;
    youtube: string;
}