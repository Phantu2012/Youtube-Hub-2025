import { ProjectStatus, AutomationStep, Dream100VideoStatus, IdeaStatus, Permission, Role } from './types';

// The 't' function will be provided by the useTranslation hook in the component
export const getStatusOptions = (t: (key: string) => string) => [
    { value: ProjectStatus.Idea, label: t('status.idea') },
    { value: ProjectStatus.Production, label: t('status.production') },
    { value: ProjectStatus.CreatingVoiceover, label: t('status.creatingVoiceover') },
    { value: ProjectStatus.CreatingThumbnail, label: t('status.creatingThumbnail') },
    { value: ProjectStatus.Optimization, label: t('status.optimization') },
    { value: ProjectStatus.Completed, label: t('status.completed') },
    { value: ProjectStatus.Scheduled, label: t('status.scheduled') },
    { value: ProjectStatus.Published, label: t('status.published') },
];

export const STATUS_COLORS: { [key in ProjectStatus]: string } = {
    [ProjectStatus.Idea]: 'bg-blue-500',
    [ProjectStatus.Production]: 'bg-purple-500',
    [ProjectStatus.CreatingVoiceover]: 'bg-teal-500',
    [ProjectStatus.CreatingThumbnail]: 'bg-orange-500',
    [ProjectStatus.Optimization]: 'bg-yellow-500',
    [ProjectStatus.Completed]: 'bg-green-500',
    [ProjectStatus.Scheduled]: 'bg-slate-500',
    [ProjectStatus.Published]: 'bg-red-500',
};

export const getDream100StatusOptions = (t: (key: string) => string) => [
    { value: Dream100VideoStatus.Pending, label: t('dream100.status.pending') },
    { value: Dream100VideoStatus.Analyzed, label: t('dream100.status.analyzed') },
    { value: Dream100VideoStatus.Remade, label: t('dream100.status.remade') },
];

export const DREAM100_STATUS_COLORS: { [key in Dream100VideoStatus]: string } = {
    [Dream100VideoStatus.Pending]: 'bg-gray-500',
    [Dream100VideoStatus.Analyzed]: 'bg-blue-500',
    [Dream100VideoStatus.Remade]: 'bg-green-500',
};

export const getIdeaStatusOptions = (t: (key: string) => string) => [
    { value: IdeaStatus.NotStarted, label: t('ideaBankModal.status.notStarted') },
    { value: IdeaStatus.Done, label: t('ideaBankModal.status.done') },
    { value: IdeaStatus.Redo, label: t('ideaBankModal.status.redo') },
];

export const IDEA_STATUS_COLORS: { [key in IdeaStatus]: string } = {
    [IdeaStatus.NotStarted]: 'bg-gray-500',
    [IdeaStatus.Done]: 'bg-green-500',
    [IdeaStatus.Redo]: 'bg-yellow-500',
};

export const PROJECT_TASKS = [
    { id: 'check_voice', labelKey: 'projectTasks.checkVoice' },
    { id: 'create_voice', labelKey: 'projectTasks.createVoice' },
    { id: 'create_image', labelKey: 'projectTasks.createImage' },
];

export const ALL_PERMISSIONS: { id: Permission; labelKey: string; group: string; }[] = [
    // Group: Project Details
    { id: 'view_project_name', labelKey: 'permissions.view_project_name', group: 'project' },
    { id: 'edit_project_name', labelKey: 'permissions.edit_project_name', group: 'project' },
    { id: 'view_video_title', labelKey: 'permissions.view_video_title', group: 'project' },
    { id: 'edit_video_title', labelKey: 'permissions.edit_video_title', group: 'project' },
    { id: 'view_script', labelKey: 'permissions.view_script', group: 'project' },
    { id: 'edit_script', labelKey: 'permissions.edit_script', group: 'project' },
    { id: 'view_description', labelKey: 'permissions.view_description', group: 'project' },
    { id: 'edit_description', labelKey: 'permissions.edit_description', group: 'project' },
    { id: 'view_tags', labelKey: 'permissions.view_tags', group: 'project' },
    { id: 'edit_tags', labelKey: 'permissions.edit_tags', group: 'project' },
    { id: 'view_publish_date', labelKey: 'permissions.view_publish_date', group: 'project' },
    { id: 'edit_publish_date', labelKey: 'permissions.edit_publish_date', group: 'project' },
    { id: 'view_status', labelKey: 'permissions.view_status', group: 'project' },
    { id: 'edit_status', labelKey: 'permissions.edit_status', group: 'project' },
    { id: 'view_assigned_to', labelKey: 'permissions.view_assigned_to', group: 'project' },
    { id: 'edit_assigned_to', labelKey: 'permissions.edit_assigned_to', group: 'project' },
    { id: 'view_youtube_link', labelKey: 'permissions.view_youtube_link', group: 'project' },
    { id: 'edit_youtube_link', labelKey: 'permissions.edit_youtube_link', group: 'project' },
    { id: 'view_pinned_comment', labelKey: 'permissions.view_pinned_comment', group: 'project' },
    { id: 'edit_pinned_comment', labelKey: 'permissions.edit_pinned_comment', group: 'project' },
    { id: 'view_community_post', labelKey: 'permissions.view_community_post', group: 'project' },
    { id: 'edit_community_post', labelKey: 'permissions.edit_community_post', group: 'project' },
    { id: 'view_facebook_post', labelKey: 'permissions.view_facebook_post', group: 'project' },
    { id: 'edit_facebook_post', labelKey: 'permissions.edit_facebook_post', group: 'project' },
    { id: 'view_tasks', labelKey: 'permissions.view_tasks', group: 'project' },
    { id: 'edit_tasks', labelKey: 'permissions.edit_tasks', group: 'project' },
    // Group: Thumbnail
    { id: 'view_thumbnail', labelKey: 'permissions.view_thumbnail', group: 'thumbnail' },
    { id: 'edit_thumbnail', labelKey: 'permissions.edit_thumbnail', group: 'thumbnail' },
    { id: 'view_thumbnail_prompt', labelKey: 'permissions.view_thumbnail_prompt', group: 'thumbnail' },
    { id: 'edit_thumbnail_prompt', labelKey: 'permissions.edit_thumbnail_prompt', group: 'thumbnail' },
    // Group: AI Assets
    { id: 'view_voiceover_script', labelKey: 'permissions.view_voiceover_script', group: 'ai_assets' },
    { id: 'edit_voiceover_script', labelKey: 'permissions.edit_voiceover_script', group: 'ai_assets' },
    { id: 'view_visual_prompts', labelKey: 'permissions.view_visual_prompts', group: 'ai_assets' },
    { id: 'edit_visual_prompts', labelKey: 'permissions.edit_visual_prompts', group: 'ai_assets' },
    { id: 'view_prompt_table', labelKey: 'permissions.view_prompt_table', group: 'ai_assets' },
    { id: 'edit_prompt_table', labelKey: 'permissions.edit_prompt_table', group: 'ai_assets' },
    { id: 'view_timecode_map', labelKey: 'permissions.view_timecode_map', group: 'ai_assets' },
    { id: 'edit_timecode_map', labelKey: 'permissions.edit_timecode_map', group: 'ai_assets' },
    { id: 'view_seo_metadata', labelKey: 'permissions.view_seo_metadata', group: 'ai_assets' },
    { id: 'edit_seo_metadata', labelKey: 'permissions.edit_seo_metadata', group: 'ai_assets' },
    { id: 'view_metadata', labelKey: 'permissions.view_metadata', group: 'ai_assets' },
    { id: 'edit_metadata', labelKey: 'permissions.edit_metadata', group: 'ai_assets' },
    // Group: Actions
    { id: 'action_generate_ai_content', labelKey: 'permissions.action_generate_ai_content', group: 'actions' },
    { id: 'action_generate_thumbnail_image', labelKey: 'permissions.action_generate_thumbnail_image', group: 'actions' },
    { id: 'action_delete_project', labelKey: 'permissions.action_delete_project', group: 'actions' },
    { id: 'action_copy_project', labelKey: 'permissions.action_copy_project', group: 'actions' },
    { id: 'action_rerun_automation', labelKey: 'permissions.action_rerun_automation', group: 'actions' },
    { id: 'action_move_project', labelKey: 'permissions.action_move_project', group: 'actions' },
    // Group: Channel Management
    { id: 'manage_channel_settings', labelKey: 'permissions.manage_channel_settings', group: 'channel' },
    { id: 'manage_channel_members', labelKey: 'permissions.manage_channel_members', group: 'channel' },
    { id: 'manage_channel_roles', labelKey: 'permissions.manage_channel_roles', group: 'channel' },
    { id: 'delete_channel', labelKey: 'permissions.delete_channel', group: 'channel' },
];

export const ALL_PERMISSION_IDS = ALL_PERMISSIONS.map(p => p.id as Permission);

export const getDefaultRoles = (t: (key: string) => string): Role[] => {
    const allPermissions = ALL_PERMISSION_IDS;
    
    const editorPermissions = allPermissions.filter(p => ![
        'delete_channel',
        'manage_channel_roles',
        'manage_channel_members'
    ].includes(p));

    return [
        {
            id: 'owner',
            name: t('roles.owner'),
            permissions: allPermissions,
            isDefault: true,
        },
        {
            id: 'editor',
            name: t('roles.editor'),
            permissions: editorPermissions,
            isDefault: true,
        },
        {
            id: 'viewer',
            name: t('roles.viewer'),
            permissions: allPermissions.filter(p => p.startsWith('view_')),
            isDefault: true,
        }
    ];
};


// Automation steps now use translation keys for name and description
export const DEFAULT_AUTOMATION_STEPS: AutomationStep[] = [
    {
        id: 1,
        name: 'automation.step1.name',
        description: 'automation.step1.description',
        promptTemplate: `Analyze the provided viral video transcript to understand its structure, pacing, and core message. Extract the key hooks, main points, and the call-to-action. Based on this analysis and my target video title, create a detailed outline for my new video. The outline should adapt the successful structure of the viral video to my new topic.

**Viral Video Title:**
{{VIRAL_VIDEO_TITLE}}

**Viral Video Transcript:**
{{VIRAL_VIDEO_TRANSCRIPT}}

**My Target Video Title:**
{{TARGET_VIDEO_TITLE}}
`
    },
    {
        id: 2,
        name: 'automation.step2.name',
        description: 'automation.step2.description',
        promptTemplate: `Write a complete, engaging YouTube video script of approximately {{TARGET_VIDEO_WORD_COUNT}} words, based on the provided outline. The script must strictly adhere to my Channel DNA for tone, style, and language. Ensure the script is well-paced and conversational.

**Channel DNA:**
{{CHANNEL_DNA}}

**Script Outline from Step 1:**
{{STEP_1_OUTPUT}}

**Next Video Topic (Optional):**
{{NEXT_VIDEO_TITLE}}

**Instructions:**
- Follow the provided outline strictly.
- Ensure the final script is approximately {{TARGET_VIDEO_WORD_COUNT}} words.
- If a 'Next Video Topic' is provided, subtly hint at or create a bridge to this topic near the end of the script in the call-to-action section, encouraging viewers to look forward to the next video.
`
    },
    {
        id: 3,
        name: 'automation.step3.name',
        description: 'automation.step3.description',
        promptTemplate: `ROLE & GOAL
- Role: "The Universal VO Script Compiler".
- Goal: Based on the provided full script and the Channel DNA, compile a clean, voiceover-only script. The output should be a seamless, spoken-word text ready for a voice actor, completely free of any production notes or technical labels.

MANDATORY INPUTS
1) The full script is provided below:
   {{STEP_2_OUTPUT}}
2) The Channel DNA, which dictates the language, tone, persona, and branding:
   {{CHANNEL_DNA}}

If the script is missing, respond with:
INPUT_NEEDED: No script input found.

CONVERSION RULES (UNIVERSAL)
- Strip all production labels: [ON-SCREEN], [B-ROLL], [SFX], [LOWER-THIRD], [PI], [CALLBACK], [FACT-STRIP], [SOURCE_TAGS], [EQUIV_STRIP], [ANALOGY_STRIP], [QBANK], [SAVE_PROMPT], [VOTE_PROMPT], [COMMIT_PROMPT], [STORY_PROMPT].
- Convert the *meaning* of any stripped content into natural, spoken language. For example, a fact-strip should become a simple sentence. A source tag should be phrased conversationally (e.g., "According to [Organization Name]...").
- Strictly adhere to the **Channel DNA** for all stylistic choices:
    - **Language**: The entire output script must be in the primary language defined in the DNA.
    - **Persona & Tone**: Adopt the exact persona, tone of voice, and style (e.g., warm, humorous, serious, formal) specified in the DNA.
    - **Audience Address**: Use the specific way of addressing the audience (e.g., "Hey everyone," "Dear friends," "cô chú, anh chị") as defined in the DNA.
    - **Branding**: If the Channel DNA specifies a brand name, tagline, or intro/outro, insert it naturally at the beginning, middle, and end of the script.
    - **Disclaimer**: If the Channel DNA requires a specific disclaimer, insert it at the appropriate point in the script (e.g., before providing advice).
- Ensure logical flow and pacing, following the structure of the original script.

WORD COUNT (STRICT)
- Target: Approximately **{{TARGET_VIDEO_WORD_COUNT}}** words.
- Adhere closely to this target. Condense or slightly expand the content as needed to meet the word count while preserving the core message.

OUTPUT - SINGLE TEXT BLOCK
Provide only the final, clean, voiceover-only script as a single, continuous block of text. Do not include any headings, labels, or metadata blocks.`
    },
    {
        id: 4,
        name: 'automation.step4.name',
        description: 'automation.step4.description',
        promptTemplate: `ROLE & GOAL
You are a "Creative Content Packager & Analyst". Your goal is to create a viral-ready title and thumbnail concept, and then critically evaluate your own work to select the absolute best option.

AUTO-FETCH
- The full video script is provided below.
- The viral video title is provided for style reference.
- The Channel DNA is provided for tone and audience.

TASKS
1.  **Generate 5 Viral Titles:** Based on the script and referencing the style of the viral title, create 5 catchy, SEO-optimized YouTube titles.
2.  **Generate 3 Thumbnail Prompts:** Based on the script and the best titles, create 3 distinct and compelling prompts for an AI image generator. The prompts should be concise, focus on dynamic visual elements, and be designed to grab attention. The prompts must be in English.
3.  **Analyze & Select Best Choice:** Review the 5 titles and 3 thumbnail concepts you generated. Select the ONE title and ONE thumbnail concept that are the strongest combination.
    -   **Criteria for selection:**
        -   How closely does it match the style and emotional appeal of the reference viral title?
        -   How well does it align with the specified Channel DNA (tone, audience, style)?
        -   How high is its potential Click-Through Rate (CTR)?
    -   From the best thumbnail concept, extract the most impactful text for a two-line overlay.
4.  **Provide a Confidence Score:** Give your final selection a score out of 100, representing your confidence in its ability to go viral.

OUTPUT FORMAT (Strict)
First, provide the list of 5 titles under the heading "[TITLES]".
Second, provide the list of 3 thumbnail prompts under the heading "[THUMBNAIL_PROMPTS]".
Finally, provide your analysis and best choice in a block labeled "[BEST_CHOICE]".

**Full Video Script:**
{{STEP_2_OUTPUT}}

**Viral Video Title for reference:**
{{VIRAL_VIDEO_TITLE}}

**Channel DNA for tone and style:**
{{CHANNEL_DNA}}

--- EXAMPLE OUTPUT STRUCTURE ---
[TITLES]
1. Title Option 1
2. Title Option 2
3. Title Option 3
4. Title Option 4
5. Title Option 5

[THUMBNAIL_PROMPTS]
1. Prompt Option A
2. Prompt Option B
3. Prompt Option C

[BEST_CHOICE]
TITLE: <The single best title from the list above>
THUMBNAIL_PROMPT: <The single best thumbnail prompt from the list above>
THUMBNAIL_OVERLAY_L1: <Text for line 1 of the thumbnail overlay>
THUMBNAIL_OVERLAY_L2: <Text for line 2 of the thumbnail overlay>
CONFIDENCE_SCORE: 95/100
REASONING: <A brief, 1-2 sentence explanation of why this combination is the best choice based on the criteria.>
`
    },
    {
        id: 5,
        name: 'automation.step5.name',
        description: 'automation.step5.description',
        promptTemplate: `ROLE & GOAL
- Role: "The Viral Distribution Finisher"
- Create a concise, high-CTR publishing package: YouTube Description, Pinned Comment, Community Tab Post, Facebook Post, and Tags. The language and style must match the Channel DNA.

HANDSHAKE - ACKNOWLEDGEMENT REQUIRED
- If TITLE_FINAL & THUMB_FINAL_OVERLAY are not provided in the input below AND cannot be inferred from Step 4's output -> respond with ONLY this string:
ACK_NEEDED: Please provide TITLE_FINAL and THUMB_FINAL_OVERLAY (L1/L2).

AUTO-FETCH (Mandatory sources, in order)
1) The full script is provided below.
{{STEP_2_OUTPUT}}
2) The best title and thumbnail concepts are provided from the step below (use them as the final choice unless manual input is provided).
{{STEP_4_OUTPUT}}
3) The viral video description is provided for style reference.
{{VIRAL_VIDEO_DESCRIPTION}}
4) The Channel DNA is provided for language and tone.
{{CHANNEL_DNA}}
- If the script is missing: respond with "INPUT_NEEDED: Script is missing".

INPUTS (This data will override the automated choice from Step 4 if provided)
- TITLE_FINAL: "{{TITLE_FINAL}}"
- THUMB_FINAL_OVERLAY: {{THUMB_FINAL_OVERLAY}}
- VIDEO_URL_NEXT: "{{VIDEO_URL_NEXT}}"
- TOPIC_MAIN_KEYWORDS (3-6 keywords): {{TOPIC_MAIN_KEYWORDS}}

STYLE & LENGTH GUARDS
- Use natural, clear language as defined by the Channel DNA. Avoid complex jargon.
- Description <= 4 lines (<= 320 characters preferred before the fold), with 2-3 hashtags.
- Pinned comment <= 2 lines, ask an engaging question related to the video.
- Community Post: 2-3 lines, engaging and asks for audience interaction.
- Facebook Post: Slightly longer, more personal tone, include the video link placeholder.
- Tags: 10-15 relevant tags, comma-separated.

OUTPUT FORMAT (Strictly follow this structure)
[YT_DESCRIPTION]
<Your description here>

[PINNED_COMMENT]
<Your pinned comment here>

[COMMUNITY_POST]
<Your community post here>

[FACEBOOK_POST]
<Your Facebook post here>

[VIDEO_TAGS]
<tag1, tag2, tag3, ...>
`
    },
    {
        id: 6,
        name: 'automation.step6.name',
        description: 'automation.step6.description',
        promptTemplate: `ROLE & GOAL
- Role: "The Visual Storyboarder"
- Goal: Based on the Voiceover Script and Channel DNA, generate a list of {{TARGET_VIDEO_IMAGE_COUNT}} distinct, photo-realistic image prompts. These prompts will be used to generate visuals for the video.

MANDATORY INPUTS
1) Voiceover Script:
{{STEP_3_OUTPUT}}
2) Channel DNA (for visual style and cultural context):
{{CHANNEL_DNA}}

RULES
- Generate exactly {{TARGET_VIDEO_IMAGE_COUNT}} prompts.
- Each prompt must be unique and correspond to a segment of the script.
- Prompts must be in English.
- The style must be photo-realistic and align with the visual identity defined in the Channel DNA.
- Describe scenes, characters, actions, and emotions clearly.

OUTPUT FORMAT
Provide a numbered list of prompts, with each prompt on a new line. Do not include any other text or headings.

Example:
1. A senior man with a warm smile is looking at his phone, sitting in a cozy living room.
2. Close-up on a smartphone screen showing a health app with a rising chart.
3. A doctor in a white coat is kindly explaining something to an elderly couple.
...`
    },
    {
        id: 7,
        name: 'automation.step7.name',
        description: 'automation.step7.description',
        promptTemplate: `ROLE & GOAL
- Role: "The Production Assistant"
- Goal: Convert the list of visual prompts into a structured, two-column table and a separate CSV block for easy import into other tools.

MANDATORY INPUT
1) Visual Prompts from the previous step:
{{STEP_6_OUTPUT}}

RULES
- The table must have two columns: "No." (for the prompt number) and "Prompt" (for the prompt text).
- The CSV block must be comma-separated, with the first line being the headers: "No.","Prompt".
- Ensure all prompt text is properly formatted for both the table and the CSV.

OUTPUT FORMAT (Strictly follow this structure)
[PROMPT_TABLE]
| No. | Prompt                                                  |
|-----|---------------------------------------------------------|
| 1   | <Prompt text 1>                                         |
| 2   | <Prompt text 2>                                         |
| ... | ...                                                     |

[CSV_BLOCK]
"No.","Prompt"
1,"<Prompt text 1>"
2,"<Prompt text 2>"
...
`
    },
    {
        id: 8,
        name: 'automation.step8.name',
        description: 'automation.step8.description',
        promptTemplate: `ROLE & GOAL
- Role: "The SEO & Metadata Specialist"
- Goal: Create a comprehensive SEO profile and an FFmpeg-ready metadata file based on all previously generated assets.

MANDATORY INPUTS
- Final Title: {{TITLE_FINAL}}
- Final Description: Extracted from [YT_DESCRIPTION] in {{STEP_5_OUTPUT}}
- Final Tags: Extracted from [VIDEO_TAGS] in {{STEP_5_OUTPUT}}
- Channel DNA: {{CHANNEL_DNA}}

RULES
- SEO Profile: Provide a detailed analysis of the main keywords, secondary keywords, and LSI (Latent Semantic Indexing) keywords. Suggest ideal placement in title, description, and tags.
- FFmpeg Metadata: Create a metadata block ready to be used with FFmpeg. It should include fields like 'title', 'artist' (from Channel DNA), 'album' (from Channel DNA), 'comment' (the full description), and 'genre' (from Channel DNA).

OUTPUT FORMAT (Strictly follow this structure)
[SEO_PROFILE]
- Main Keywords: <comma-separated list>
- Secondary Keywords: <comma-separated list>
- LSI Keywords: <comma-separated list>
- Placement Strategy: <Brief strategy on using the keywords>

[FFMPEG_METADATA]
;FFMETADATA1
title={{TITLE_FINAL}}
artist=<Channel Name from DNA>
album=<Channel Topic from DNA>
comment=<Full YouTube Description from Step 5>
genre=<Channel Niche from DNA>
`
    },
    {
        id: 9,
        name: 'automation.step9.name',
        description: 'automation.step9.description',
        promptTemplate: `ROLE & GOAL
- Role: "The Post-Production Coordinator"
- Goal: Synchronize the visual prompts with the dialogue timestamps from a provided SRT file to create a final, actionable shot list.

MANDATORY INPUTS
1) Visual Prompts (as a numbered list):
{{STEP_6_OUTPUT}}
2) SRT File Content:
{{SRT_CONTENT}}

RULES
- Read the SRT content and extract the start/end times and dialogue for each segment.
- Intelligently map each numbered visual prompt from Step 6 to the most relevant dialogue segment in the SRT file.
- The final output should be a time-coded list showing when each visual should appear.

OUTPUT FORMAT (Strictly follow this structure, one entry per visual prompt)
[TIMECODE_MAP]
1. [00:00:01,234 -> 00:00:05,678] - <Visual Prompt 1 Text>
2. [00:00:05,912 -> 00:00:10,456] - <Visual Prompt 2 Text>
...
`
    }
];