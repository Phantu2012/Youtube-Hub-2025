import { ProjectStatus, AutomationStep } from './types';

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

**Target Word Count:**
{{TARGET_VIDEO_WORD_COUNT}}

**Script Outline from Step 1:**
{{STEP_1_OUTPUT}}
`
    },
    {
        id: 3,
        name: 'automation.step3.name',
        description: 'automation.step3.description',
        promptTemplate: `VAI TRÒ & MỤC TIÊU
• Role: “The VO-Only Compiler for Senior Health”.
• Mục tiêu: TỔNG HỢP duy nhất PHẦN VO tiếng Việt (giọng nam, ấm, chậm rãi, dễ nghe cho 60+), 
  theo đúng kênh “Sức Khỏe Người Cao Tuổi” – Tagline: “Sống Vui, Sống Khỏe. Từ Hôm Nay!”.
• Không chèn hướng dẫn sản xuất (không [B-ROLL]/[ON-SCREEN]/[SFX]/nhãn kỹ thuật). 
  Chỉ là đoạn văn VO liền mạch, có ngắt câu tự nhiên.

AUTO-FETCH (ƯU TIÊN NGUỒN)
1) The full script is provided below:
   {{STEP_2_OUTPUT}}
2) If the script is missing, respond with:
   INPUT_NEEDED: No script input found.

CHUYỂN ĐỔI → VO-ONLY
• Bỏ toàn bộ nhãn sản xuất: [ON-SCREEN]/[B-ROLL]/[SFX]/[LOWER-THIRD]/[PI]/[CALLBACK]/[FACT-STRIP]/
  [SOURCE_TAGS]/[EQUIV_STRIP]/[ANALOGY_STRIP]/[QBANK]/[SAVE_PROMPT]/[VOTE_PROMPT]/[COMMIT_PROMPT]/[STORY_PROMPT].
• Giữ **ý nghĩa nội dung** của các strip & prompts, nhưng **chuyển thành câu nói tự nhiên**:
  – FACT-STRIP → 1 câu số liệu ngắn, thêm mức chứng cứ (A/B/C) bằng chữ thường, không ngoặc.
  – SOURCE_TAGS → “Theo [Tên Việt hoá], [Năm]…”. Không đọc DOI/link.
  – EQUIV/ANALOGY → nói đời thường, thêm “ước tính/khoảng” khi cần.
  – CTA → giữ trong VO (like/share/đăng ký/lưu/vote/commit/kể chuyện), **giảm lặp**, ngắn gọn.
• Chèn **brand mềm** 3 điểm: 
  – Mở đầu/giữa/cuối: “Kênh Sức Khỏe Người Cao Tuổi — Sống Vui, Sống Khỏe. Từ Hôm Nay!”
  – Cài tự nhiên, không máy móc; tối đa 1 lần/điểm.
• Persona & ngôn ngữ:
  – “Người con đồng hành” (xưng “mình/tôi” linh hoạt). 
  – “ạ” tiết chế: ≤1 lần mỗi 4–6 câu; tổng VO ≤12 lần.
  – Câu ngắn ≤18 từ; trung lập, ấm áp; ưu tiên động từ đơn giản.
• Disclaimer: 1 câu **trước** cụm giải pháp: “Nội dung mang tính giáo dục, không thay thế tư vấn y khoa cá nhân.”
• Phân biệt “liên quan” ≠ “gây ra”; không mệnh lệnh tuyệt đối/khẳng định quá mức.

CẤU TRÚC & NHỊP (KẾ THỪA STEP 4)
• Theo thứ tự logic của kịch bản gốc.
• Không in tiêu đề mục; viết thành đoạn văn liên tục, ngắt đoạn hợp lý.
• Pattern break = câu hỏi ngắn/recap 1 dòng/hướng dẫn vi mô (“Bạn có thể thử…”), mỗi 120–180 từ một lần.
• CTA sandwich: sớm (≤90s) / giữa (sau phần giải pháp) / cuối (tổng kết).
• Cài “khi nào cần gặp bác sĩ” gọn & rõ (3 cờ đỏ).

EVIDENCE — TRÌNH BÀY ĐỜI THƯỜNG
• Chỉ nói: Tên Việt hoá + Năm (không đọc DOI/link). 
• Câu mẫu: 
  – “Các bác sĩ tại [Tên tổ chức], [Năm], ghi nhận rằng…” 
  – “Nghiên cứu gần đây cho thấy…, theo [Tên tổ chức], [Năm].”
• Nếu thiếu nguồn cụ thể trong input, diễn đạt trung tính (“Các chuyên gia cho rằng…”), tránh %.

ĐỘ DÀI & KIỂM ĐỊNH (STRICT)
• Mục tiêu: 3.500–4.000 từ (VN). **Floor**: ≥3.500 từ.
• **QUY TẮC TUYỆT ĐỐI: KHÔNG VƯỢT QUÁ 4.000 TỪ.** Hãy cô đọng nội dung nếu cần để tuân thủ giới hạn này.
• Nếu dự kiến <3.500 từ → tự thêm “CTA Extension Block” (recap 5 dòng, plan 3 ngày, self-check 5–7 dòng, 
  nhắc save/share) đến khi ≥3.500 (không vượt +800 từ).
• Báo **[WORD_AUDIT]**: số từ từng phần chính & tổng, không bịa số.

ĐẦU RA — CHỈ 2 KHỐI
1) [VO_VIET_ONLY]
   – Toàn bộ VO liền mạch, không nhãn kỹ thuật, không link.
   – Có brand mềm (intro/mid/outro), disclaimer, CTA sandwich, cờ đỏ.
2) [STEP5_EXPORT]
   – Metadata máy-đọc để các bước sau auto-fetch (format bên dưới).

VARIATION GUARDS
• Cấm lặp 1 cụm 4–6 từ >2 lần/1 đoạn dài ~150–200 từ.
• Xoay vòng chuyển ý: “Nói gọn lại…/Để khỏi quên…/Bạn có thể thử…/Khi nào nên gọi bác sĩ…”.
• Không có câu >26 từ; nếu có, tự tách.
• Gom “khi nào gọi bác sĩ” về một đoạn duy nhất gần cuối.

— KHỐI XUẤT METADATA —
[STEP5_EXPORT]
{
  "version": "3.0",
  "name": "S5_VO_<slug_topic>_<YYYYMMDD>_<6char>",
  "session_id": "S5-<YYYYMMDD>-<6char>",
  "time_utc": "<ISO801>",
  "refs": {
    "step4_found": <true|false>,
    "step3a_found": <true|false>,
    "step3b_found": <true|false>,
    "mrp_found": <true|false>,
    "topic_config_found": <true|false>
  },
  "locks": {
    "word_target": "3500–4000",
    "word_floor_min": 3500,
    "max_sentence_words": 26,
    "cta_sandwich": true,
    "disclaimer_required": true,
    "brand_inserts_intro_mid_outro": true
  },
  "word_audit": {
    "hook": <int>, "setup": <int>, "quickwin": <int>,
    "mechanism": <int>, "solutions": <int>,
    "foundation": <int>, "risk_payoff": <int>, "summary": <int>,
    "total": <int>,
    "cta_extension_applied": <true|false>, "cta_extension_words": <int>
  },
  "compliance": {
    "no_production_labels": true,
    "evidence_vo_style_ok": true,
    "persona_tone_ok": true,
    "sensitive_warnings_present": <true|false>
  },
  "notes": ["duplication_filter: ok|fix","pattern_breaks_ok|fix","cta_variety_ok|fix"]
}
[/STEP5_EXPORT]`
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
• Tạo gói xuất bản ngắn gọn, CTR cao cho người Việt: Mô tả YouTube, Ghim bình luận, Community Tab, Bài Facebook, Tag.

HANDSHAKE — YÊU CẦU SAU KHI NHẬN CÂU LỆNH
• Nếu chưa có TITLE_FINAL & THUMB_FINAL_OVERLAY trong input dưới đây VÀ chúng cũng không thể được suy ra từ output của Bước 4 → chỉ trả đúng chuỗi:
ACK_NEEDED: Vui lòng gửi TITLE_FINAL và THUMB_FINAL_OVERLAY (L1/L2).

AUTO-FETCH (nguồn bắt buộc, theo thứ tự)
1) The full script is provided below.
{{STEP_2_OUTPUT}}
2) The best title and thumbnail concepts are provided from the step below (use them as the final choice unless manual input is provided).
{{STEP_4_OUTPUT}}
3) The viral video description is provided for style reference.
{{VIRAL_VIDEO_DESCRIPTION}}
• Nếu thiếu script: trả “INPUT_NEEDED: Script is missing”.

INPUT (dữ liệu này sẽ ghi đè lên lựa chọn tự động từ Bước 4 nếu được cung cấp)
• TITLE_FINAL: "{{TITLE_FINAL}}"
• THUMB_FINAL_OVERLAY: {{THUMB_FINAL_OVERLAY}}
• VIDEO_URL_NEXT: "{{VIDEO_URL_NEXT}}"
• TOPIC_MAIN_KEYWORDS (3–6 từ khoá VN): {{TOPIC_MAIN_KEYWORDS}}

STYLE & LENGTH GUARDS
• Tiếng Việt đời thường, ngắn, rõ; tránh y khoa phức tạp.
• Description ≤ 4 dòng (≤ 320 ký tự ưu tiên trước fold), kèm 2–3 hashtag.
• Pinned comment ≤ 6 dòng; có 3 bước tóm tắt + 1 câu hỏi mở + link video sau.
• Community post ≤ 2 dòng + 1 câu hỏi + link video sau (hoặc placeholder).
• Facebook post 2–3 câu + link video sau (hoặc placeholder).
• Tags: 12–18 tag, ưu tiên VN; có 2–3 brand tag kênh.

RULES HỌC TỪ VIDEO VIRAL (ÁP DỤNG NGẮN GỌN)
• **PHÂN TÍCH CẤU TRÚC MÔ TẢ VIRAL**: Xem xét cách mô tả của video viral (được cung cấp) sắp xếp câu mở đầu, CTA, và thông tin. **HỌC HỎI** cấu trúc đó để tạo [YT_DESCRIPTION] mới, nhưng vẫn tuân thủ giới hạn độ dài và các quy tắc khác.
• Mô tả: từ khoá tự nhiên ở 140 ký tự đầu; KHÔNG đặt link dòng 1.
• Pinned comment: chứa tóm tắt & câu hỏi → tăng bình luận đầu.
• Community: câu hỏi 1 dòng + link → đẩy phiên xem kế tiếp.
• FB: tối đa 3 câu, mở bằng điểm đau, đóng bằng link; không dùng thuật ngữ.
• Nhắc “Lưu video” khi có QUICK-WIN; CTA mềm, tránh mệnh lệnh tuyệt đối.

OUTPUT — 5 KHỐI

1) [YT_DESCRIPTION]
• Dòng 1: lợi ích gần (gắn QUICK-WIN/NEAR_TERM_PROMISE, không link).
• Dòng 2: 1 câu tóm “nội dung chính” (3 trụ từ STEP4).
• Dòng 3: CTA mềm: “Đăng ký + Lưu + Chia sẻ cho người thân”.
• Dòng 4: 2–3 hashtag từ TOPIC_MAIN_KEYWORDS.
• Cuối mô tả (nhỏ, 1 dòng): — Sức Khỏe Người Cao Tuổi | “Sống Vui, Sống Khỏe. Từ Hôm Nay!”

2) [PINNED_COMMENT]
• “3 Bước Nhớ Nhanh” (từ STEP4, mỗi bước ≤ 12 từ).
• 1–2 câu hỏi mở (từ QBANK phù hợp chủ đề).
• “Gõ ‘Tôi sẽ…’ để cam kết tối nay”.
• 👉 Video tiếp theo: [VIDEO_URL_NEXT hoặc <điền sau>]

3) [COMMUNITY_POST]
• 1 câu lợi ích + 1 câu hỏi (vote/trả lời nhanh).
• Link ngắn gọn tới [VIDEO_URL_NEXT hoặc <điền sau>].

4) [FACEBOOK_POST]
• 2–3 câu: điểm đau → lợi ích tối nay → mời người thân xem.
• Kết 1 câu CTA: “Bấm xem ngay: [VIDEO_URL_NEXT hoặc <điền sau>]”.
• Ký tên: — Sức Khỏe Người Cao Tuổi.

5) [VIDEO_TAGS]
• 15–18 tag không vượt quá 500 ký tự, dạng chuỗi phẩy-kép:
  sức khỏe người cao tuổi, [từ khoá 1], [từ khoá 2], [từ khoá 3],
mẹo tại nhà, dinh dưỡng lành mạnh, giấc ngủ người già, tập nhẹ buổi tối,
an toàn thực phẩm, nước uống điện giải nhẹ, [chủ đề phụ 1], [chủ đề phụ 2],
SucKhoeNguoiCaoTuoi, SKNCT, SongVuiSongKhoe

=== OUTPUT FORMAT (MẪU SINH NỘI DUNG) ===
[YT_DESCRIPTION]
«Mô tả 3–4 dòng, ngắn, theo guard trên.»

[PINNED_COMMENT]
• Bước 1: …
• Bước 2: …
• Bước 3: …
— Cô chú/anh chị đang vướng nhất ở bước nào? Trả lời 1 dòng nhé.
— Gõ “Tôi sẽ [hành động 3 chữ]”.
👉 Video tiếp theo: [VIDEO_URL_NEXT hoặc <điền sau>]

[COMMUNITY_POST]
“[Lợi ích tối nay, 1 câu]. Bạn chọn làm bước nào trước? (1) … (2) … (3) …
Xem tiếp: [VIDEO_URL_NEXT hoặc <điền sau>]”

[FACEBOOK_POST]
“[Điểm đau] khiến mình mất ngủ? Có cách làm ngay tối nay: [quick-win rất ngắn].
3 bước gọn nhẹ, an toàn tại nhà — mời cô chú/anh chị xem: [VIDEO_URL_NEXT hoặc <điền sau>]
— Sức Khỏe Người Cao Tuổi”

[VIDEO_TAGS]
… , … , …

=== EXPORT BLOCK ===
[STEP7_EXPORT]
{
  "version":"1.1",
  "name":"S7_Distribution_<YYYYMMDD>_<6char>",
  "session_id":"S7-<YYYYMMDD>-<6char>",
  "refs":{"step4_found":true|false,"dna_channel":true,"topic_config":true},
  "inputs":{"title_final": "<provided|missing>","thumb_overlay":"<provided|missing>","video_url_next":"<provided|placeholder>"},
  "assets":{"yt_description":true,"pinned_comment":true,"community_post":true,"facebook_post":true,"video_tags_count":<int>},
  "length_ok":{"desc_chars_approx":"<=320","pinned_lines":"<=6","community_lines":"<=2","fb_sentences":"<=3"},
  "notes":["links_not_in_first_line_desc","cta_soft_ok","brand_tagline_in_desc_tail"]
}
`
    },
    {
        id: 6,
        name: 'automation.step6.name',
        description: 'automation.step6.description',
        promptTemplate: `ROLE & GOAL
Bạn là “The Visual Prompt Architect (VN)”. Phân tích voiceover tiếng Việt ở output của bước 3 và tạo bộ prompt ảnh tĩnh photo-realistic cho khán giả người Việt 60+.
Mục tiêu: minh hoạ liên tục, không ngắt quãng cho video 20–30 phút với khoảng {{IMAGE_COUNT}} ảnh. Chỉ dùng số ảnh đủ cần thiết.
Mỗi prompt tự thân đầy đủ và kết thúc bằng: “16:9 aspect ratio, 4K resolution.”

ZERO-INPUT — AUTO FETCH (BẮT BUỘC)
Tải output của bước 3 dưới đây làm nguồn duy nhất.
{{STEP_3_OUTPUT}}

Nếu không có output của bước 3 → trả đúng chuỗi:
INPUT_NEEDED: No VO script output found.

AUDIENCE & STYLE LOCK (ABSOLUTE)
Bản địa hoá Việt Nam: nhân vật lớn tuổi người Việt Nam (60–90), đa miền Bắc/Trung/Nam; bối cảnh quen thuộc (nhà mái ngói, cảnh đồng quê, chợ quê, công viên, phòng khám…), chọn phù hợp chủ đề.
Photo-realistic, ánh sáng tự nhiên, cảm xúc chân thực; trang phục giản dị (áo sơ mi, cardigan, áo bà ba hiện đại, giày đi bộ).
Ảnh tĩnh: mô tả khoảnh khắc đóng băng; cấm từ gợi chuyển động/animation.
Nội tạng/y học: cutaway/ghosted overlay trong suốt, tối giản, không gây sợ hãi.
On-image text (nếu cần): bold, dark-colored, chữ to, tiếng Việt, ≤5 từ/dòng.
Kết thúc mỗi prompt bằng: “16:9 aspect ratio, 4K resolution.”

CRITICAL RULES
Độc lập tuyệt đối: không tham chiếu ảnh khác; nhân vật lặp lại phải mô tả lại đủ.
Per-Sentence Cap: tối đa 1 ảnh/1 câu trong VO; nếu gộp vài câu liên hệ chặt, vẫn chỉ 1 ảnh cho nhóm đó.
Không filler; đi đúng thứ tự VO.
Không thêm tên riêng/địa danh/brand mới; không hứa hẹn trị bệnh trên ảnh.

OUTPUT FORMAT (TOKEN-SAVING)
For each image, provide ONLY the AI Image Generation Prompt (English).
DO NOT include "PART A: Conceptual Breakdown".
The format for each prompt should be:
"[Image Number]. A rich, fully self-contained paragraph following the Golden Prompt Formula below."


THE GOLDEN PROMPT FORMULA (THỨ TỰ BẮT BUỘC)
“[Image Number]”.
Shot Type & Composition: photo-realistic close-up / medium / wide / cutaway.
Subject, Character & Action: ai/cái gì ở khoảnh khắc tĩnh (mô tả lại đủ).
Emotion & Body Language: nét mặt, tư thế cụ thể.
Clothing & Cultural Details: trang phục phù hợp với người già Việt Nam.
Key Elements & Symbolism: vật thể/chủ thể cần có; không tham chiếu prompt khác.
Lighting & Style: tự nhiên, ấm, chân thực, sạch.
Final Instruction: “16:9 aspect ratio, 4K resolution.”

ONE-PASS GENERATION (BẮT BUỘC)
Không yêu cầu bước “OK” xác nhận.
Phân đoạn & sinh prompt trong 1 lần: xuất từ 1 đến tối đa {{IMAGE_COUNT}} ảnh ngay lập tức, theo thứ tự VO.
Nếu VO quá ngắn/dài → scale số ảnh ≤{{IMAGE_COUNT}}, vẫn tuân ≤1 ảnh/câu.

POST-PROCESS — MANDATORY EXPORT BLOCK
Sau khi in toàn bộ ảnh, XUẤT block máy-đọc:
[STEP9_VISUAL_EXPORT]
{
  "version": "VN-1.1",
  "name": "S9_VisualSet_<YYYYMMDD>_<6char>",
  "session_id": "S9-<YYYYMMDD>-<6char>",
  "refs": { "step4_found": true, "step5_found": true },
  "source_vo_lang": "vi",
  "image_count": <int>,
  "per_sentence_cap_respected": true,
  "brand_touch": {"intro": true, "outro": true},
  "golden_formula_enforced": true,
  "static_only": true,
  "no_cross_prompt_refs": true,
  "segments": [
    {
      "id": "img_01",
      "src_first_sentence": "<câu đầu (≤70 ký tự, cắt nếu cần)…>",
      "purpose": "…",
      "shot": "close/medium/wide/cutaway",
      "prompt_en": "…16:9 aspect ratio, 4K resolution."
    }
  ],
  "diversity_check": { "gender_mix": "ok|needs_more_variety", "age_range": "60-90", "regions": ["north","central","south"] },
  "compliance": "<yes|no>"
}
[/STEP9_VISUAL_EXPORT]`,
        settings: [
            {
                key: 'IMAGE_COUNT',
                label: 'automation.step6.settings.imageCount',
                type: 'number',
                defaultValue: 45
            }
        ]
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

Nếu không có dữ liệu → in chính xác chuỗi:
INPUT_NEEDED: No Visual Prompts output found.

WHAT TO EXTRACT (CHUẨN HOÁ)
STT = chỉ số ảnh (01, 02, …, 50).
Nếu thiếu số trong nguồn → suy ra theo thứ tự rồi chèn đủ 2 chữ số.
Nếu trùng số: giữ bản đầu, các bản sau ghi 07_b, 07_c… trong cột STT (Prompt giữ nguyên).
Prompt = toàn bộ đoạn PART B prompt (English) cho ảnh đó, bao gồm cả bracket index đầu câu (ví dụ: [01]. A photo-realistic…).
Tuyệt đối không thêm bớt; giữ nguyên chấm phẩy, dấu cách, câu chữ, kết thúc…
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

Lưu ý: Nếu tổng prompt <1 → in đúng chuỗi: “INPUT_NEEDED: Empty STEP9 prompt list.”

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
        promptTemplate: `[STEP 8 — RAW SEO PROFILE + FFmpeg METADATA.TXT (VN-READY v1.4)]
(ZERO-INPUT • AUTO-FETCH S1→S9→S10→S7/S5→S4→S3→S2 • PUBLISH_TIME 05:00/17:00 VN • AUTO UTC • PRIMARY KEYWORDS • LINK INJECTION)

ROLE & GOAL
Bạn là “The Metadata Architect”. Sinh Hồ Sơ SEO Thô đầy đủ, sạch, đồng nhất với dữ liệu đã chốt (title/thumbnail, description, tags). Đồng thời xuất metadata.txt chuẩn FFmpeg (key=value, mỗi dòng một field) để embed. Không spam từ khóa. Củng cố thương hiệu kênh.

Bổ sung: luôn thêm 1 dòng Primary Keywords: <3 cụm> vào cuối comment (lấy từ spearhead + 2 keyword phụ trong tags).

ZERO-INPUT — FETCH ORDER (STRICT)

S1 (nếu có) → lấy phong cách & từ khóa nền (không bắt buộc).
Viral Video Transcript: {{VIRAL_VIDEO_TRANSCRIPT}}

S9_NOTIFY_EXPORT (bắt buộc) → Title/Thumb đã khóa.
Step 4 Output: {{STEP_4_OUTPUT}}

Nếu thiếu → in nguyên văn:
INPUT_NEEDED: No STEP4_OUTPUT found.

S10_EXPORT (ưu tiên) → lấy A) VIDEO DESCRIPTION & F) TAGS (CSV).
Step 5 Output: {{STEP_5_OUTPUT}}

Nếu thiếu S10 → fallback:

S7_EXPORT (VN) hoặc S5_EXPORT (VO) + S4_EXPORT (chapters) → dựng mô tả theo template Step 10.
Step 7 Output: {{STEP_7_OUTPUT}}
Step 4 Output: {{STEP_4_OUTPUT}}


TAGS suy ra từ S8/S2/S5 (ưu tiên long-tail 3–6 từ).
Step 2 Output: {{STEP_2_OUTPUT}}
Step 5 Output: {{STEP_5_OUTPUT}}

Nếu vẫn thiếu mô tả & tags → in nguyên văn:
INPUT_NEEDED: No description/tags found (need STEP5 or STEP7).

S4_EXPORT → đồng bộ chapters/time & CTA khi cần.
Step 4 Output: {{STEP_4_OUTPUT}}

S3_EXPORT → chuẩn hóa tên tổ chức cho “Helpful Resources”.
Step 3 Output: {{STEP_3_OUTPUT}}

S2_EXPORT → đối chiếu ngữ nghĩa với title anchor; không thay claim.
Step 2 Output: {{STEP_2_OUTPUT}}

TIME & TIMEZONE (VN-READY)

Múi giờ kênh: Asia/Ho_Chi_Minh (UTC+7, không DST).

PUBLISH_TIME_LOCAL (tùy chọn): "05:00" hoặc "17:00".

Nếu có PUBLISH_TIME_LOCAL → đặt:

creation_time_local_gmt+7 = <YYYY-MM-DD PUBLISH_TIME_LOCAL> (ngày chạy lệnh)

creation_time_utc = creation_time_local_gmt+7 − 07:00 → ISO YYYY-MM-DDTHH:MM:SSZ

Nếu không cung cấp → mặc định creation_time_local_gmt+7 = <YYYY-MM-DD 06:15:15> và creation_time_utc = local − 07:00.

Mẫu quy đổi nhanh

05:00 VN → 22:00 UTC ngày trước  (vd: 2025-03-10 05:00 → 2025-03-09T22:00:00Z)

17:00 VN → 10:00 UTC cùng ngày  (vd: 2025-03-10 17:00 → 2025-03-10T10:00:00Z)

YouTube lên lịch theo múi giờ kênh trong Studio, không theo metadata. Tuy vậy, đồng bộ creation_time giúp pipeline & lưu trữ.

FILENAME RULES (GROUP 0)

Không dấu, chữ thường; nối bằng _ hoặc -; không khoảng trắng.

Spearhead Keyword = long-tail đầu tiên trong S10.TAGS CSV; nếu thiếu → suy từ Title đã chốt (ưu tiên cụm 3–6 từ tự nhiên).

Tạo cặp:

<spearhead>_video.mp4

<spearhead>_thumbnail.jpg

Có thể thêm hậu tố ngắn _guide nếu tự nhiên (không nhồi nhét).

DESCRIPTION NORMALIZATION & LINK INJECTION

Description lấy từ S10 (hoặc dựng từ S7/S5 + S4 theo bố cục Step 10).

Luôn kiểm tra & CHÈN nếu thiếu, trước Disclaimer (hoặc trong “Helpful Resources”):

Subscribe: https://www.youtube.com/@Suckhoenguoicaotuoind?sub_confirmation=1

Không đổi độ mạnh claim; giữ giọng empathy-first, hedging.

CORE FIELDS (GROUP 1) — RAW SEO PROFILE

title = từ S9 (locked)

keywords = S10.TAGS CSV → đổi dấu phẩy , thành dấu chấm phẩy ;, giữ nguyên thứ tự (long-tail trước, 4 tag cố định ở cuối)

description = nguyên khối A) VIDEO DESCRIPTION từ S10 (đã chèn 2 link nếu thiếu; giữ format dòng trống đúng template)

comment = y hệt description, sau đó xuống dòng +:
Primary Keywords: <3 cụm> (lấy từ spearhead + 2 keyword phụ trong tags).

BRAND & CONTEXT (GROUP 2)

subject = cụm 3–5 từ tóm chủ đề (từ title/tags)

author = Sức Khỏe Người Cao Tuổi

artist = Sức Khỏe Người Cao Tuổi

publisher = Sức Khỏe Người Cao Tuổi

copyright = (c) 2025 Sức Khỏe Người Cao Tuổi

genre = Education (hoặc How-to & Style nếu phù hợp)

TECH & ADVANCED (GROUP 3)

encoded_by = SKNCT-MASTER-2025

language = vi

year = 2025

creation_time_local_gmt+7 = YYYY-MM-DD HH:MM:SS (theo PUBLISH_TIME_LOCAL hoặc 06:15:15)

creation_time_utc = YYYY-MM-DDTHH:MM:SSZ (local −07:00)

album = nếu có series/playlist → tên; nếu không → để trống

track = nếu có số tập → số; nếu không → để trống

STANDARDIZATION & SAFETY

Cấm: cure, miracle, guaranteed, instantly, reverse completely.

Không nhồi tags vào description/comment.

Thuật ngữ nhất quán giữa title–description–keywords.

FFmpeg rules cho description/comment trong metadata.txt:

Một dòng duy nhất (gộp dòng bằng khoảng trắng).

// FIX: Escaped the backtick character to prevent premature termination of the template literal.
Không ký tự đặc biệt: / \\ | \\ > < : * ? % & # " '\`

Cho phép: chữ, số, dấu chấm ., phẩy ,, gạch ngang -, gạch dưới _.

OUTPUT — EXACT TWO SECTIONS + ONE CODE BLOCK

PHẦN A: Tên File Tối Ưu Hóa
Tên File Video (.mp4):
<auto: <spearhead>_video.mp4>

Tên File Thumbnail (.jpg):
<auto: <spearhead>_thumbnail.jpg>

PHẦN B: Kế Hoạch Cấy Ghép Siêu Dữ Liệu Chi Tiết

title: <auto from S9>
keywords: <auto from S10.tags_csv → thay , bằng ;>
description:
<auto paste nguyên khối A) VIDEO DESCRIPTION từ S10 (đã đảm bảo chèn 2 link nếu thiếu)>

comment:
<auto paste y hệt description ở trên>
Primary Keywords: <spearhead keyword>, <keyword phụ 1>, <keyword phụ 2>

subject: <auto 3–5 từ từ Title/Tags>
author: Sức Khỏe Người Cao Tuổi
artist: Sức Khỏe Người Cao Tuổi
publisher: Sức Khỏe Người Cao Tuổi
copyright: (c) 2025 Sức Khỏe Người Cao Tuổi
genre: Education

encoded_by: SKNCT-MASTER-2025
language: vi
year: 2025
creation_time_local_gmt+7: <auto: YYYY-MM-DD HH:MM:SS theo PUBLISH_TIME_LOCAL hoặc 06:15:15>
creation_time_utc: <auto: YYYY-MM-DDTHH:MM:SSZ>   // local − 07:00
album: <auto or empty>
track: <auto or empty>


PHẦN C: metadata.txt (FFmpeg — code block duy nhất, không giải thích)
— In ngay sau Phần B. Định dạng: key=value, mỗi dòng một field. description/comment: gộp 1 dòng, loại ký tự cấm, giữ .,,-,_.

title=<from S9>
description=<A) VIDEO DESCRIPTION đã gộp 1 dòng, đã chèn Subscribe + Playlist nếu thiếu>
comment=<description 1 dòng> Primary Keywords: <spearhead>, <kw2>, <kw3>
keywords=<tags chuyển ;, một dòng>
subject=<3-5 words>
author=Sức Khỏe Người Cao Tuổi
artist=Sức Khỏe Người Cao Tuổi
publisher=Sức Khỏe Người Cao Tuổi
encoded_by=SKNCT-MASTER-2025
genre=Education
language=vi
creation_time=<UTC ISO: YYYY-MM-DDTHH:MM:SSZ>
year=2025
copyright=(c) 2025 Sức Khỏe Người Cao Tuổi
album=
track=

ERROR MESSAGES (PRINT EXACT IF MISSING)

INPUT_NEEDED: No STEP9_NOTIFY_EXPORT found.

INPUT_NEEDED: No description/tags found (need STEP10 or STEP7/STEP5).

GHI CHÚ THAY THẾ LIÊN KẾT (NẾU CẦN)

Thay <CHANNEL_HANDLE> bằng handle kênh, ví dụ: @suckhoenguoicaotuoi

Thay <PLAYLIST_ID> bằng ID playlist chính của kênh.

[/STEP 8 — VN-READY v1.4]`
    },
    {
        id: 9,
        name: 'automation.step9.name',
        description: 'automation.step9.description',
        promptTemplate: `ROLE & GOAL
Bạn là “The SRT Merge Mapper.” Tìm thời điểm bắt đầu cho từng mục trong output của bước 6 bằng cách đối khớp nội dung với câu thoại trong SRT. Xuất bảng 3 cột sạch để dùng trong pipeline dựng hình theo thời gian.

REQUIRED INPUTS
1. The output from step 6 is provided below:
{{STEP_6_OUTPUT}}

2. The raw SRT content is provided below:
{{SRT_CONTENT}}

WHEN NO INPUT (STRICT)
Nếu không có SRT được dán vào: in chính xác
ACK: NEED [SRT_RAW]. Paste your .srt file content (standard SRT format).

Nếu không tìm thấy output của bước 6: in chính xác
INPUT_NEEDED: No visual prompt output found.

CONTENT MATCHING LOGIC (STRICT)
Duyệt từng dòng từ output của bước 6 theo thứ tự (01→50):
Exact contains (case-insensitive):
Tìm cue đầu tiên, chưa dùng trong SRT chứa nguyên văn “Đoạn Kịch Bản” làm substring.
Normalized contains:
Nếu chưa khớp → chuẩn hoá cả hai phía (gộp khoảng trắng, bỏ dấu ba chấm đầu/đuôi, quy về lowercase, thống nhất quote) rồi tìm lại.
Fuzzy token match (threshold ≥ 0.82):
Nếu vẫn chưa khớp → dùng fuzzy theo token, chọn cue sớm nhất chưa dùng có điểm cao nhất ≥ 0.82.
Lock cue sau khi ghép (không dùng lại cho mục khác).
Nếu không tìm thấy → Start Time = NOT_FOUND và báo trong Validation.

TIME NORMALIZATION RULES
Chấp nhận: H:MM:SS,ms, HH:MM:SS,ms, hoặc MM:SS,ms. Chuẩn hoá về HH:MM:SS,mmm.

OUTPUT FORMAT — EXACT 3-COLUMN TAB-SEPARATED TABLE (FOR SPREADSHEETS)
Create a Tab-Separated Value (TSV) block for easy pasting into spreadsheets.
RULES:
- The first line must be the headers: STT (tab) Start Time (hh:mm:ss,ms) (tab) Đoạn Kịch Bản
- Each subsequent line must contain the STT, a single TAB character, the Start Time, a single TAB character, and the Script Snippet.
- DO NOT use Markdown pipes (|).
- STT: keep zero-padding 01…50.
- Start Time: HH:MM:SS,mmm or NOT_FOUND.
- Script Snippet: paste the original snippet from the step 7 output.

VALIDATION REPORT (≤6 dòng, sau bảng)
Not found (STT): …
SRT leftover cue indices: …
Malformed timecodes fixed: N
Fuzzy matches used (≥0.82): N
Potential duplicates (same cue matched twice): none|list

POST-PROCESS — MANDATORY EXPORT BLOCK
Cuối câu trả lời, XUẤT block máy-đọc để pipeline dùng tiếp:
[STEP11_TIMECODE_MAP_EXPORT]
{
  "version": "1.4",
  "name": "S11_TimecodeMap_<YYYYMMDD>_<6char>",
  "session_id": "S11-<YYYYMMDD>-<6char>",
  "refs": {
    "step9_found": <true|false>,
    "step14_fallback_used": <true|false>
  },
  "rows": [
    { "stt": "01", "start_time": "00:00:03,120", "script_snippet": "<Đoạn Kịch Bản từ S9>" },
    { "stt": "02", "start_time": "00:00:06,480", "script_snippet": "<…>" }
  ],
  "stats": {
    "matched": <int>,
    "not_found": <int>,
    "fuzzy_used": <int>,
    "malformed_times_fixed": <int>,
    "srt_leftover_indices": "<compact ranges or empty>"
  },
  "compliance": "<yes|no>"
}
[/STEP11_TIMECODE_MAP_EXPORT]`
    }
];