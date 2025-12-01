

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Channel, ChannelDna, Project, ProjectStatus, ToastMessage, AutomationStep, AutomationStepStatus, YouTubeVideoDetails, ApiKeys, AIProvider, AIModel, Idea, Dream100Video } from '../types';
import { Bot, Loader, Sparkles, FilePlus2, PlayCircle, Youtube, Search, RotateCcw, Trash2, ChevronDown, StopCircle, Lightbulb, BookOpen, Settings } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_AUTOMATION_STEPS } from '../constants';
import { AutomationStepCard } from './AutomationStepCard';
import { useTranslation } from '../hooks/useTranslation';
import { fetchVideoDetails } from '../services/youtubeService';
import { IdeaBankModal } from './IdeaBankModal';
import { Dream100SelectorModal } from './Dream100SelectorModal';

interface AutomationEngineProps {
    channels: Channel[];
    onOpenProjectModal: (project: Project | null) => void;
    showToast: (message: string, type: ToastMessage['type']) => void;
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
    onUpdateIdeas: (channelId: string, updatedIdeas: Idea[]) => void;
    onUpdateAutomationSteps: (channelId: string, updatedSteps: AutomationStep[]) => void;
    globalAutomationSteps: AutomationStep[];
}

interface AutomationInput {
    viralVideo: {
        link: string;
        transcript: string;
        details: YouTubeVideoDetails | null;
    };
    targetVideo: {
        title: string;
        wordCount: string;
        nextTitle?: string;
        imageCount: string;
    };
}

interface Step5Inputs {
    title: string;
    thumbOverlayL1: string;
    thumbOverlayL2: string;
    nextVideoUrl: string;
    keywords: string; // comma-separated
}

type StepSettings = Record<number, Record<string, string | number>>;


export const AutomationEngine: React.FC<AutomationEngineProps> = ({ channels, onOpenProjectModal, showToast, apiKeys, selectedProvider, selectedModel, onUpdateIdeas, onUpdateAutomationSteps, globalAutomationSteps }) => {
    const { t } = useTranslation();
    const [selectedChannelId, setSelectedChannelId] = useLocalStorage<string>('automation-selected-channel', '');
    const selectedChannel = channels.find(c => c.id === selectedChannelId);

    const [automationInput, setAutomationInput] = useLocalStorage<AutomationInput>('automation-input', {
        viralVideo: { link: '', transcript: '', details: null },
        targetVideo: { title: '', wordCount: '3500', nextTitle: '', imageCount: '40' }
    });
    const [srtContent, setSrtContent] = useLocalStorage<string>('automation-srt-content', '');
    const [step5Inputs, setStep5Inputs] = useLocalStorage<Step5Inputs>('automation-step5-inputs', {
        title: '',
        thumbOverlayL1: '',
        thumbOverlayL2: '',
        nextVideoUrl: '',
        keywords: ''
    });
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const stopExecutionRef = useRef(false);
    const [steps, setSteps] = useState<AutomationStep[]>(globalAutomationSteps);
    const [stepStatus, setStepStatus] = useLocalStorage<Record<number, AutomationStepStatus>>('automation-status', {});
    const [stepOutputs, setStepOutputs] = useLocalStorage<Record<number, string>>('automation-outputs', {});
    const [currentStep, setCurrentStep] = useState<number | null>(null);
    const [pausedAtStep, setPausedAtStep] = useLocalStorage<number | null>('automation-paused-step', null);
    const [stepSettings, setStepSettings] = useLocalStorage<StepSettings>('automation-settings', {});
    const [isIdeaBankOpen, setIsIdeaBankOpen] = useState(false);
    const [isDream100SelectorOpen, setIsDream100SelectorOpen] = useState(false);
    
    // Local provider override state
    const [localProvider, setLocalProvider] = useState<AIProvider>(selectedProvider);
    
    useEffect(() => {
        setLocalProvider(selectedProvider);
    }, [selectedProvider]);

    useEffect(() => {
        // Load user-specific custom steps for the channel, or fall back to global defaults
        if (selectedChannel?.automationSteps && selectedChannel.automationSteps.length > 0) {
            // Merge with global steps to ensure all steps are present, even if new ones were added to the app
            const mergedSteps = globalAutomationSteps.map(globalStep => {
                const customStep = selectedChannel.automationSteps!.find(cs => cs.id === globalStep.id);
                return customStep ? { ...globalStep, ...customStep } : globalStep;
            });
            setSteps(mergedSteps);
        } else {
            // No custom steps for this channel, use the global ones
            setSteps(globalAutomationSteps);
        }
    }, [selectedChannel, globalAutomationSteps]);


    useEffect(() => {
        const rerunDataString = localStorage.getItem('rerun-data');
        if (rerunDataString) {
            try {
                const rerunData = JSON.parse(rerunDataString);
                setAutomationInput(prev => ({
                    ...prev,
                    targetVideo: { ...prev.targetVideo, title: rerunData.targetTitle || '' },
                    viralVideo: { ...prev.viralVideo, transcript: rerunData.viralTranscript || '', link: '' , details: null }
                }));
                // Reset automation progress for the new run
                setStepStatus({});
                setStepOutputs({});
                setPausedAtStep(null);
                setSrtContent('');
                showToast(t('toasts.rerunDataLoaded', { projectName: rerunData.targetTitle }), 'info');
            } catch (e) {
                console.error("Failed to parse rerun data", e);
            } finally {
                localStorage.removeItem('rerun-data');
            }
        }
    }, [t, setAutomationInput, setPausedAtStep, setSrtContent, setStepOutputs, setStepStatus, showToast]);


    const handleInputChange = (section: 'viralVideo' | 'targetVideo', field: string, value: string) => {
        setAutomationInput(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };
    
    const handleStep5InputChange = (field: keyof Step5Inputs, value: string) => {
        setStep5Inputs(prev => ({ ...prev, [field]: value }));
    };

    const handleFetchVideoDetails = async (linkToFetch?: string) => {
        const link = linkToFetch || automationInput.viralVideo.link;
        if (!link.trim()) {
            showToast(t('toasts.youtubeLinkRequired'), 'info');
            return;
        }
        if (!apiKeys.youtube) {
            showToast(t('settings.youtubeApi.note'), 'error');
            return;
        }
        setIsFetchingDetails(true);
        try {
            const details = await fetchVideoDetails(link, apiKeys.youtube);
            setAutomationInput(prev => ({
                ...prev,
                viralVideo: { ...prev.viralVideo, details }
            }));
            if (details) {
                showToast(t('toasts.fetchVideoDetailsSuccess'), 'success');
            } else {
                showToast(t('toasts.fetchVideoDetailsError'), 'error');
            }
        } catch (error: any) {
            showToast(error.message, 'error');
            setAutomationInput(prev => ({
                ...prev,
                viralVideo: { ...prev.viralVideo, details: null }
            }));
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const handlePromptChange = (id: number, newPrompt: string) => {
        const updatedSteps = steps.map(step => step.id === id ? { ...step, promptTemplate: newPrompt } : step);
        setSteps(updatedSteps);
        if (selectedChannelId) {
            onUpdateAutomationSteps(selectedChannelId, updatedSteps);
        }
    };
    
    const handleToggleStep = (stepId: number) => {
        const updatedSteps = steps.map(step => {
            if (step.id === stepId) {
                // Default to true if undefined, then toggle
                return { ...step, enabled: !(step.enabled ?? true) };
            }
            return step;
        });
        setSteps(updatedSteps);
        if (selectedChannelId) {
            onUpdateAutomationSteps(selectedChannelId, updatedSteps);
        }
    };

    const handleRestoreDefaultPrompt = (stepId: number) => {
        const globalStep = globalAutomationSteps.find(s => s.id === stepId);
        if (globalStep) {
            const updatedSteps = steps.map(step => 
                step.id === stepId 
                ? { ...step, promptTemplate: globalStep.promptTemplate } 
                : step
            );
            setSteps(updatedSteps);
             if (selectedChannelId) {
                onUpdateAutomationSteps(selectedChannelId, updatedSteps);
            }
            showToast(t('toasts.promptRestored', { id: stepId }), 'success');
        }
    };

    const handleSettingChange = (stepId: number, key: string, value: string | number) => {
        setStepSettings(prev => ({
            ...prev,
            [stepId]: {
                ...prev[stepId],
                [key]: value
            }
        }));
    };
    
    const buildContext = (currentOutputs: Record<number, string>): Record<string, string> => {
        const context: Record<string, string> = {
            CHANNEL_DNA: selectedChannel?.dna || '',
            VIRAL_VIDEO_LINK: automationInput.viralVideo.link,
            VIRAL_VIDEO_TRANSCRIPT: automationInput.viralVideo.transcript,
            VIRAL_VIDEO_TITLE: automationInput.viralVideo.details?.title || 'N/A',
            VIRAL_VIDEO_DESCRIPTION: automationInput.viralVideo.details?.description || 'N/A',
            VIRAL_VIDEO_TAGS: (automationInput.viralVideo.details?.tags || []).join(', '),
            TARGET_VIDEO_TITLE: automationInput.targetVideo.title,
            TARGET_VIDEO_WORD_COUNT: automationInput.targetVideo.wordCount,
            TARGET_VIDEO_IMAGE_COUNT: automationInput.targetVideo.imageCount,
            NEXT_VIDEO_TITLE: automationInput.targetVideo.nextTitle || 'Not provided',
            SRT_CONTENT: srtContent,
            TITLE_FINAL: step5Inputs.title,
            THUMB_FINAL_OVERLAY: JSON.stringify({ L1: step5Inputs.thumbOverlayL1, L2: step5Inputs.thumbOverlayL2 }),
            VIDEO_URL_NEXT: step5Inputs.nextVideoUrl,
            TOPIC_MAIN_KEYWORDS: JSON.stringify(step5Inputs.keywords.split(',').map(k => k.trim()).filter(Boolean)),
        };

        // Add settings to context
        steps.forEach(step => {
            if (step.settings) {
                step.settings.forEach(setting => {
                    const value = stepSettings[step.id]?.[setting.key] ?? setting.defaultValue;
                    context[setting.key] = String(value);
                });
            }
        });

        // Populate context with step outputs
        Object.keys(currentOutputs).forEach(stepId => {
            context[`STEP_${stepId}_OUTPUT`] = currentOutputs[Number(stepId)];
        });

        return context;
    };
    
    const hydratePrompt = (template: string, context: Record<string, string>): string => {
        let hydrated = template;
        for (const key in context) {
            hydrated = hydrated.replace(new RegExp(`{{${key}}}`, 'g'), context[key]);
        }
        return hydrated;
    };

    const runSingleStep = async (step: AutomationStep, context: Record<string, string>): Promise<string> => {
        const providerToUse = localProvider; // Use the locally selected provider
        const aiApiKey = providerToUse === 'gemini' ? apiKeys.gemini : (providerToUse === 'openai' ? apiKeys.openai : apiKeys.claude);
        const modelToUse = providerToUse === 'gemini' 
            ? 'gemini-2.5-flash' 
            : (providerToUse === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20240620'); // Default mappings

        const prompt = hydratePrompt(step.promptTemplate, context);
        
        const MAX_RETRIES = 4;
        const INITIAL_DELAY_MS = 2000;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                let output = '';
                if (providerToUse === 'gemini') {
                    const ai = new GoogleGenAI({ apiKey: aiApiKey });
                    const response = await ai.models.generateContent({
                        model: modelToUse,
                        contents: prompt,
                    });
                    output = response.text.trim();
                } else if (providerToUse === 'openai') { 
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiApiKey}` },
                        body: JSON.stringify({ model: modelToUse, messages: [{ role: 'user', content: prompt }] }),
                    });

                    if (!response.ok) {
                        if (response.status >= 500 && response.status < 600) {
                            const errorBody = await response.text();
                            throw new Error(`Server error with status ${response.status}: ${errorBody}`);
                        }
                        const errorData = await response.json();
                        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
                    }
                    const data = await response.json();
                    output = data.choices[0].message.content.trim();
                } else if (providerToUse === 'claude') {
                    const response = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'x-api-key': aiApiKey,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json',
                            // NOTE: Browsers will block this by default due to CORS. 
                            // Users typically need a proxy or a browser extension to bypass CORS for direct API calls.
                            // 'anthropic-dangerously-allow-browser': 'true' // Some SDKs use this, raw fetch is strict.
                        },
                        body: JSON.stringify({
                            model: modelToUse,
                            max_tokens: 4096,
                            messages: [{ role: 'user', content: prompt }]
                        })
                    });

                    if (!response.ok) {
                        const errorBody = await response.text();
                        throw new Error(`Claude API error: ${response.status} - ${errorBody}`);
                    }
                    const data = await response.json();
                    output = data.content[0].text.trim();
                }
                
                return output; // Success
            } catch (error: any) {
                const errorMessage = String(error.message || '').toUpperCase();
                // More robust check for retryable server-side errors
                const isRetryable = (
                    errorMessage.includes('503') || // Service Unavailable / Overloaded
                    errorMessage.includes('500') || // Internal Server Error
                    errorMessage.includes('429') || // Too Many Requests
                    errorMessage.includes('UNAVAILABLE') ||
                    errorMessage.includes('INTERNAL')
                );

                if (isRetryable && attempt < MAX_RETRIES) {
                    // Exponential backoff with jitter
                    const baseDelay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
                    const jitter = Math.random() * 1000; // Add up to 1 second of randomness
                    const delay = baseDelay + jitter;

                    console.warn(`Attempt ${attempt} failed with a retryable error. Retrying in ${Math.round(delay)}ms...`, error.message);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error(`Final attempt (${attempt}) failed or error is not retryable.`, error);
                    throw error; // Re-throw the last error to be handled by the caller
                }
            }
        }
        // This should not be reached if MAX_RETRIES > 0
        throw new Error('Failed to get a response from the AI model after multiple retries.');
    };
    
    const parseValueFromBlock = (block: string, key: string): string => {
        const match = block.match(new RegExp(`^${key}:\\s*(.+)`, 'm'));
        return match ? match[1].trim() : '';
    };

    const runChain = async (startingStepId?: number) => {
        if (!selectedChannelId) {
            showToast(t('toasts.channelRequired'), 'info');
            return;
        }

        const isRerunning = typeof startingStepId === 'number';

        if (!isRerunning) {
            if (!automationInput.viralVideo.transcript.trim() || !automationInput.targetVideo.title.trim()) {
                showToast(t('toasts.viralInfoAndTargetTitleRequired'), 'info');
                return;
            }
        }
        
        const aiApiKey = localProvider === 'gemini' ? apiKeys.gemini : (localProvider === 'openai' ? apiKeys.openai : apiKeys.claude);
        if (!aiApiKey) {
            showToast(t('toasts.aiKeyMissing', { provider: localProvider }), 'error');
            return;
        }

        stopExecutionRef.current = false;
        setIsStopping(false);
        setIsRunning(true);
        setCurrentStep(null);
        
        let startingStepIndex = 0;
        if (isRerunning) {
            startingStepIndex = steps.findIndex(step => step.id === startingStepId);
        } else {
            const isResuming = pausedAtStep !== null;
            if (isResuming) {
                startingStepIndex = steps.findIndex(step => step.id === pausedAtStep);
            } else {
                setStepStatus({});
                setStepOutputs({});
            }
            setPausedAtStep(null);
        }

        if (startingStepIndex === -1) {
            console.error("Starting step not found");
            setIsRunning(false);
            return;
        }
        
        const stepsToRun = steps.slice(startingStepIndex);
        const currentOutputs = { ...stepOutputs };
        let stoppedByUser = false;

        for (const step of stepsToRun) {
            // Check if step is enabled. Default to true if property is missing.
            if ((step.enabled ?? true) === false) {
                setStepStatus(prev => ({ ...prev, [step.id]: AutomationStepStatus.Skipped }));
                currentOutputs[step.id] = ''; // Ensure skipped steps have empty output
                setStepOutputs(prev => ({ ...prev, [step.id]: '' }));
                continue; // Skip to the next step
            }
            
            const isFirstRunOfStep9 = step.id === 9 && !srtContent.trim() && pausedAtStep !== 9;
            if (isFirstRunOfStep9 && !isRerunning) {
                setPausedAtStep(9);
                setIsRunning(false);
                setCurrentStep(null);
                showToast(t('automation.srtInput.prompt'), 'info');
                return; 
            }

            if (stopExecutionRef.current) {
                stoppedByUser = true;
                setPausedAtStep(step.id);
                showToast(t('toasts.automationStopped'), 'info');
                break;
            }

            setCurrentStep(step.id);
            setStepStatus(prev => ({ ...prev, [step.id]: AutomationStepStatus.Running }));
            try {
                const context = buildContext(currentOutputs);
                const output = await runSingleStep(step, context);
                
                currentOutputs[step.id] = output;
                setStepOutputs(prev => ({ ...prev, [step.id]: output }));
                setStepStatus(prev => ({ ...prev, [step.id]: AutomationStepStatus.Completed }));
                
                if (step.id === 4) {
                    const bestChoiceMatch = output.match(/\[BEST_CHOICE\]\s*([\s\S]*)/);
                    if (bestChoiceMatch) {
                        const block = bestChoiceMatch[1];
                        const bestTitle = parseValueFromBlock(block, 'TITLE');
                        const bestL1 = parseValueFromBlock(block, 'THUMBNAIL_OVERLAY_L1');
                        const bestL2 = parseValueFromBlock(block, 'THUMBNAIL_OVERLAY_L2');
                        
                        if (bestTitle) {
                             setStep5Inputs(prev => ({
                                ...prev,
                                title: bestTitle,
                                thumbOverlayL1: bestL1,
                                thumbOverlayL2: bestL2,
                             }));
                             showToast(t('toasts.step5AutoFilled'), 'info');
                        }
                    }
                }

            } catch (error: any) {
                console.error(`Error in step ${step.id}:`, error);
                let errorMessage = t('toasts.stepError', { stepName: t(step.name) });
                if (error.message && (error.message.includes('500') || error.message.includes('INTERNAL') || error.message.includes('Server error'))) {
                    errorMessage = t('toasts.stepError500', { stepName: t(step.name) });
                } else if (error.message && error.message.includes('Claude')) {
                    errorMessage = `Claude AI Error: ${error.message}`;
                }
                showToast(errorMessage, 'error');
                setStepStatus(prev => ({ ...prev, [step.id]: AutomationStepStatus.Error }));
                setIsRunning(false);
                return;
            }
        }
        
        setIsRunning(false);
        setCurrentStep(null);
        setIsStopping(false);
        if (!stoppedByUser) {
            setPausedAtStep(null);
            showToast(t('toasts.chainCompleted'), 'success');
        }
    };

    const handleStopChain = () => {
        stopExecutionRef.current = true;
        setIsStopping(true);
        showToast(t('toasts.stoppingAutomation'), 'info');
    };

    const handleRerun = async (stepIdToRerun: number, mode: 'single' | 'from_here') => {
        setIsRunning(true);
        setCurrentStep(stepIdToRerun);

        const stepIndex = steps.findIndex(s => s.id === stepIdToRerun);
        if (stepIndex === -1) {
            setIsRunning(false);
            setCurrentStep(null);
            return;
        }

        const newStatus = { ...stepStatus };
        const newOutputs = { ...stepOutputs };
        const stepsToReset = mode === 'single' ? [steps[stepIndex]] : steps.slice(stepIndex);
        
        stepsToReset.forEach(step => {
             newStatus[step.id] = AutomationStepStatus.Pending;
            if (newOutputs[step.id]) {
                delete newOutputs[step.id];
            }
        });
        
        setStepStatus(newStatus);
        setStepOutputs(newOutputs);

        if (mode === 'single') {
            try {
                const step = steps[stepIndex];
                setStepStatus(prev => ({ ...prev, [stepIdToRerun]: AutomationStepStatus.Running }));
                const context = buildContext(newOutputs);
                const output = await runSingleStep(step, context);

                setStepOutputs(prev => ({ ...prev, [stepIdToRerun]: output }));
                setStepStatus(prev => ({ ...prev, [stepIdToRerun]: AutomationStepStatus.Completed }));
                showToast(t('toasts.stepRerunSuccess', { stepName: t(step.name) }), 'success');
            } catch (error: any) {
                console.error(`Error re-running step ${stepIdToRerun}:`, error);
                let errorMessage = t('toasts.stepError', { stepName: t(steps[stepIndex].name) });
                if (error.message && (error.message.includes('500') || error.message.includes('INTERNAL') || error.message.includes('Server error'))) {
                    errorMessage = t('toasts.stepError500', { stepName: t(steps[stepIndex].name) });
                }
                showToast(errorMessage, 'error');
                setStepStatus(prev => ({ ...prev, [stepIdToRerun]: AutomationStepStatus.Error }));
            } finally {
                setIsRunning(false);
                setCurrentStep(null);
            }
        } else { // mode === 'from_here'
            setIsRunning(false); // runChain will set its own running state
            setCurrentStep(null);
            await runChain(stepIdToRerun);
        }
    };
    
    const handleCreateProject = () => {
        if (!selectedChannelId) {
            showToast(t('toasts.channelRequired'), 'error');
            return;
        }
        
        const step1Output = stepOutputs[1] || '';
        const creativeOutput = stepOutputs[4] || '';
        const titlesMatch = creativeOutput.match(/\[TITLES\]\s*([\s\S]*?)(?=\[THUMBNAIL_PROMPTS\]|$)/);
        const titleOutput = titlesMatch ? titlesMatch[1].trim().split('\n')[0].replace(/^\d+\.\s*/, '') : '';
        const promptsMatch = creativeOutput.match(/\[THUMBNAIL_PROMPTS\]\s*([\s\S]*)/);
        const thumbnailPromptOutput = promptsMatch ? promptsMatch[1].trim().split('\n')[0].replace(/^\d+\.\s*/, '') : '';
        
        const distributionOutput = stepOutputs[5] || '';
        const descriptionMatch = distributionOutput.match(/\[YT_DESCRIPTION\]\s*([\s\S]*?)(?=\s*\[PINNED_COMMENT\]|$)/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : t('automation.defaultDescription');

        const tagsMatch = distributionOutput.match(/\[VIDEO_TAGS\]\s*([\s\S]*?)(?=\s*=== EXPORT BLOCK ===|\s*$)/);
        const tagsRaw = tagsMatch ? tagsMatch[1].trim() : '';
        const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

        const pinnedCommentMatch = distributionOutput.match(/\[PINNED_COMMENT\]\s*([\s\S]*?)(?=\s*\[COMMUNITY_POST\]|$)/);
        const pinnedComment = pinnedCommentMatch ? pinnedCommentMatch[1].trim() : '';

        const communityPostMatch = distributionOutput.match(/\[COMMUNITY_POST\]\s*([\s\S]*?)(?=\s*\[FACEBOOK_POST\]|$)/);
        const communityPost = communityPostMatch ? communityPostMatch[1].trim() : '';

        const facebookPostMatch = distributionOutput.match(/\[FACEBOOK_POST\]\s*([\s\S]*?)(?=\s*\[VIDEO_TAGS\]|$)/);
        const facebookPost = facebookPostMatch ? facebookPostMatch[1].trim() : '';
        
        const voiceoverScriptOutput = stepOutputs[3] || '';
        const visualPromptsOutput = stepOutputs[6] || '';
        const promptTableOutput = stepOutputs[7] || '';
        const seoMetadataOutput = stepOutputs[8] || '';
        const timecodeMapOutput = stepOutputs[9] || '';

        const newProject: Omit<Project, 'id'> = {
            channelId: selectedChannelId,
            projectName: automationInput.targetVideo.title,
            publishDateTime: new Date().toISOString(),
            status: ProjectStatus.Idea,
            videoTitle: titleOutput,
            thumbnailData: '',
            description: description,
            tags: tags,
            pinnedComment: pinnedComment,
            communityPost: communityPost,
            facebookPost: facebookPost,
            youtubeLink: '',
            script: step1Output, // Store Step 1 (Outline) output
            thumbnailPrompt: thumbnailPromptOutput,
            voiceoverScript: voiceoverScriptOutput,
            visualPrompts: visualPromptsOutput,
            promptTable: promptTableOutput,
            timecodeMap: timecodeMapOutput,
            metadata: '',
            seoMetadata: seoMetadataOutput,
            storage: 'local',
        };
        onOpenProjectModal(newProject as Project);
    };

    const handleResetChainProgress = () => {
        setStepStatus({});
        setStepOutputs({});
        setPausedAtStep(null);
        showToast(t('toasts.resetChainSuccess'), 'info');
    };

    const handleResetInputs = () => {
        setAutomationInput({
            viralVideo: { link: '', transcript: '', details: null },
            targetVideo: { title: '', wordCount: '3500', nextTitle: '', imageCount: '40' }
        });
        setSrtContent('');
        setStep5Inputs({
            title: '',
            thumbOverlayL1: '',
            thumbOverlayL2: '',
            nextVideoUrl: '',
            keywords: ''
        });
        showToast(t('toasts.resetInputsSuccess'), 'info');
    };

    const handleUpdateIdeasForChannel = (updatedIdeas: Idea[]) => {
        if (selectedChannelId) {
            onUpdateIdeas(selectedChannelId, updatedIdeas);
        }
    };
    
    const handleSelectIdeaAsMain = (title: string) => {
        handleInputChange('targetVideo', 'title', title);
        setIsIdeaBankOpen(false);
    };

    const handleSelectIdeaAsNext = (title: string) => {
        handleInputChange('targetVideo', 'nextTitle', title);
        setIsIdeaBankOpen(false);
    };
    
    const handleSelectDream100Video = (video: Dream100Video) => {
        const newViralVideoState = {
            ...automationInput.viralVideo,
            link: video.youtubeLink,
            transcript: video.description, 
        };
    
        setAutomationInput(prev => ({
            ...prev,
            viralVideo: newViralVideoState
        }));
        
        setIsDream100SelectorOpen(false);
        showToast(t('toasts.dream100VideoSelected'), 'success');
        
        handleFetchVideoDetails(video.youtubeLink);
    };

    const canCreateProject = Object.values(stepStatus).some(s => s === AutomationStepStatus.Completed);
    const details = automationInput.viralVideo.details;
    const sortedChannels = [...channels].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <Bot size={32} /> {t('automation.title')}
                </h1>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg space-y-6 mb-8">
                    {/* Input Section */}
                     <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <label htmlFor="channel-select" className="font-bold text-lg mb-2 block">{t('automation.selectChannel')}</label>
                        <div className="relative">
                            <select
                                id="channel-select"
                                value={selectedChannelId}
                                onChange={(e) => setSelectedChannelId(e.target.value)}
                                disabled={isRunning || channels.length === 0}
                                className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md appearance-none"
                            >
                                <option value="" disabled>{channels.length > 0 ? t('automation.selectChannelPlaceholder') : t('automation.noChannelsPlaceholder')}</option>
                                {sortedChannels.map(channel => (
                                    <option key={channel.id} value={channel.id}>{channel.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Viral Video Column */}
                        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Youtube size={20} className="text-primary" /> {t('automation.viralVideo.title')}</h3>
                             <div>
                                <label className="font-semibold text-sm">{t('automation.viralVideo.youtubeLink')}</label>
                                <div className="flex gap-2 mt-1">
                                    <input
                                        type="url"
                                        value={automationInput.viralVideo.link}
                                        onChange={(e) => handleInputChange('viralVideo', 'link', e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                        disabled={isRunning}
                                    />
                                     <button 
                                        type="button"
                                        onClick={() => setIsDream100SelectorOpen(true)}
                                        disabled={!selectedChannelId || isRunning}
                                        title={t('automation.selectFromDream100')}
                                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex-shrink-0"
                                    >
                                        <BookOpen size={20} />
                                    </button>
                                    <button onClick={() => handleFetchVideoDetails()} disabled={isFetchingDetails || isRunning} className="p-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-opacity-50 flex-shrink-0">
                                        {isFetchingDetails ? <Loader size={20} className="animate-spin" /> : <Search size={20} />}
                                    </button>
                                </div>
                            </div>
                             
                            <div className="space-y-4">
                                {details?.thumbnailUrl && (
                                    <div>
                                        <img src={details.thumbnailUrl} alt="Video Thumbnail" className="rounded-md w-full aspect-video object-cover" />
                                    </div>
                                )}
                                {details && (
                                    <>
                                        <div>
                                            <label htmlFor="TD_VIRAIL" className="font-semibold text-sm">{t('automation.viralVideo.fetchedTitle')}</label>
                                            <input
                                                id="TD_VIRAIL"
                                                type="text"
                                                value={details.title}
                                                readOnly
                                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="MT_VIRAIL" className="font-semibold text-sm">{t('automation.viralVideo.fetchedDescription')}</label>

                                            <textarea
                                                id="MT_VIRAIL"
                                                value={details.description}
                                                readOnly
                                                rows={4}
                                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="TAGS_VIRAIL" className="font-semibold text-sm">{t('automation.viralVideo.fetchedTags')}</label>
                                            <input
                                                id="TAGS_VIRAIL"
                                                type="text"
                                                value={details.tags.join(', ')}
                                                readOnly
                                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                             <div>
                                <label className="font-semibold text-sm">{t('automation.viralVideo.transcript')}</label>
                                <textarea
                                    value={automationInput.viralVideo.transcript}
                                    onChange={(e) => handleInputChange('viralVideo', 'transcript', e.target.value)}
                                    placeholder={t('automation.viralVideo.transcriptPlaceholder')}
                                    className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    rows={5}
                                    disabled={isRunning}
                                />
                            </div>
                        </div>

                        {/* Target Video Column */}
                        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                             <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles size={20} className="text-yellow-500" /> {t('automation.targetVideo.title')}</h3>
                            <div>
                                <label className="font-semibold text-sm">{t('automation.targetVideo.newTitle')}</label>
                                <div className="flex gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={automationInput.targetVideo.title}
                                        onChange={(e) => handleInputChange('targetVideo', 'title', e.target.value)}
                                        placeholder={t('automation.targetVideo.newTitlePlaceholder')}
                                        className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                        disabled={isRunning}
                                    />
                                     <button 
                                        type="button"
                                        onClick={() => setIsIdeaBankOpen(true)}
                                        disabled={!selectedChannelId}
                                        title={t('automation.ideaBank')}
                                        className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
                                     >
                                        <Lightbulb size={20} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-sm">{t('automation.targetVideo.nextTitle')}</label>
                                <input
                                    type="text"
                                    value={automationInput.targetVideo.nextTitle}
                                    onChange={(e) => handleInputChange('targetVideo', 'nextTitle', e.target.value)}
                                    placeholder={t('automation.targetVideo.nextTitlePlaceholder')}
                                    className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    disabled={isRunning}
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-sm">{t('automation.targetVideo.wordCount')}</label>
                                <input
                                    type="number"
                                    value={automationInput.targetVideo.wordCount}
                                    onChange={(e) => handleInputChange('targetVideo', 'wordCount', e.target.value)}
                                    className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    disabled={isRunning}
                                />
                            </div>
                             <div>
                                <label className="font-semibold text-sm">{t('automation.targetVideo.imageCount')}</label>
                                <input
                                    type="number"
                                    value={automationInput.targetVideo.imageCount}
                                    onChange={(e) => handleInputChange('targetVideo', 'imageCount', e.target.value)}
                                    className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    disabled={isRunning}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={isRunning ? handleStopChain : () => runChain()}
                        disabled={!isRunning && !selectedChannelId}
                        className={`w-full flex items-center justify-center gap-3 font-bold py-3 px-4 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-opacity-70 disabled:cursor-wait ${
                            isRunning ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary-dark text-white'
                        }`}
                    >
                        {isRunning ? (
                            isStopping ? (
                                <><Loader size={20} className="animate-spin" /> {t('automation.stoppingButton')}</>
                            ) : (
                                <><StopCircle size={20} /> {t('automation.stopButton')}</>
                            )
                        ) : (
                            <><PlayCircle size={20} /> {pausedAtStep ? t('automation.resumeButton') : t('automation.runButton')}</>
                        )}
                    </button>
                    
                    {/* AI Provider Selection for this Run */}
                    <div className="flex justify-center items-center gap-4 border-t border-b border-gray-200 dark:border-gray-700 py-3">
                        <span className="text-sm font-semibold text-gray-500">AI Model:</span>
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                            {(['gemini', 'openai', 'claude'] as AIProvider[]).map((provider) => (
                                <button
                                    key={provider}
                                    onClick={() => !isRunning && setLocalProvider(provider)}
                                    disabled={isRunning}
                                    className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${
                                        localProvider === provider
                                            ? 'bg-white dark:bg-dark-card text-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                    {provider}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-2">
                        <button
                            onClick={handleResetChainProgress}
                            disabled={isRunning}
                            className="text-sm flex items-center gap-2 text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-400 font-semibold py-2 px-3 rounded-lg hover:bg-yellow-500/10 disabled:opacity-50"
                        >
                            <RotateCcw size={14} /> {t('automation.resetChainProgress')}
                        </button>
                        <button
                            onClick={handleResetInputs}
                            disabled={isRunning}
                            className="text-sm flex items-center gap-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold py-2 px-3 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                        >
                            <Trash2 size={14} /> {t('automation.resetInputs')}
                        </button>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {steps.map((step) => (
                        <div key={step.id}>
                            <AutomationStepCard 
                                step={step}
                                status={stepStatus[step.id] || AutomationStepStatus.Pending}
                                output={stepOutputs[step.id] || ''}
                                onPromptChange={handlePromptChange}
                                onRestoreDefault={handleRestoreDefaultPrompt}
                                onToggle={handleToggleStep}
                                settings={stepSettings[step.id] || {}}
                                onSettingChange={(key, value) => handleSettingChange(step.id, key, value)}
                                isRunning={isRunning}
                                showToast={showToast}
                                onRerun={handleRerun}
                                step5Inputs={step5Inputs}
                                onStep5InputChange={handleStep5InputChange}
                            />
                            {step.id === 9 && (
                                <div className="bg-light-card dark:bg-dark-card rounded-b-lg p-4 -mt-2 shadow-md border-t border-gray-200 dark:border-gray-700">
                                    <label className="font-semibold text-sm block mb-2">{t('automation.srtInput.label')}</label>
                                    <textarea
                                        value={srtContent}
                                        onChange={(e) => setSrtContent(e.target.value)}
                                        disabled={isRunning}
                                        className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono"
                                        rows={8}
                                        placeholder={t('automation.srtInput.placeholder')}
                                    />
                                    {pausedAtStep === 9 && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => runChain()}
                                                disabled={isRunning || !srtContent.trim()}
                                                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <PlayCircle size={20} /> {t('automation.resumeButton')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {canCreateProject && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleCreateProject}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                        >
                            <FilePlus2 size={20} /> {t('automation.createProjectButton')}
                        </button>
                    </div>
                )}
            </div>
            {isIdeaBankOpen && selectedChannel && (
                <IdeaBankModal
                    isOpen={isIdeaBankOpen}
                    onClose={() => setIsIdeaBankOpen(false)}
                    ideas={selectedChannel.ideas || []}
                    onUpdateIdeas={handleUpdateIdeasForChannel}
                    onSelectAsMain={handleSelectIdeaAsMain}
                    onSelectAsNext={handleSelectIdeaAsNext}
                    showToast={showToast}
                />
            )}
            {isDream100SelectorOpen && selectedChannel && (
                <Dream100SelectorModal
                    isOpen={isDream100SelectorOpen}
                    onClose={() => setIsDream100SelectorOpen(false)}
                    videos={selectedChannel.dream100Videos || []}
                    onSelect={handleSelectDream100Video}
                />
            )}
        </div>
    );
};