

export default {
  "common": {
    "cancel": "Cancel"
  },
  "header": {
    "title": "YouTube Video Hub",
    "projects": "Projects",
    "automation": "Automation",
    "calendar": "Calendar",
    "openSettings": "Open settings",
    "toggleTheme": "Toggle theme",
    "logout": "Logout"
  },
  "login": {
    "titleLine1": "Video Hub Center",
    "titleLine2": "YouTube",
    "tagline": "Your all-in-one dashboard to manage, track, and optimize your video production workflow.",
    "signInTitle": "Sign In",
    "signInPrompt": "Sign in to access your projects.",
    "signInButton": "Sign in with Google",
    "securityNote": "Sign in with your Google Account to securely save and sync your projects across devices.",
    "setupGuide": {
      "title": "First-Time Setup Guide",
      "intro": "If sign-in fails, please complete these two one-time steps in your Firebase project.",
      "step1Title": "Step 1: Enable Google Sign-In",
      "step1Desc": "This allows your app to use Google for authentication.",
      "step1Button": "Open Sign-In Methods",
      "step2Title": "Step 2: Authorize Your App's Domain",
      "step2Desc": "This tells Google that your application's domain is trusted.",
      "step2Button": "Open Auth Settings"
    }
  },
  "pending": {
    "title": "Account Pending Approval",
    "message": "Your account has been created and is waiting for administrator approval. Please check back later."
  },
  "expired": {
    "title": "Subscription Expired",
    "message": "Your access to the application has expired. Please contact the administrator to renew your subscription."
  },
  "dbError": {
    "title": "Action Required: Finish Setup",
    "message": "The application could not connect to the database. This is usually due to a configuration issue with your Firebase project.",
    "unavailableIntro": "This app requires a Firestore database to save your work, but it couldn't connect. This is a one-time setup issue that you can fix in 2 minutes.",
    "setupTitle": "How to Fix This in 3 Easy Steps",
    "step1": {
      "title": "Open your Firebase Project",
      "description": "This will take you directly to the Firestore section of your project.",
      "button": "Open Firebase Console"
    },
    "step2": {
      "title": "Click 'Create database'",
      "description": "Follow the on-screen prompts. Starting in 'test mode' is recommended for now."
    },
    "step3": {
      "title": "Come back here and 'Try Again'",
      "description": "Once the database is created, this error will be resolved."
    },
    "troubleshootingTitle": "How to Fix This",
    "check1": "Ensure you have created and enabled the 'Firestore Database' in your Firebase project console.",
    "check2": "Verify that your API key in the Firebase Console has no restrictions, or that this app's domain is allowed.",
    "check3": "Check your Firestore Security Rules to ensure they are not blocking read/write access.",
    "backToLogin": "Try Again"
  },
  "authConfigError": {
    "title": "Action Required: Complete Authentication Setup",
    "intro": "Your sign-in failed due to a common configuration issue in your Firebase project. Please check the following settings to resolve the problem.",
    "problem1Title": "Problem 1: Google Sign-In Method is Disabled",
    "problem1Intro": "This is the most common cause of 'invalid request' or 'redirect_uri_mismatch' errors.",
    "step1Title": "Go to Firebase Sign-In Methods",
    "step1Button": "Open Firebase Sign-In Methods",
    "step2Title": "Enable the Google Provider",
    "step2Desc": "Find 'Google' in the list, click it, toggle the switch to 'Enable', provide a project support email, and click 'Save'.",
    "problem2Title": "Problem 2: Application Domain is Not Authorized",
    "problem2Intro": "If you are running the app on a new domain (like from a hosting provider), you must authorize it.",
    "step3Title": "Copy this app's domain",
    "step3Desc": "Your current domain is:",
    "step4Title": "Add the domain in Firebase",
    "step4Button": "Open Firebase Auth Settings",
    "step4Desc": "Go to the 'Authorized domains' section, click 'Add domain', and paste the domain you copied.",
    "outro": "After checking both settings, return here and try signing in again.",
    "tryAgainButton": "Return to Login",
    "copyDomain": "Copy domain"
  },
  "projects": {
    "title": "Channel Projects",
    "manageChannels": "Manage Channels",
    "addChannel": "Add New Channel",
    "addVideo": "Add New Video",
    "manageDream100": "Manage Dream 100",
    "loading": "Loading Projects...",
    "noChannels": "No Channels Found",
    "getStartedChannels": "Add your first channel in the Settings to get started.",
    "noProjectsInChannel": "No video projects in this channel yet.",
    "subscribers": "Subscribers",
    "totalViews": "Total Views",
    "videos": "Videos"
  },
  "dashboard": {
    "totalProjects": "Total Projects",
    "publishedVideos": "Published Videos",
    "totalViews": "Total Views",
    "avgLikes": "Avg. Likes / Video"
  },
  "calendar": {
    "title": "Content Calendar",
    "today": "Today"
  },
  "projectCard": {
    "thumbnailAlt": "Video Thumbnail",
    "views": "views",
    "likes": "likes",
    "comments": "comments"
  },
  "projectModal": {
    "createTitle": "Create New Project",
    "editTitle": "Edit Project",
    "tabContent": "Content",
    "tabPublishing": "Publishing",
    "tabThumbnail": "Thumbnail",
    "tabAiAssets": "AI Assets",
    "tabStats": "Stats",
    "deleteConfirmation": "Confirm Delete",
    "clearFormConfirmation": "Confirm Clear",
    "projectName": "Project Name",
    "videoTitle": "Video Title",
    "script": "Script",
    "scriptPlaceholder": "Your video script goes here...",
    "voiceoverScript": "Voiceover Script (VO)",
    "voiceoverScriptPlaceholder": "Voiceover script generated by the AI...",
    "visualPrompts": "Visual Prompts",
    "visualPromptsPlaceholder": "Visual prompts from Step 6 will appear here...",
    "promptTable": "Prompt Table",
    "promptTablePlaceholder": "Prompt table generated by the AI...",
    "timecodeMap": "Timecode Map",
    "timecodeMapPlaceholder": "Timecode map generated by the AI...",
    "metadata": "Metadata",
    "metadataPlaceholder": "Store extra notes, JSON data, or any other relevant information here...",
    "seoMetadata": "SEO Metadata",
    "seoMetadataPlaceholder": "SEO profile and FFmpeg metadata generated by the AI...",
    "description": "Description",
    "tags": "Tags",
    "addTagPlaceholder": "Add a tag...",
    "publishDate": "Publish Date & Time",
    "status": "Status",
    "thumbnail": "Thumbnail",
    "thumbnailPreview": "Thumbnail Preview",
    "uploadOrPaste": "Click to upload or paste image",
    "uploadHint": "PNG, JPG, GIF up to 10MB",
    "thumbnailPrompt": "Thumbnail Prompt",
    "thumbnailPromptPlaceholder": "e.g., A robot holding a red skateboard.",
    "generate": "Generate",
    "generateImage": "Generate Image",
    "pinnedComment": "Pinned Comment",
    "communityPost": "Community Post",
    "facebookPost": "Facebook Post",
    "youtubeLink": "YouTube Link",
    "performanceStats": "Performance Stats",
    "setApiKey": "Please set your YouTube API key in the Settings to view stats.",
    "enterLinkForStats": "Enter a valid YouTube link to see stats.",
    "delete": "Delete",
    "deleting": "Deleting...",
    "clearForm": "Clear Form",
    "copy": "Copy",
    "rerunAutomation": "Rerun Automation",
    "exportToSheet": "Export for Sheet",
    "save": "Save Project",
    "saving": "Saving..."
  },
  "settings": {
    "title": "Settings",
    "aiProvider": {
      "title": "AI Provider Settings",
      "selectProvider": "Select AI Provider",
      "selectModel": "Select AI Model"
    },
    "youtubeApi": {
      "title": "YouTube API Settings",
      "note": "Required for fetching video stats and details. Your key is stored locally in your browser."
    },
    "youtubeApiKey": "YouTube Data API v3 Key",
    "apiKeyPlaceholder": "Enter your API Key",
    "showApiKey": "Show API Key",
    "hideApiKey": "Hide API Key",
    "apiKeyNote": "Your API key is stored locally in your browser and is never sent to our servers.",
    "manageChannels": "Manage Channels",
    "addChannel": "Add New Channel",
    "newChannelName": "New Channel",
    "channelNamePlaceholder": "Enter Channel Name",
    "channelUrl": "YouTube Channel URL",
    "channelUrlPlaceholder": "e.g., https://www.youtube.com/channel/...",
    "deleteChannel": "Delete Channel",
    "deleteChannelConfirmation": "Are you sure you want to delete this channel? This action cannot be undone.",
    "deleteChannelError": "Cannot delete a channel that contains projects. Please move or delete the projects first.",
    "buildWithAI": "Build with AI",
    "channelDnaDescription": "Define the identity for each of your channels to help the AI generate perfectly-styled content.",
    "save": "Save Settings",
    "dna": {
      "label": "Channel Profile",
      "placeholder": "e.g., My role is an Expert Chef. My tone is humorous and inspiring. I create content for beginner home cooks. I talk about vegan recipes and JavaScript tutorials. I address my audience with 'Hey everyone!'..."
    }
  },
  "dream100": {
    "title": "Dream 100: {{channelName}}",
    "addVideo": "Add Video",
    "addingVideo": "Adding...",
    "youtubeUrlPlaceholder": "Paste YouTube URL here...",
    "filterByChannel": "Filter by Channel",
    "allChannels": "All Channels",
    "table": {
      "video": "Video",
      "stats": "Stats",
      "published": "Published",
      "status": "Status",
      "actions": "Actions"
    },
    "details": {
      "description": "Description",
      "tags": "Tags",
      "noTags": "No tags provided."
    },
    "noVideos": "No videos in your Dream 100 list yet.",
    "getStarted": "Paste a YouTube URL above to start building your list.",
    "deleteConfirmation": "Are you sure you want to remove this video from your Dream 100 list?",
    "status": {
      "pending": "Pending",
      "analyzed": "Analyzed",
      "remade": "Remade"
    },
    "toasts": {
        "videoAdded": "Video added to Dream 100!",
        "videoExists": "This video is already in your Dream 100 list.",
        "fetchError": "Could not fetch video details. Check the URL and your API key.",
        "videoRemoved": "Video removed from list."
    }
  },
  "channelDnaWizard": {
    "title": "Build Your Channel DNA",
    "step": "Step {{current}} of {{total}}",
    "back": "Back",
    "next": "Next",
    "generate": "Generate DNA",
    "guide": {
      "title": "Guide to Perfecting Your Channel DNA",
      "intro": "Follow this process to gather the essential data for building a powerful Channel DNA. This preparation ensures our AI can generate the most effective and targeted content for you.",
      "stepLabel": "Step {{index}}.",
      "start": "I'm Ready, Let's Start",
      "step1_title": "Define the Channel 'Skeleton'",
      "step1_desc": "Answer 4 root questions:\n1. What is the channel's topic? (Niche)\n2. Who is the main audience?\n3. What core value does the channel provide?\n4. What is the goal for the next 12 months?",
      "step2_title": "Go to VidIQ - Find Root Keywords",
      "step2_desc": "Enter your root keyword (e.g., 'stroke' or 'senior health'). Collect 20-30 root keywords based on Search Volume and Competition.",
      "step3_title": "Filter with the 3-Layer Method",
      "step3_desc": "Filter your keywords:\n1. Is the volume between 1K-50K/month?\n2. Is the competition low-medium (<40%)?\n3. Is the search intent strong (solving a real problem)?\nKeep 5-10 'diamond' keywords.",
      "step4_title": "Build the SEO Battle Map",
      "step4_desc": "Group keywords into 4 categories:\n1. Spearhead: The 5-10 diamond keywords.\n2. Support: Keywords with medium volume, low competition.\n3. Contextual: Broadly related keywords for descriptions/tags.\n4. Brand: Your channel name + slogan.",
      "step5_title": "Embed Keywords into Your Channel DNA",
      "step5_desc": "Integrate your keywords into:\n- Channel Name + Tagline\n- Channel Description\n- Playlists\n- Video Titles\n- Video Descriptions + Tags",
      "step6_title": "Standardize Visual Identity",
      "step6_desc": "Define your visual DNA:\n- Main colors (2-3 hex codes)\n- Fonts (1 for titles, 1 for body)\n- Thumbnail format (consistent layout)",
      "step7_title": "Create a 6-12 Month Roadmap",
      "step7_desc": "Plan your content strategy:\n- First 3 months: Post 30 videos to test keywords.\n- 6 months: Group content into playlists/clusters.\n- 12 months: Expand to related keywords and build a community.",
      "checklist": "Your goal is to gather this information. The next steps will ask for the key results of your research."
    },
    "q1_question": "What is your channel's Topic/Niche?",
    "q1_description": "From your research, what is the specific niche you are targeting?",
    "q1_placeholder": "e.g., 'Health for seniors over 60', 'Advanced stroke prevention techniques'",
    "q2_question": "Who is your Target Audience?",
    "q2_description": "Describe your ideal viewer in detail.",
    "q2_placeholder": "e.g., 'Americans aged 60+, concerned about health, prefer easy-to-understand medical content.'",
    "q_role_question": "What role does the channel owner play and how do they address the audience?",
    "q_role_description": "This defines the Persona and how to connect directly with viewers, influencing the channel's tone and style.",
    "q_role_placeholder": "e.g., Role of an expert, addressing as 'I' and calling the audience 'you all'. Or role of a companion, addressing as 'we' and calling the audience 'friends'.",
    "q3_question": "What is the Core Value your channel provides?",
    "q3_description": "What problem do you solve for your audience?",
    "q3_placeholder": "e.g., 'Helping people live longer, healthier lives and avoid strokes by simplifying complex medical information.'",
    "q4_question": "What is your channel's Unique Strength?",
    "q4_description": "What makes you different from other channels in this niche?",
    "q4_placeholder": "e.g., 'All content is based on the latest scientific research, presented by a registered nurse.'",
    "q5_question": "What are your Goals for the next 1-3 years?",
    "q5_description": "Be specific about your targets.",
    "q5_placeholder": "e.g., '100 videos, 10K subscribers, 1M views in the first year. Become the most trusted source for senior health.'",
    "q6_question": "What is the ideal average duration for your videos?",
    "q6_description": "This helps with pacing and script length.",
    "q6_placeholder": "e.g., 'Around 15-20 minutes to allow for in-depth explanation.'",
    "q7_question": "How should your video descriptions be formatted?",
    "q7_description": "Do you have a specific structure, or should it learn from viral examples?",
    "q7_placeholder": "e.g., 'Follow the structure of viral videos: a strong hook in the first line, key takeaways, and a clear CTA.'",
    "q8_question": "Describe your desired Illustration Style.",
    "q8_description": "What should the visuals look like? Specify format and style.",
    "q8_placeholder": "e.g., 'Photo-realistic images of diverse American seniors in home or clinical settings. 16:9 aspect ratio, 4K resolution.'",
    "q9_question": "What is the Scientific Basis for your content, if any?",
    "q9_description": "How should sources and data be presented to build trust?",
    "q9_placeholder": "e.g., 'Cite sources from reputable medical journals like PubMed. Present data clearly, e.g., 'A 2023 study from Johns Hopkins found that...''",
    "generatingTitle": "Generating Your DNA...",
    "generatingMessage": "Our AI is crafting the perfect identity for your channel. This may take a moment.",
    "resultTitle": "Your Channel DNA is Ready!",
    "resultDescription": "Review the AI-generated DNA below. You can make edits before using it.",
    "useThisDna": "Use This DNA",
    "regenerate": "Regenerate",
    "errorTitle": "An Error Occurred",
    "retry": "Retry",
    "masterPrompt": {
      "template": "ROLE:\nYou are The World’s #1 Digital DNA Architect for YouTube Channels — a master at designing YouTube channel identities.\nYour mission: Take the basic input data -> transform it into a complete YouTube Channel DNA: unique, distinct, engaging, with explosive potential.\n\nINPUT (provided by user):\n- Topic/Niche: {{topic}}\n- Target Audience: {{audience}}\n- Role & Address: {{role_and_address}}\n- Core Value: {{core_value}}\n- Unique Strength: {{strength}}\n- Goals (1–3 years): {{goals}}\n\nADDITIONAL CONTEXT FOR CONTENT CREATION:\n- Average Video Duration: {{duration}}\n- Preferred Description Format: {{description_format}}\n- Illustration Style: {{illustration_style}}\n- Scientific Basis & Data Presentation: {{scientific_basis}}\n\nOUTPUT (mandatory):\n1. **Brand Positioning**\n   - Tagline (short, memorable)\n   - Brand Story (Storytelling)\n   - Brand Tone of Voice\n\n2. **Content DNA Framework**\n   - 3–5 main Content Pillars\n   - 5–7 sub-video Formats\n   - Publishing Rhythm\n\n3. **SEO & Audience Map**\n   - High-Impact Keywords\n   - Keyword Clusters\n   - Audience Persona\n\n4. **Visual Identity**\n   - Main Color Palette (Hex codes)\n   - Fonts (title & body)\n   - Suggestions for thumbnail & banner style\n\n5. **Growth Roadmap (6–12 Months)**\n   - Launch Strategy\n   - Retention & Community Strategy\n   - Expansion & Sub-brand Strategy (if applicable)\n\nRULES:\n- Write concisely, with depth.\n- Everything must be immediately actionable.\n- Avoid generic language; every detail must be clear & distinct."
    }
  },
  "status": {
    "idea": "💡 Idea",
    "production": "🎬 Production",
    "optimization": "🔍 Optimization",
    "completed": "✅ Completed",
    "published": "🚀 Published"
  },
  "automation": {
    "title": "AI Automation Engine",
    "selectChannel": "Select Target Channel",
    "selectChannelPlaceholder": "-- Select a channel to begin --",
    "noChannelsPlaceholder": "-- No channels configured --",
    "viralVideo": {
      "title": "Viral Video Analysis",
      "youtubeLink": "Viral YouTube Link",
      "transcript": "Transcript",
      "transcriptPlaceholder": "Paste the full transcript of the viral video here...",
      "fetchedTitle": "Fetched Title",
      "fetchedDescription": "Fetched Description",
      "fetchedTags": "Fetched Tags"
    },
    "targetVideo": {
      "title": "Your New Video",
      "newTitle": "Target Video Title",
      "newTitlePlaceholder": "e.g., How to bake the perfect sourdough bread",
      "nextTitle": "Next Video Title (Optional)",
      "nextTitlePlaceholder": "e.g., The secret to perfect pizza dough",
      "wordCount": "Target Word Count",
      "imageCount": "Target Number of Images"
    },
    "srtInput": {
      "label": "SRT File Content",
      "placeholder": "Paste the full content of your .srt file here..."
    },
    "runButton": "Run Automation Chain",
    "runningButton": "Running Chain...",
    "resumeButton": "Resume Chain",
    "resetChainProgress": "Reset Chain Progress",
    "resetInputs": "Reset Inputs",
    "resetChainConfirmation": "Are you sure you want to reset the progress? All generated outputs will be cleared, but your inputs will remain.",
    "resetInputsConfirmation": "Are you sure you want to reset all inputs and progress? The automation engine will be cleared to its initial state.",
    "createProjectButton": "Create Project from Results",
    "stepLabel": "Step {{id}}:",
    "expand": "Expand",
    "collapse": "Collapse",
    "promptTemplate": "Prompt Template",
    "promptHint": "You can edit this prompt. Use placeholders like `{{TARGET_VIDEO_TITLE}}` or `{{VIRAL_VIDEO_TRANSCRIPT}}` to chain steps.",
    "output": "Output",
    "copyOutput": "Copy output",
    "settings": "Settings",
    "rerunStep": "Rerun",
    "rerunStepOnly": "Rerun this step only",
    "rerunFromThisStep": "Rerun from this step",
    "defaultDescription": "Please review and edit the auto-generated description.",
    "step1": {
      "name": "Viral Analysis & Outline Generation",
      "description": "Analyzes a viral video's structure to create a tailored outline for your new video topic."
    },
    "step2": {
      "name": "Full Script Writing",
      "description": "Writes a complete script from the outline, matching your channel's tone and specified word count."
    },
    "step3": {
      "name": "Voiceover (VO) Script Compilation",
      "description": "Compiles the final script into a clean, voice-actor-ready format, stripping production notes and adding branding."
    },
    "step4": {
      "name": "Title & Thumbnail Analysis",
      "description": "Generates catchy titles and thumbnail ideas, then analyzes and selects the best option with a confidence score."
    },
    "step5": {
      "name": "SEO Distribution Package",
      "description": "Creates an SEO-optimized description, tags, and social media posts, auto-filled from the previous step.",
      "inputsTitle": "Manual Override Inputs",
      "finalTitle": "Final Title",
      "thumbOverlay": "Thumbnail Overlay Text",
      "thumbOverlayL1": "Line 1",
      "thumbOverlayL2": "Line 2",
      "nextVideoUrl": "Next Video URL",
      "mainKeywords": "Main Keywords (3-6, comma-separated)"
    },
    "step6": {
      "name": "Visual Prompt Generation",
      "description": "Analyzes the VO script and Channel DNA to generate a complete set of culturally-aligned, photo-realistic image prompts for the video."
    },
    "step7": {
      "name": "Prompt Table Builder",
      "description": "Converts the visual prompts from the previous step into a structured table and CSV block."
    },
    "step8": {
      "name": "SEO & Metadata Generation",
      "description": "Creates a comprehensive SEO profile and an FFmpeg-ready metadata file based on all previous steps."
    },
    "step9": {
      "name": "SRT Timecode Merge",
      "description": "Matches visual prompts to dialogue timestamps from a provided SRT file to create a synchronized shot list."
    }
  },
  "toasts": {
    "fetchProjectsError": "Could not fetch projects.",
    "settingsSaved": "Settings saved successfully!",
    "loginRequiredToSave": "You must be logged in to save projects.",
    "loginRequiredToDelete": "You must be logged in to delete projects.",
    "projectUpdated": "Project updated successfully!",
    "projectCreated": "Project created successfully!",
    "projectCopied": "Project copied successfully!",
    "copyingProject": "Copying project...",
    "projectSaveFailed": "Failed to save project.",
    "projectDeleted": "Project deleted.",
    "channelDeleted": "Channel deleted successfully.",
    "projectDeleteFailed": "Failed to delete project.",
    "formCleared": "Form fields have been cleared.",
    "unauthorizedDomain": "Domain not authorized. Add \"{{domain}}\" to your Firebase project's authorized domains list.",
    "unsupportedEnvironment": "Sign-in failed. Your browser environment may be blocking storage. Try opening the app in a new tab or check your privacy settings.",
    "googleSignInNotEnabled": "Error: Please enable Google Sign-In in your Firebase project settings.",
    "signInError": "An error occurred during sign-in.",
    "logoutDisabledDev": "Logout is disabled in development mode.",
    "loggedOut": "You have been logged out.",
    "logoutFailed": "Failed to log out.",
    "milestone": "🎉 Wow! \"{{title}}\" reached over 10,000 views!",
    "aiKeyMissing": "{{provider}} API key is not configured. Please set it in the settings.",
    "promptRequired": "Please enter a thumbnail prompt first.",
    "imageGenerated": "Thumbnail image generated!",
    "imageGenerateFailed": "Failed to generate image with AI.",
    "invalidImageFile": "Please select a valid image file.",
    "thumbnailTooLarge": "Thumbnail image is too large (max 700KB). Please use a smaller file.",
    "generateFailed": "Failed to generate content with AI.",
    "youtubeLinkRequired": "Please enter a YouTube link first.",
    "fetchVideoDetailsSuccess": "Successfully fetched video details!",
    "fetchVideoDetailsError": "Could not fetch details for this video. Check the link and your API key.",
    "viralInfoAndTargetTitleRequired": "Please provide the viral video transcript and a target title.",
    "channelRequired": "Please select a target channel before running the automation.",
    "stepError": "An error occurred in: {{stepName}}.",
    "stepError500": "A temporary internal error occurred in: {{stepName}}. Please try again in a moment.",
    "stepRerunSuccess": "Step '{{stepName}}' re-run successfully!",
    "chainCompleted": "Automation chain completed!",
    "srtRequired": "Please provide SRT content for the final step to continue.",
    "chainAlreadyCompleted": "The automation chain has already completed successfully.",
    "rerunDataLoaded": "Loaded data from '{{projectName}}' for a new automation run.",
    "resetChainSuccess": "Chain progress has been reset.",
    "resetInputsSuccess": "All inputs have been cleared.",
    "dbConnectionError": "Failed to connect to the database. This might be due to a network issue or an incorrect Firebase project configuration (e.g., Firestore not enabled).",
    "copied": "Copied to clipboard!",
    "step5AutoFilled": "Step 5 inputs have been auto-filled from Step 4's best choice!",
    "projectExported": "Project data copied to clipboard!",
    "exportFailed": "Could not copy data to clipboard.",
    "generated": {
      "videoTitle": "Video title generated!",
      "description": "Description generated!",
      "tags": "Tags generated!",
      "thumbnailPrompt": "Thumbnail prompt generated!"
    },
    "deleteConfirm": "Confirm",
    "clearConfirm": "Confirm"
  }
};