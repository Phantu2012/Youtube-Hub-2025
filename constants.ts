import { ProjectStatus, AutomationStep, Dream100VideoStatus, IdeaStatus } from './types';

// The 't' function will be provided by the useTranslation hook in the component
export const getStatusOptions = (t: (key: string) => string) => [
    { value: ProjectStatus.Idea, label: t('status.idea') },
    { value: ProjectStatus.Production, label: t('status.production') },
    { value: ProjectStatus.Optimization, label: t('status.optimization') },
    { value: ProjectStatus.Completed, label: t('status.completed') },
    { value: ProjectStatus.Published, label: t('status.published') },
];

export const STATUS_COLORS: { [key in ProjectStatus]: string } = {
    [ProjectStatus.Idea]: 'bg-blue-500',
    [ProjectStatus.Production]: 'bg-purple-500',
    [ProjectStatus.Optimization]: 'bg-yellow-500',
    [ProjectStatus.Completed]: 'bg-green-500',
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
• Role: “The Universal VO Script Compiler”.
• Goal: Based on the provided full script and the Channel DNA, compile a clean, voiceover-only script. The output should be a seamless, spoken-word text ready for a voice actor, completely free of any production notes or technical labels.

MANDATORY INPUTS
1) The full script is provided below:
   {{STEP_2_OUTPUT}}
2) The Channel DNA, which dictates the language, tone, persona, and branding:
   {{CHANNEL_DNA}}

If the script is missing, respond with:
INPUT_NEEDED: No script input found.

CONVERSION RULES (UNIVERSAL)
• Strip all production labels: [ON-SCREEN], [B-ROLL], [SFX], [LOWER-THIRD], [PI], [CALLBACK], [FACT-STRIP], [SOURCE_TAGS], [EQUIV_STRIP], [ANALOGY_STRIP], [QBANK], [SAVE_PROMPT], [VOTE_PROMPT], [COMMIT_PROMPT], [STORY_PROMPT].
• Convert the *meaning* of any stripped content into natural, spoken language. For example, a fact-strip should become a simple sentence. A source tag should be phrased conversationally (e.g., "According to [Organization Name]...").
• Strictly adhere to the **Channel DNA** for all stylistic choices:
    - **Language**: The entire output script must be in the primary language defined in the DNA.
    - **Persona & Tone**: Adopt the exact persona, tone of voice, and style (e.g., warm, humorous, serious, formal) specified in the DNA.
    - **Audience Address**: Use the specific way of addressing the audience (e.g., "Hey everyone," "Dear friends," "cô chú, anh chị") as defined in the DNA.
    - **Branding**: If the Channel DNA specifies a brand name, tagline, or intro/outro, insert it naturally at the beginning, middle, and end of the script.
    - **Disclaimer**: If the Channel DNA requires a specific disclaimer, insert it at the appropriate point in the script (e.g., before providing advice).
• Ensure logical flow and pacing, following the structure of the original script.

WORD COUNT (STRICT)
• Target: Approximately **{{TARGET_VIDEO_WORD_COUNT}}** words.
• Adhere closely to this target. Condense or slightly expand the content as needed to meet the word count while preserving the core message.

OUTPUT — SINGLE TEXT BLOCK
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
• Role: “The Viral Distribution Finisher”
• Create a concise, high-CTR publishing package: YouTube Description, Pinned Comment, Community Tab Post, Facebook Post, and Tags. The language and style must match the Channel DNA.

HANDSHAKE — ACKNOWLEDGEMENT REQUIRED
• If TITLE_FINAL & THUMB_FINAL_OVERLAY are not provided in the input below AND cannot be inferred from Step 4's output -> respond with ONLY this string:
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
• If the script is missing: respond with “INPUT_NEEDED: Script is missing”.

INPUTS (This data will override the automated choice from Step 4 if provided)
• TITLE_FINAL: "{{TITLE_FINAL}}"
• THUMB_FINAL_OVERLAY: {{THUMB_FINAL_OVERLAY}}
• VIDEO_URL_NEXT: "{{VIDEO_URL_NEXT}}"
• TOPIC_MAIN_KEYWORDS (3–6 keywords): {{TOPIC_MAIN_KEYWORDS}}

STYLE & LENGTH GUARDS
• Use natural, clear language as defined by the Channel DNA. Avoid complex jargon.
• Description ≤ 4 lines (≤ 320 characters preferred before the fold), with 2-3 hashtags.
• Pinned comment ≤ 6 lines; include a 3-step summary + 1 open question + next video link.
• Community post ≤ 2 lines + 1 question + next video link (or placeholder).
• Facebook post 2-3 sentences + next video link (or placeholder).
• Tags: 12–18 tags, prioritize the language from the Channel DNA; include 2-3 channel brand tags.

RULES LEARNED FROM VIRAL VIDEO (Apply concisely)
• **ANALYZE VIRAL DESCRIPTION STRUCTURE**: Review the structure of the provided viral video's description (opening sentence, CTA placement, info layout). **LEARN FROM** that structure to create the new [YT_DESCRIPTION], while still adhering to length limits and other rules.
• Description: Natural keywords in the first 140 characters; DO NOT put links in the first line.
• Pinned comment: Should contain a summary & question -> drive initial engagement.
• Community post: 1-line question + link -> drive the next viewing session.
• FB post: Max 3 sentences, open with a pain point, close with a link.
• Include a "Save video" reminder for quick-win content; use soft CTAs, avoid absolute commands.

OUTPUT — 5 BLOCKS

1) [YT_DESCRIPTION]
• Line 1: Immediate benefit (tied to a QUICK-WIN/NEAR_TERM_PROMISE, no link).
• Line 2: 1-sentence summary of the "main content".
• Line 3: Soft CTA: "Subscribe + Save + Share with someone who needs this".
• Line 4: 2–3 hashtags from TOPIC_MAIN_KEYWORDS.
• End of description (small, 1 line): — [Channel Name from DNA] | "[Tagline from DNA]"

2) [PINNED_COMMENT]
• "3 Quick Steps to Remember" (from STEP4, each step ≤ 12 words).
• 1–2 open-ended questions.
• "Type 'I will...' to commit to this tonight."
• -> Next video: [VIDEO_URL_NEXT or <fill in later>]

3) [COMMUNITY_POST]
• 1 sentence benefit + 1 quick question (vote/reply).
• Link to [VIDEO_URL_NEXT or <fill in later>].

4) [FACEBOOK_POST]
• 2–3 sentences: pain point -> benefit tonight -> invite others to watch.
• End with a CTA: "Click to watch now: [VIDEO_URL_NEXT or <fill in later>]".
• Sign off: — [Channel Name from DNA].

5) [VIDEO_TAGS]
• 15–18 tags, not exceeding 500 characters, as a comma-separated string. Include a mix of broad and specific keywords related to the topic, plus channel brand tags.

=== OUTPUT FORMAT (EXAMPLE) ===
[YT_DESCRIPTION]
«3-4 line description, short, following the guards above.»

[PINNED_COMMENT]
• Step 1: ...
• Step 2: ...
• Step 3: ...
— What's the biggest challenge for you right now? Let me know in one line.
— Type “I will [3-word action]”.
-> Next video: [VIDEO_URL_NEXT or <fill in later>]

[COMMUNITY_POST]
“[Benefit tonight, 1 sentence]. Which step will you try first? (1) … (2) … (3) …
Watch next: [VIDEO_URL_NEXT or <fill in later>]”

[FACEBOOK_POST]
“[Pain point] keeping you up? Here's a quick tip for tonight: [very short quick-win].
3 simple, safe steps — watch here: [VIDEO_URL_NEXT or <fill in later>]
— [Channel Name from DNA]”

[VIDEO_TAGS]
... , ... , ...
`
    },
    {
        id: 6,
        name: 'automation.step6.name',
        description: 'automation.step6.description',
        promptTemplate: `ROLE & GOAL
• Role: “The Universal Visual Prompt Architect”.
• Goal: Analyze the provided voiceover script ({{STEP_3_OUTPUT}}) and the Channel DNA to create a set of photo-realistic visual prompts. The final output must be tailored to the channel's unique identity.
• Target Image Count: Generate approximately {{TARGET_VIDEO_IMAGE_COUNT}} images, distributing them evenly and focusing on key moments. Only use the necessary number of images to visually support the script.

MANDATORY INPUTS
1) Voiceover Script:
{{STEP_3_OUTPUT}}
2) Channel DNA (The master guide for all stylistic choices):
{{CHANNEL_DNA}}

If the script is missing, respond with the exact string:
INPUT_NEEDED: No STEP_3_OUTPUT found.

AUDIENCE & STYLE LOCK (DERIVED FROM CHANNEL DNA)
Strictly adhere to the provided {{CHANNEL_DNA}} to determine all visual and stylistic elements. Your analysis must extract:
• Language & Culture: Generate "PART A: Conceptual Breakdown" in the primary language of the DNA. All visual elements (characters, settings, clothing, cultural details) must be localized to match the target audience and culture described.
• Visual Style: Adopt the exact visual style specified in the DNA (e.g., photo-realistic, cinematic, minimalist, anime).
• On-Image Text: If required by the DNA, ensure text is in the correct language, font style, and adheres to any specified word limits.
• Each prompt must end with: “16:9 aspect ratio, 4K resolution.” unless the DNA specifies otherwise.

CRITICAL RULES
• Absolute Independence: Each prompt must be self-contained. Do not reference other images (e.g., "in the same room as before"). If a character reappears, describe them again sufficiently.
• Per-Sentence Cap: Maximum of 1 image per sentence in the voiceover. If a few closely related sentences form a single idea, use only one image for that group.
• No Fillers: Generate prompts only for substantive parts of the script. Follow the voiceover's order.
• Adhere to DNA: Do not introduce new brands, names, or locations not mentioned in the script or DNA.
• Image Distribution: Ensure prompts are generated for content throughout the entire script, not just the beginning. Focus on visually important moments, instructions, and key concepts. Each image should represent a scene lasting up to 4-5 seconds of screen time.

OUTPUT FORMAT (MANDATORY FOR EACH IMAGE)
For each key sentence or closely related group of sentences in the VO:

[Image Number]:
PART A: Conceptual Breakdown (in the language from Channel DNA)
Script Snippet: The first sentence of the segment, as a reference point; truncate with "..." if longer than 80 characters.
Core Meaning: [1 sentence stating the visual's purpose]
Detailed Scene Description: [Describe the static, photo-realistic scene, context, and characters as dictated by the Channel DNA]

PART B: AI Image Generation Prompt (MUST BE IN ENGLISH)
“[Image Number]. A rich, fully self-contained paragraph following the Golden Prompt Formula below.”

THE GOLDEN PROMPT FORMULA (MANDATORY ORDER)
1. “[Image Number]”.
2. Shot Type & Composition: e.g., photo-realistic close-up / medium / wide / cutaway.
3. Subject, Character & Action: Describe who/what is in the static moment, deriving all characteristics (age, ethnicity, etc.) from the Channel DNA's target audience.
4. Emotion & Body Language: Specific facial expressions and posture.
5. Clothing & Cultural Details: Culturally appropriate attire as defined by the DNA.
6. Key Elements & Symbolism: Necessary objects/subjects; no cross-prompt references.
7. Lighting & Style: Natural, warm, clean, cinematic, etc., as per the DNA.
8. Final Instruction: “16:9 aspect ratio, 4K resolution.”

ONE-PASS GENERATION (MANDATORY)
Do not ask for confirmation. Segment the script and generate all requested prompts in a single response, following the voiceover's order.

POST-PROCESS — MANDATORY EXPORT BLOCK
After printing all image prompts, EXPORT the machine-readable block below:

[STEP9_VISUAL_EXPORT]
{
  "version": "UNIVERSAL-1.2",
  "name": "S9_VisualSet_<YYYYMMDD>_<6char>",
  "session_id": "S9-<YYYYMMDD>-<6char>",
  "refs": { "step4_found": <true|false>, "step5_found": <true|false> },
  "source_vo_lang": "<language code from DNA, e.g., vi, en, es>",
  "image_count": "<int>",
  "per_sentence_cap_respected": true,
  "golden_formula_enforced": true,
  "static_only": true,
  "no_cross_prompt_refs": true,
  "segments": [
    {
      "id": "img_01",
      "src_first_sentence": "<first sentence of script segment...>",
      "purpose": "...",
      "shot": "close/medium/wide/cutaway",
      "prompt_en": "...16:9 aspect ratio, 4K resolution."
    }
  ],
  "compliance": "<yes|no>"
}
[/STEP9_VISUAL_EXPORT]
`
    },
    {
        id: 7,
        name: 'automation.step7.name',
        description: 'automation.step7.description',
        promptTemplate: `ROLE & GOAL
Bạn là “The Prompt Table Builder.”
Chuyển bộ prompt ảnh mới nhất từ output của bước 6 thành bảng 2 cột (STT, Prompt) để nhập spreadsheet/CSV. Không viết lại. Không lược bớt. Giữ nguyên từng PART B prompt (English) gồm cả chỉ mục trong ngoặc vuông ở đầu.

ZERO-INPUT — AUTO FETCH (BẮT BUỘC)
Load mới nhất output của bước 6 dưới đây.
{{STEP_6_OUTPUT}}

Nếu không có dữ liệu -> in chính xác chuỗi:
INPUT_NEEDED: No Visual Prompts output found.

WHAT TO EXTRACT (CHUẨN HOÁ)
// FIX: Replaced unicode ellipsis with standard three dots to prevent parsing errors.
STT = chỉ số ảnh (01, 02, ..., 50).
// FIX: Replaced unicode ellipsis with standard three dots to prevent parsing errors.
Nếu thiếu số trong nguồn -> suy ra theo thứ tự rồi chèn đủ 2 chữ số.
// FIX: Replaced unicode ellipsis with standard three dots to prevent parsing errors.
Nếu trùng số: giữ bản đầu, các bản sau ghi 07_b, 07_c... trong cột STT (Prompt giữ nguyên).
// FIX: Replaced unicode ellipsis with standard three dots to prevent parsing errors.
Prompt = toàn bộ đoạn PART B prompt (English) cho ảnh đó, bao gồm cả bracket index đầu câu (ví dụ: [01]. A photo-realistic...).
// FIX: Replaced unicode ellipsis with standard three dots to prevent parsing errors.
Tuyệt đối không thêm bớt; giữ nguyên chấm phẩy, dấu cách, câu chữ, kết thúc...
Kết thúc đúng như gốc từ STEP 9 (mặc định là “16:9 aspect ratio, 4K resolution.”).

OUTPUT FORMAT — 2 PHẦN BẮT BUỘC
PART A — Tab-Separated Output (for Spreadsheets)
Create a Tab-Separated Value (TSV) block. This format is for easy pasting into spreadsheet applications.
RULES:
- The first line must be the headers: STT (tab) Prompt
- Each subsequent line must contain the ID, a single TAB character, and the prompt text.
- DO NOT use Markdown pipes (|), commas (,), or any other visible characters to separate columns.
- Do not add any commentary outside this block.

PHẦN B — CSV CODE BLOCK
In một code block dạng CSV tiêu đề: STT,Prompt
Mỗi hàng = 1 prompt, bọc Prompt trong dấu ngoặc kép "; nếu trong prompt có dấu " thì escape thành "".
File name gợi ý: visual_prompts_table_step10.csv (không in link; chỉ in block CSV).

Lưu ý: Nếu tổng prompt <1 -> in đúng chuỗi: “INPUT_NEEDED: Empty STEP9 prompt list.”

POST-PROCESS — MANDATORY EXPORT BLOCK
Cuối câu trả lời, XUẤT block máy-đọc:
[STEP10_PROMPT_TABLE_EXPORT]
{
  "version": "VN-1.2",
  "name": "S10_PromptTable_<YYYYMMDD>_<6char>",
  "session_id": "S10-<YYYYMMDD>-<6char>",
  "refs": {
    "step9_found": <true|false>,
    "step14_fallback_used": <true|false>
  },
  "row_count": <int>,
  "batches": <int>,
  "csv_block_included": true,
  "index_conflicts": <int>,
  "inferred_indices": <int>,
  "compliance": "<yes|no>"
}
[/STEP10_PROMPT_TABLE_EXPORT]`
    },
    {
        id: 8,
        name: 'automation.step8.name',
        description: 'automation.step8.description',
        promptTemplate: `ROLE & GOAL
You are "The Universal Metadata Architect". Your goal is to generate a complete, clean, and consistent Raw SEO Profile and an FFmpeg-ready metadata.txt file.
All branding, language, links, and stylistic information MUST be derived from the provided Channel DNA. Do not hardcode any values.

AUTO-FETCH (MANDATORY)
1.  **Channel DNA**: The master guide for all branding, language, and style.
    {{CHANNEL_DNA}}
2.  **Final Title/Thumbnail Concept**: From Step 4.
    {{STEP_4_OUTPUT}}
    If missing, respond with: INPUT_NEEDED: No STEP4_OUTPUT found.
3.  **Distribution Package**: From Step 5 for Description and Tags.
    {{STEP_5_OUTPUT}}
    If missing, respond with: INPUT_NEEDED: No STEP5_OUTPUT found.

CORE LOGIC & RULES
1.  **Analyze Channel DNA**: Before generating anything, thoroughly analyze the Channel DNA to extract the following:
    -   **Channel Name**: For author, artist, publisher fields.
    -   **Copyright Info**: For the copyright field.
    -   **Primary Language**: For the language field (e.g., 'en', 'vi', 'es').
    -   **Key Links**: Such as a "Subscribe" link or main "Playlist" link.
    -   **Brand-Specific Identifiers**: Like an encoder name or series name for the album field.

2.  **Time & Timezone**:
    -   All times are based on the execution date.
    -   Assume timezone is UTC+7 (Asia/Ho_Chi_Minh) unless specified otherwise in DNA.
    -   Default publish time is 06:15:15 local time.
    -   Calculate \`creation_time_utc\` by subtracting 7 hours from local time (YYYY-MM-DDTHH:MM:SSZ).

3.  **Filename Generation**:
    -   Identify the "Spearhead Keyword" (the first long-tail keyword from Step 5's tags). If unavailable, infer a 3-6 word natural phrase from the final title.
    -   Generate two filenames, lowercase, using hyphens or underscores, no spaces:
        -   \`<spearhead-keyword>_video.mp4\`
        -   \`<spearhead-keyword>_thumbnail.jpg\`

4.  **Description & Link Injection**:
    -   Use the description generated in Step 5.
    -   Scan the description. If key links (like Subscribe) found in the Channel DNA are missing, inject them appropriately (e.g., at the end or in a "Helpful Resources" section).

5.  **FFmpeg Metadata Rules**:
    -   For \`metadata.txt\`, \`description\` and \`comment\` fields must be a single line (merge with spaces).
    -   Sanitize these fields by removing special characters: / \\ | > < : * ? % & # " ' \\\`
    - Allowed characters: letters, numbers, periods, commas, hyphens, underscores.

OUTPUT — THREE EXACT SECTIONS

PART A: Optimized Filenames
-   **Video Filename (.mp4):** <auto-generated from spearhead keyword>
-   **Thumbnail Filename (.jpg):** <auto-generated from spearhead keyword>

PART B: Detailed Metadata Plan
-   **title:** <auto-fetch from Step 4 Best Choice>
-   **keywords:** <auto-fetch from Step 5 tags; replace commas with semicolons>
-   **description:** <paste the full description block from Step 5, ensuring links from DNA are injected>
-   **comment:** <paste the exact same description, followed by a new line with "Primary Keywords: <spearhead keyword>, <keyword 2>, <keyword 3>">
-   **subject:** <auto-generate a 3-5 word summary from the title/tags>
-   **author:** <auto-fetch Channel Name from DNA>
-   **artist:** <auto-fetch Channel Name from DNA>
-   **publisher:** <auto-fetch Channel Name from DNA>
-   **copyright:** <auto-fetch Copyright info from DNA>
-   **genre:** Education (or infer from DNA/topic)
-   **encoded_by:** <auto-fetch brand identifier from DNA, or generate one like "BRAND-MASTER-YYYY">
-   **language:** <auto-fetch primary language code from DNA (e.g., vi, en)>
-   **year:** <current year>
-   **creation_time_local_gmt+7:** <auto-generate based on rules>
-   **creation_time_utc:** <auto-generate based on rules>
-   **album:** <auto-fetch series name from DNA, or leave empty>
-   **track:** <auto-fetch episode number if applicable, or leave empty>

PART C: metadata.txt (FFmpeg - single code block, no explanation)
title=<from Step 4>
description=<single-line, sanitized description from Step 5 with injected links>
comment=<single-line description> Primary Keywords: <spearhead>, <kw2>, <kw3>
keywords=<semicolon-separated tags>
subject=<3-5 word summary>
author=<from DNA>
artist=<from DNA>
publisher=<from DNA>
encoded_by=<from DNA or generated>
genre=<Education or inferred>
language=<from DNA>
creation_time=<UTC ISO: YYYY-MM-DDTHH:MM:SSZ>
year=<current year>
copyright=<from DNA>
album=
track=
`
    },
    {
        id: 9,
        name: 'automation.step9.name',
        description: 'automation.step9.description',
        promptTemplate: `ROLE & GOAL
Bạn là “The SRT Merge Mapper.” Nhiệm vụ của bạn là tạo một bản đồ timecode.
1. **NẾU CÓ SRT:** Tìm thời điểm bắt đầu cho từng mục trong output của bước 6 bằng cách đối khớp nội dung với câu thoại trong SRT.
2. **NẾU KHÔNG CÓ SRT:** Tạo một bảng và JSON mặc định mà không có thời gian, ghi "NOT_FOUND" cho tất cả "Start Time".

REQUIRED INPUTS
1. The output from step 6 is provided below:
{{STEP_6_OUTPUT}}

2. The raw SRT content is provided below (CÓ THỂ TRỐNG):
{{SRT_CONTENT}}

WHEN NO INPUT
Nếu không tìm thấy output của bước 6: in chính xác
INPUT_NEEDED: No visual prompt output found.

EXECUTION LOGIC (STRICT)

**PATH A: IF SRT_CONTENT IS PROVIDED AND NOT EMPTY**
- Follow the matching logic below to find the correct Start Time for each script snippet.
- CONTENT MATCHING LOGIC:
  - Exact contains (case-insensitive): Find the first unused cue in the SRT that contains the "Script Snippet" as a substring.
  - Normalized contains: If no match, normalize both strings (lowercase, trim, remove extra spaces) and search again.
  - Fuzzy token match (threshold ≥ 0.82): If still no match, use a fuzzy token match and pick the earliest unused cue with the highest score ≥ 0.82.
  - Lock cue after matching to prevent reuse.
- If a match is not found for a snippet, its Start Time must be "NOT_FOUND".

**PATH B: IF SRT_CONTENT IS EMPTY OR WHITESPACE**
- For every script snippet found in the STEP_6_OUTPUT, generate a row.
- The "Start Time" for EVERY row MUST be exactly "NOT_FOUND".
- Do not perform any matching.

OUTPUT FORMAT — EXACT 3-COLUMN TAB-SEPARATED TABLE (FOR SPREADSHEETS)
Create a Tab-Separated Value (TSV) block for easy pasting into spreadsheets.
RULES:
- The first line must be the headers: STT (tab) Start Time (hh:mm:ss,ms) (tab) Đoạn Kịch Bản
- Each subsequent line must contain the STT, a single TAB character, the Start Time, a single TAB character, and the Script Snippet.
- DO NOT use Markdown pipes (|).
- STT: keep zero-padding 01…50.
- Start Time: HH:MM:SS,mmm or NOT_FOUND.
- Script Snippet: paste the original snippet from the step 6 output.

VALIDATION REPORT (≤6 dòng, sau bảng)
- If PATH B was used, state: "SRT was not provided. Default times used." and set stats to 0.
- Otherwise, generate the normal report:
Not found (STT): ...
SRT leftover cue indices: ...
Malformed timecodes fixed: N
Fuzzy matches used (≥0.82): N
Potential duplicates (same cue matched twice): none|list

POST-PROCESS — MANDATORY EXPORT BLOCK
Cuối câu trả lời, XUẤT block máy-đọc để pipeline dùng tiếp:
[STEP11_TIMECODE_MAP_EXPORT]
{
  "version": "1.5",
  "name": "S11_TimecodeMap_<YYYYMMDD>_<6char>",
  "session_id": "S11-<YYYYMMDD>-<6char>",
  "refs": {
    "step9_found": true,
    "step14_fallback_used": false
  },
  "rows": [
    { "stt": "01", "start_time": "00:00:03,120", "script_snippet": "<Đoạn Kịch Bản từ S9>" },
    { "stt": "02", "start_time": "NOT_FOUND", "script_snippet": "<...>" }
  ],
  "stats": {
    "matched": <int>,
    "not_found": <int>,
    "fuzzy_used": <int>,
    "malformed_times_fixed": <int>,
    "srt_leftover_indices": "<compact ranges or empty, or 'N/A' if SRT not provided>"
  },
  "compliance": "yes"
}
[/STEP11_TIMECODE_MAP_EXPORT]`
    }
];