
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChannelDna, Project, ProjectStatus, ToastMessage, AutomationStep, AutomationStepStatus, YouTubeVideoDetails, ApiKeys, AIProvider, AIModel } from '../types';
import { Bot, Loader, Sparkles, FilePlus2, PlayCircle, Youtube, Search, Image as ImageIcon, RotateCcw, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_AUTOMATION_STEPS } from '../constants';
import { AutomationStepCard } from './AutomationStepCard';
import { useTranslation } from '../hooks/useTranslation';
import { fetchVideoDetails } from '../services/youtubeService';

interface AutomationEngineProps {
    channelDna: ChannelDna;
    onOpenProjectModal: (project: Project | null) => void;
    showToast: (message: string, type: ToastMessage['type']) => void;
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
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
    };
}

type StepSettings = Record<number, Record<string, string | number>>;


export const AutomationEngine: React.FC<AutomationEngineProps> = ({ channelDna, onOpenProjectModal, showToast, apiKeys, selectedProvider, selectedModel }) => {
    const { t } = useTranslation();
    const [automationInput, setAutomationInput] = useLocalStorage<AutomationInput>('automation-input', {
        viralVideo: { link: '', transcript: '', details: null },
        targetVideo: { title: '', wordCount: '800' }
    });
    const [srtContent, setSrtContent] = useLocalStorage<string>('automation-srt-content', '');
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [steps, setSteps] = useLocalStorage<AutomationStep[]>('automation-steps', DEFAULT_AUTOMATION_STEPS);
    const [stepStatus, setStepStatus] = useLocalStorage<Record<number, AutomationStepStatus>>('automation-status', {});
    const [stepOutputs, setStepOutputs] = useLocalStorage<Record<number, string>>('automation-outputs', {});
    const [currentStep, setCurrentStep] = useState<number | null>(null);
    const [pausedAtStep, setPausedAtStep] = useLocalStorage<number | null>('automation-paused-step', null);
    const [stepSettings, setStepSettings] = useLocalStorage<StepSettings>('automation-settings', {});

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

    const handleFetchVideoDetails = async () => {
        const link = automationInput.viralVideo.link;
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
        setSteps(prevSteps => prevSteps.map(step => step.id === id ? { ...step, promptTemplate: newPrompt } : step));
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
    
    const hydratePrompt = (template: string, context: Record<string, string>): string => {
        let hydrated = template;
        for (const key in context) {
            hydrated = hydrated.replace(new RegExp(`{{${key}}}`, 'g'), context[key]);
        }
        return hydrated;
    };

    const handleRunChain = async () => {
        if (!automationInput.viralVideo.transcript.trim() || !automationInput.targetVideo.title.trim()) {
            showToast(t('toasts.viralInfoAndTargetTitleRequired'), 'info');
            return;
        }
        const aiApiKey = selectedProvider === 'gemini' ? apiKeys.gemini : apiKeys.openai;
        if (!aiApiKey) {
            showToast(t('toasts.aiKeyMissing', { provider: selectedProvider }), 'error');
            return;
        }

        const isResuming = pausedAtStep !== null;
        if (!isResuming) {
            setPausedAtStep(null);
        }

        setIsRunning(true);
        setCurrentStep(null);
        
        const startingStepIndex = isResuming 
            ? steps.findIndex(step => step.id === pausedAtStep)
            : steps.findIndex(step => stepStatus[step.id] !== AutomationStepStatus.Completed);
        const stepsToRun = steps.slice(startingStepIndex === -1 ? 0 : startingStepIndex);

        if (stepsToRun.length === 0 && !isResuming) {
            showToast(t('toasts.chainAlreadyCompleted'), 'info');
            setIsRunning(false);
            return;
        }

        const context: Record<string, string> = {
            CHANNEL_DNA: channelDna,
            VIRAL_VIDEO_LINK: automationInput.viralVideo.link,
            VIRAL_VIDEO_TRANSCRIPT: automationInput.viralVideo.transcript,
            VIRAL_VIDEO_TITLE: automationInput.viralVideo.details?.title || 'N/A',
            VIRAL_VIDEO_DESCRIPTION: automationInput.viralVideo.details?.description || 'N/A',
            VIRAL_VIDEO_TAGS: (automationInput.viralVideo.details?.tags || []).join(', '),
            TARGET_VIDEO_TITLE: automationInput.targetVideo.title,
            TARGET_VIDEO_WORD_COUNT: automationInput.targetVideo.wordCount,
            SRT_CONTENT: srtContent,
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

        // Populate context with outputs from already completed steps for resuming
        Object.keys(stepOutputs).forEach(stepId => {
            const stepNumber = Number(stepId);
            if (stepStatus[stepNumber] === AutomationStepStatus.Completed) {
                context[`STEP_${stepId}_OUTPUT`] = stepOutputs[stepNumber];
            }
        });

        for (const step of stepsToRun) {
            // Special check for Step 9 before running it
            if (step.id === 9 && !srtContent.trim()) {
                showToast(t('toasts.srtRequired'), 'info');
                setIsRunning(false); // Pause execution
                setPausedAtStep(9);
                return;
            }

            setCurrentStep(step.id);
            setStepStatus(prev => ({ ...prev, [step.id]: AutomationStepStatus.Running }));
            try {
                const prompt = hydratePrompt(step.promptTemplate, context);
                let output = '';

                if (selectedProvider === 'gemini') {
                    const ai = new GoogleGenAI({ apiKey: aiApiKey });
                    const response = await ai.models.generateContent({
                        model: selectedModel,
                        contents: prompt,
                    });
                    output = response.text.trim();
                } else { // OpenAI
                     const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${aiApiKey}`,
                        },
                        body: JSON.stringify({
                            model: selectedModel,
                            messages: [{ role: 'user', content: prompt }],
                        }),
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
                    }
                    const data = await response.json();
                    output = data.choices[0].message.content.trim();
                }
                
                context[`STEP_${step.id}_OUTPUT`] = output;
                setStepOutputs(prev => ({ ...prev, [step.id]: output }));
                setStepStatus(prev => ({ ...prev, [step.id]: AutomationStepStatus.Completed }));

            } catch (error) {
                console.error(`Error in step ${step.id}:`, error);
                showToast(t('toasts.stepError', { stepName: t(step.name) }), 'error');
                setStepStatus(prev => ({ ...prev, [step.id]: AutomationStepStatus.Error }));
                setIsRunning(false);
                return;
            }
        }
        
        setIsRunning(false);
        setCurrentStep(null);
        setPausedAtStep(null);
        showToast(t('toasts.chainCompleted'), 'success');
    };
    
    const handleCreateProject = () => {
        const creativeOutput = stepOutputs[4] || '';
        const titlesMatch = creativeOutput.match(/\[TITLES\]\s*([\s\S]*?)(?=\[THUMBNAIL_PROMPTS\]|$)/);
        const titleOutput = titlesMatch ? titlesMatch[1].trim().split('\n')[0].replace(/^\d+\.\s*/, '') : '';
        const promptsMatch = creativeOutput.match(/\[THUMBNAIL_PROMPTS\]\s*([\s\S]*)/);
        const thumbnailPromptOutput = promptsMatch ? promptsMatch[1].trim().split('\n')[0].replace(/^\d+\.\s*/, '') : '';
        
        const scriptOutput = stepOutputs[2] || '';
        
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
        const promptTableOutput = stepOutputs[7] || '';
        const seoMetadataOutput = stepOutputs[8] || '';
        const timecodeMapOutput = stepOutputs[9] || '';

        const newProject: Omit<Project, 'id'> = {
            projectName: automationInput.targetVideo.title,
            publishDateTime: new Date().toISOString().slice(0, 16),
            status: ProjectStatus.Idea,
            videoTitle: titleOutput,
            thumbnailData: '',
            description: description,
            tags: tags,
            pinnedComment: pinnedComment,
            communityPost: communityPost,
            facebookPost: facebookPost,
            youtubeLink: '',
            script: scriptOutput,
            thumbnailPrompt: thumbnailPromptOutput,
            voiceoverScript: voiceoverScriptOutput,
            promptTable: promptTableOutput,
            timecodeMap: timecodeMapOutput,
            metadata: '',
            seoMetadata: seoMetadataOutput,
        };
        onOpenProjectModal(newProject as Project);
    };

    // FIX: Simplified reset functions to be more reliable and intuitive.
    // This function now only resets the progress of the chain, leaving inputs intact.
    const handleResetChainProgress = () => {
        setStepStatus({});
        setStepOutputs({});
        setPausedAtStep(null);
        showToast(t('toasts.resetChainSuccess'), 'info');
    };

    // FIX: This function now only clears user-provided data, preserving custom prompts.
    const handleResetInputs = () => {
        setAutomationInput({
            viralVideo: { link: '', transcript: '', details: null },
            targetVideo: { title: '', wordCount: '800' }
        });
        setSrtContent('');
        showToast(t('toasts.resetInputsSuccess'), 'info');
    };

    const canCreateProject = stepStatus[8] === AutomationStepStatus.Completed;
    const details = automationInput.viralVideo.details;

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
                                    <button onClick={handleFetchVideoDetails} disabled={isFetchingDetails || isRunning} className="p-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-opacity-50">
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
                                <input
                                    type="text"
                                    value={automationInput.targetVideo.title}
                                    onChange={(e) => handleInputChange('targetVideo', 'title', e.target.value)}
                                    placeholder={t('automation.targetVideo.newTitlePlaceholder')}
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
                        </div>
                    </div>
                    
                    <button
                        onClick={handleRunChain}
                        disabled={isRunning}
                        className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:bg-opacity-70 disabled:cursor-wait"
                    >
                        {isRunning ? <><Loader size={20} className="animate-spin" /> {t('automation.runningButton')}</> : <><PlayCircle size={20} /> {t('automation.runButton')}</>}
                    </button>
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
                                settings={stepSettings[step.id] || {}}
                                onSettingChange={(key, value) => handleSettingChange(step.id, key, value)}
                                isRunning={isRunning}
                                showToast={showToast}
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
                                                onClick={handleRunChain}
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
        </div>
    );
};
