

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { AutomationStep } from '../types';
import { DEFAULT_AUTOMATION_STEPS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { Loader, Save, Sparkles, RotateCcw, ChevronDown, AlertTriangle, ExternalLink } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { firebaseConfig } from '../firebase';

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

const PermissionErrorGuideForPrompts: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
    const { t } = useTranslation();
    const rulesUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`;

    const newRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can write to their own doc, and any authenticated user can read public profile data.
    // Admins have extra rights.
    match /users/{userId} {
      allow write: if request.auth.uid == userId;
      allow get: if request.auth != null;
      allow list, update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Admins can read/write global settings. Authenticated users can read them.
    match /system_settings/{settingId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Rules for a user's 'channels' subcollection (direct access)
    match /users/{ownerId}/channels/{channelId} {
      // The owner can do anything with their channel.
      allow create, delete, write: if request.auth.uid == ownerId;

      // The owner can list their own channels.
      allow list: if request.auth.uid == ownerId;
      // Any member can get a specific channel's details.
      allow get: if request.auth.uid in resource.data.members;
    }
    
    // This rule is REQUIRED for the app to find channels shared with the user.
    // It allows a collectionGroup query across all 'channels' subcollections.
    match /{path=**}/channels/{channelId} {
      // Allow a user to list/get a channel if their UID is in the 'members' map.
      allow get, list: if request.auth.uid in resource.data.members;
    }

    // Rules for a user's 'projects' subcollection
    match /users/{ownerId}/projects/{projectId} {
      // Any member of the project's parent channel can manage the project.
      // This rule gets the channelId from the project being accessed (resource.data.channelId),
      // then fetches the corresponding channel document and checks if the user is a member.
      allow read, write, create, delete: if request.auth.uid in get(/databases/$(database)/documents/users/$(ownerId)/channels/$(resource.data.channelId)).data.members;
    }
  }
}`;

    return (
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
              <h3 className="text-xl font-bold">{t('adminPanel.permissionError.title')}</h3>
            </div>
            <p className="mt-2 mb-4 text-sm">{t('adminPanel.permissionError.intro')}</p>
            <div className="text-left bg-light-bg dark:bg-dark-bg p-4 rounded-lg text-light-text dark:text-dark-text">
                <p className="text-sm">{t('adminPanel.permissionError.step1')}</p>
                <a href={rulesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex my-2 items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow">
                    {t('adminPanel.permissionError.button')} <ExternalLink size={16} />
                </a>
                <p className="text-sm">{t('adminPanel.permissionError.step2')}</p>
                <CodeBlock code={newRules} title={t('adminPanel.permissionError.rulesTitle')} />
                <p className="text-sm mt-3">{t('adminPanel.permissionError.step3')}</p>
            </div>
             <button
                onClick={onRetry}
                className="w-full mt-6 flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors"
                >
                <RotateCcw size={20} />
                {t('adminPanel.permissionError.retryButton')}
            </button>
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
    const [permissionError, setPermissionError] = useState(false);

    useEffect(() => {
        const docRef = db.collection('system_settings').doc('automation_prompts');
        const unsubscribe = docRef.onSnapshot((doc) => {
            setPermissionError(false); // Reset error on successful snapshot
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
        }, (error: any) => {
            console.error("Error fetching global prompts:", error);
            if (error.code === 'permission-denied') {
                setPermissionError(true);
            } else {
                showToast(t('adminPrompts.saveError'), 'error');
            }
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
        setPermissionError(false);
        try {
            const docRef = db.collection('system_settings').doc('automation_prompts');
            await docRef.set({ steps: prompts });
            showToast(t('adminPrompts.saveSuccess'), 'success');
        } catch (error: any) {
            console.error("Error saving global prompts:", error);
            if (error.code === 'permission-denied') {
                setPermissionError(true);
            } else {
                showToast(t('adminPrompts.saveError'), 'error');
            }
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
    
    if (permissionError) {
        return <PermissionErrorGuideForPrompts onRetry={() => window.location.reload()} />;
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