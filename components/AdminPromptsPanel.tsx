
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { AutomationStep } from '../types';
import { DEFAULT_AUTOMATION_STEPS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { Loader, Save, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';

// Reusable card for editing a prompt
const PromptEditCard: React.FC<{
    step: AutomationStep;
    onPromptChange: (id: number, newPrompt: string) => void;
    onRestoreDefault: (id: number) => void;
    isSaving: boolean;
}> = ({ step, onPromptChange, onRestoreDefault, isSaving }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [confirmRestore, setConfirmRestore] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleRestoreClick = () => {
        if (confirmRestore) {
            onRestoreDefault(step.id);
            setConfirmRestore(false);
            if(timerRef.current) clearTimeout(timerRef.current);
        } else {
            setConfirmRestore(true);
            timerRef.current = window.setTimeout(() => setConfirmRestore(false), 3000);
        }
    };

    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-purple-500" />
                    <div className="flex items-baseline gap-2">
                        <h3 className="font-bold text-lg">{t('automation.stepLabel', { id: step.id })}</h3>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{t(step.name)}</span>
                    </div>
                </div>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t(step.description)}</p>
                    <div className="flex justify-end">
                        <button
                            onClick={handleRestoreClick}
                            disabled={isSaving}
                            className={`text-xs flex items-center gap-1 transition-colors duration-200 disabled:opacity-50 rounded-md px-2 py-1 ${
                                confirmRestore
                                ? 'bg-red-500/10 text-red-500 font-bold'
                                : 'text-gray-500 hover:text-blue-500 hover:bg-blue-500/10'
                            }`}
                        >
                            <RotateCcw size={12} />
                            {confirmRestore ? t('adminPrompts.confirmReset') : t('adminPrompts.resetPrompt')}
                        </button>
                    </div>
                    <textarea
                        value={step.promptTemplate}
                        onChange={(e) => onPromptChange(step.id, e.target.value)}
                        disabled={isSaving}
                        rows={15}
                        className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono"
                    />
                </div>
            )}
        </div>
    );
};


export const AdminPromptsPanel: React.FC<{
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}> = ({ showToast }) => {
    const { t } = useTranslation();
    const [prompts, setPrompts] = useState<AutomationStep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const docRef = db.collection('system_settings').doc('automation_prompts');
        const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data && data.steps && Array.isArray(data.steps)) {
                    const dbSteps = data.steps as AutomationStep[];
                    const mergedSteps = DEFAULT_AUTOMATION_STEPS.map(defaultStep => {
                        const dbStep = dbSteps.find(s => s.id === defaultStep.id);
                        return dbStep ? { ...defaultStep, ...dbStep } : defaultStep;
                    });
                    setPrompts(mergedSteps);
                } else {
                    setPrompts(DEFAULT_AUTOMATION_STEPS);
                }
            } else {
                setPrompts(DEFAULT_AUTOMATION_STEPS);
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching global prompts:", error);
            showToast(t('adminPrompts.saveError'), 'error');
            setPrompts(DEFAULT_AUTOMATION_STEPS);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [t, showToast]);

    const handlePromptChange = (id: number, newPrompt: string) => {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, promptTemplate: newPrompt } : p));
    };

    const handleRestoreDefault = (id: number) => {
        const defaultPrompt = DEFAULT_AUTOMATION_STEPS.find(p => p.id === id)?.promptTemplate;
        if (defaultPrompt) {
            handlePromptChange(id, defaultPrompt);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const docRef = db.collection('system_settings').doc('automation_prompts');
            await docRef.set({ steps: prompts });
            showToast(t('adminPrompts.saveSuccess'), 'success');
        } catch (error) {
            console.error("Error saving global prompts:", error);
            showToast(t('adminPrompts.saveError'), 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loader className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('adminPrompts.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('adminPrompts.description')}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:bg-opacity-70"
                >
                    {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSaving ? t('adminPrompts.savingButton') : t('adminPrompts.saveButton')}
                </button>
            </div>
            <div className="space-y-4">
                {prompts.map(step => (
                    <PromptEditCard
                        key={step.id}
                        step={step}
                        onPromptChange={handlePromptChange}
                        onRestoreDefault={handleRestoreDefault}
                        isSaving={isSaving}
                    />
                ))}
            </div>
        </div>
    );
};
