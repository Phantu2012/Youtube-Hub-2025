import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, ArrowLeft, ArrowRight, Wand2, Loader, Sparkles, RefreshCw, Check, XCircle, BookOpen } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { ApiKeys, AIProvider, AIModel } from '../types';

interface ChannelDnaWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (dna: string) => void;
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
}

const GUIDE_STEPS = [
    { titleKey: "step1_title", descKey: "step1_desc" },
    { titleKey: "step2_title", descKey: "step2_desc" },
    { titleKey: "step3_title", descKey: "step3_desc" },
    { titleKey: "step4_title", descKey: "step4_desc" },
    { titleKey: "step5_title", descKey: "step5_desc" },
    { titleKey: "step6_title", descKey: "step6_desc" },
    { titleKey: "step7_title", descKey: "step7_desc" },
];

const WIZARD_STEPS = [
    { id: 1, question: "q1_question", description: "q1_description", placeholder: "q1_placeholder" },
    { id: 2, question: "q2_question", description: "q2_description", placeholder: "q2_placeholder" },
    { id: 3, question: "q_role_question", description: "q_role_description", placeholder: "q_role_placeholder" },
    { id: 4, question: "q3_question", description: "q3_description", placeholder: "q3_placeholder" },
    { id: 5, question: "q4_question", description: "q4_description", placeholder: "q4_placeholder" },
    { id: 6, question: "q5_question", description: "q5_description", placeholder: "q5_placeholder" },
    { id: 7, question: "q6_question", description: "q6_description", placeholder: "q6_placeholder" },
    { id: 8, question: "q7_question", description: "q7_description", placeholder: "q7_placeholder" },
    { id: 9, question: "q8_question", description: "q8_description", placeholder: "q8_placeholder" },
    { id: 10, question: "q9_question", description: "q9_description", placeholder: "q9_placeholder" },
];


export const ChannelDnaWizard: React.FC<ChannelDnaWizardProps> = ({ isOpen, onClose, onComplete, apiKeys, selectedProvider, selectedModel }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(-1); // -1 is the guide screen
    const [answers, setAnswers] = useState<string[]>(Array(WIZARD_STEPS.length).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [generatedDna, setGeneratedDna] = useState('');
    const [error, setError] = useState('');

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleGenerate = async () => {
        setError('');
        const aiApiKey = selectedProvider === 'gemini' ? apiKeys.gemini : apiKeys.openai;
        if (!aiApiKey) {
            setError(t('toasts.aiKeyMissing', { provider: selectedProvider }));
            return;
        }

        setIsLoading(true);

        const masterPromptTemplate = t('channelDnaWizard.masterPrompt.template');
        
        const inputs = {
            topic: answers[0] || 'Not provided',
            audience: answers[1] || 'Not provided',
            role_and_address: answers[2] || 'Not provided',
            core_value: answers[3] || 'Not provided',
            strength: answers[4] || 'Not provided',
            goals: answers[5] || 'Not provided',
            duration: answers[6] || 'Not provided',
            description_format: answers[7] || 'Not provided',
            illustration_style: answers[8] || 'Not provided',
            scientific_basis: answers[9] || 'Not provided',
        };

        const prompt = masterPromptTemplate
            .replace('{{topic}}', inputs.topic)
            .replace('{{audience}}', inputs.audience)
            .replace('{{role_and_address}}', inputs.role_and_address)
            .replace('{{core_value}}', inputs.core_value)
            .replace('{{strength}}', inputs.strength)
            .replace('{{goals}}', inputs.goals)
            .replace('{{duration}}', inputs.duration)
            .replace('{{description_format}}', inputs.description_format)
            .replace('{{illustration_style}}', inputs.illustration_style)
            .replace('{{scientific_basis}}', inputs.scientific_basis);

        try {
            let output = '';
            if (selectedProvider === 'gemini') {
                const ai = new GoogleGenAI({ apiKey: aiApiKey });
                const response = await ai.models.generateContent({ model: selectedModel, contents: prompt });
                output = response.text;
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
                output = data.choices[0].message.content;
            }
            setGeneratedDna(output.trim());
        } catch (err: any) {
            console.error("Error generating DNA:", err);
            setError(err.message || t('toasts.generateFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = () => {
        onComplete(generatedDna);
    };
    
    const handleClose = () => {
        setCurrentStep(-1);
        setAnswers(Array(WIZARD_STEPS.length).fill(''));
        setGeneratedDna('');
        setIsLoading(false);
        setError('');
        onClose();
    }

    if (!isOpen) return null;
    
    const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
    
    const renderGuide = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2"><BookOpen className="text-blue-500" />{t('channelDnaWizard.guide.title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('channelDnaWizard.guide.intro')}</p>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {GUIDE_STEPS.map((step, index) => (
                    <div key={index} className="p-3 bg-light-bg dark:bg-dark-bg/50 rounded-lg">
                        <h3 className="font-semibold text-primary">{t('channelDnaWizard.guide.stepLabel', { index: index + 1 })} {t(`channelDnaWizard.guide.${step.titleKey}`)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{t(`channelDnaWizard.guide.${step.descKey}`)}</p>
                    </div>
                ))}
            </div>
             <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-800 dark:text-green-200">
                {t('channelDnaWizard.guide.checklist')}
            </div>
        </div>
    );

    const renderContent = () => {
        if (currentStep === -1) {
            return renderGuide();
        }

        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-96">
                    <Loader size={48} className="animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold">{t('channelDnaWizard.generatingTitle')}</p>
                    <p className="text-gray-500 dark:text-gray-400">{t('channelDnaWizard.generatingMessage')}</p>
                </div>
            );
        }
        
        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-96 p-4">
                    <XCircle size={48} className="text-red-500" />
                    <p className="mt-4 text-lg font-semibold text-red-700 dark:text-red-400">{t('channelDnaWizard.errorTitle')}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-center my-2">{error}</p>
                    <button onClick={handleGenerate} className="flex items-center gap-2 mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">
                        <RefreshCw size={16} /> {t('channelDnaWizard.retry')}
                    </button>
                </div>
            )
        }

        if (generatedDna) {
            return (
                <div className="p-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3"><Sparkles className="text-purple-500" />{t('channelDnaWizard.resultTitle')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{t('channelDnaWizard.resultDescription')}</p>
                    <textarea
                        value={generatedDna}
                        onChange={(e) => setGeneratedDna(e.target.value)}
                        rows={15}
                        className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    />
                </div>
            );
        }
        
        const currentQuestion = WIZARD_STEPS[currentStep];

        return (
            <div className="p-6">
                <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('channelDnaWizard.step', { current: currentStep + 1, total: WIZARD_STEPS.length })}</span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1 mb-6">
                        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{t(`channelDnaWizard.${currentQuestion.question}`)}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t(`channelDnaWizard.${currentQuestion.description}`)}</p>

                <textarea
                    value={answers[currentStep]}
                    onChange={(e) => handleAnswerChange(currentStep, e.target.value)}
                    placeholder={t(`channelDnaWizard.${currentQuestion.placeholder}`)}
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                    rows={8}
                />
            </div>
        );
    };

    const renderFooter = () => {
        if (isLoading || error) {
            return (
                 <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
                    <button type="button" onClick={handleClose} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('common.cancel')}</button>
                </div>
            )
        }

        if (currentStep === -1) {
            return (
                <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
                     <button type="button" onClick={() => setCurrentStep(0)} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">
                        {t('channelDnaWizard.guide.start')} <ArrowRight size={16} />
                    </button>
                </div>
            )
        }
        
        if (generatedDna) {
            return (
                 <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                     <button type="button" onClick={handleGenerate} className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-800 dark:hover:text-purple-300">
                        <RefreshCw size={16} /> {t('channelDnaWizard.regenerate')}
                     </button>
                     <button type="button" onClick={handleComplete} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">
                         <Check size={16}/> {t('channelDnaWizard.useThisDna')}
                     </button>
                 </div>
            )
        }
        
        return (
             <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft size={16} /> {t('channelDnaWizard.back')}
                </button>

                {currentStep < WIZARD_STEPS.length - 1 ? (
                    <button type="button" onClick={handleNext} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">
                        {t('channelDnaWizard.next')} <ArrowRight size={16} />
                    </button>
                ) : (
                    <button type="button" onClick={handleGenerate} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                        <Wand2 size={16} /> {t('channelDnaWizard.generate')}
                    </button>
                )}
            </div>
        )
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={handleClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{t('channelDnaWizard.title')}</h2>
                        <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    {renderContent()}
                </div>

                {renderFooter()}
            </div>
        </div>
    );
};