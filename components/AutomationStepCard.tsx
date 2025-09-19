import React, { useState, useRef, useEffect } from 'react';
import { AutomationStep, AutomationStepStatus, ToastMessage } from '../types';
import { CheckCircle, Loader, XCircle, AlertTriangle, Sparkles, ChevronDown, ClipboardCopy, Settings, Check, RotateCcw, Play, ListVideo } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface Step5Inputs {
    title: string;
    thumbOverlayL1: string;
    thumbOverlayL2: string;
    nextVideoUrl: string;
    keywords: string;
}

interface AutomationStepCardProps {
    step: AutomationStep;
    status: AutomationStepStatus;
    output: string;
    onPromptChange: (id: number, newPrompt: string) => void;
    onRestoreDefault: (stepId: number) => void;
    settings: Record<string, string | number>;
    onSettingChange: (key: string, value: string | number) => void;
    isRunning: boolean;
    showToast: (message: string, type: ToastMessage['type']) => void;
    onRerun: (stepId: number, mode: 'single' | 'from_here') => void;
    step5Inputs?: Step5Inputs;
    onStep5InputChange?: (field: keyof Step5Inputs, value: string) => void;
}

const StatusIcon: React.FC<{ status: AutomationStepStatus }> = ({ status }) => {
    switch (status) {
        case AutomationStepStatus.Running:
            return <Loader size={20} className="animate-spin text-blue-500" />;
        case AutomationStepStatus.Completed:
            return <CheckCircle size={20} className="text-green-500" />;
        case AutomationStepStatus.Error:
            return <XCircle size={20} className="text-red-500" />;
        case AutomationStepStatus.Pending:
        default:
            return <AlertTriangle size={20} className="text-gray-400" />;
    }
};

export const AutomationStepCard: React.FC<AutomationStepCardProps> = ({ step, status, output, onPromptChange, onRestoreDefault, settings, onSettingChange, isRunning, showToast, onRerun, step5Inputs, onStep5InputChange }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isRerunMenuOpen, setIsRerunMenuOpen] = useState(false);
    const rerunMenuRef = useRef<HTMLDivElement>(null);
    const [confirmRestore, setConfirmRestore] = useState(false);
    const confirmTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rerunMenuRef.current && !rerunMenuRef.current.contains(event.target as Node)) {
                setIsRerunMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Clear timeout on unmount
        return () => {
            if (confirmTimerRef.current) {
                clearTimeout(confirmTimerRef.current);
            }
        };
    }, []);

    const handleCopy = () => {
        if (output) {
            navigator.clipboard.writeText(output);
            showToast(t('toasts.copied'), 'success');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };
    
    const handleRerunClick = (mode: 'single' | 'from_here') => {
        onRerun(step.id, mode);
        setIsRerunMenuOpen(false);
    };

    const handleRestoreDefaultClick = () => {
        if (confirmTimerRef.current) {
            clearTimeout(confirmTimerRef.current);
        }

        if (confirmRestore) {
            onRestoreDefault(step.id);
            setConfirmRestore(false);
        } else {
            setConfirmRestore(true);
            confirmTimerRef.current = window.setTimeout(() => {
                setConfirmRestore(false);
            }, 4000);
        }
    };

    return (
        <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-md transition-all duration-300">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <StatusIcon status={status} />
                    <div className="flex items-baseline gap-2">
                        <h3 className="font-bold text-lg">{t('automation.stepLabel', { id: step.id })}</h3>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{t(step.name)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <div className="relative" ref={rerunMenuRef}>
                        <button
                            onClick={() => setIsRerunMenuOpen(prev => !prev)}
                            disabled={isRunning}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={t('automation.rerunStep')}
                            title={t('automation.rerunStep')}
                        >
                            <RotateCcw size={16} />
                        </button>
                        {isRerunMenuOpen && (
                             <div className="absolute right-0 mt-2 w-56 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                                <button onClick={() => handleRerunClick('single')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Play size={14} />
                                    <span>{t('automation.rerunStepOnly')}</span>
                                </button>
                                <button onClick={() => handleRerunClick('from_here')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <ListVideo size={14} />
                                    <span>{t('automation.rerunFromThisStep')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label={isExpanded ? t('automation.collapse') : t('automation.expand')}
                    >
                        <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t(step.description)}</p>
                    
                     {step.id === 5 && step5Inputs && onStep5InputChange && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Settings size={14} /> {t('automation.step5.inputsTitle')}
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('automation.step5.finalTitle')}</label>
                                    <input
                                        type="text"
                                        value={step5Inputs.title}
                                        onChange={e => onStep5InputChange('title', e.target.value)}
                                        disabled={isRunning}
                                        className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('automation.step5.thumbOverlay')}</label>
                                    <div className="flex gap-2 mt-1">
                                        <input
                                            type="text"
                                            placeholder={t('automation.step5.thumbOverlayL1')}
                                            value={step5Inputs.thumbOverlayL1}
                                            onChange={e => onStep5InputChange('thumbOverlayL1', e.target.value)}
                                            disabled={isRunning}
                                            className="w-1/2 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder={t('automation.step5.thumbOverlayL2')}
                                            value={step5Inputs.thumbOverlayL2}
                                            onChange={e => onStep5InputChange('thumbOverlayL2', e.target.value)}
                                            disabled={isRunning}
                                            className="w-1/2 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('automation.step5.nextVideoUrl')}</label>
                                    <input
                                        type="url"
                                        value={step5Inputs.nextVideoUrl}
                                        onChange={e => onStep5InputChange('nextVideoUrl', e.target.value)}
                                        disabled={isRunning}
                                        className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('automation.step5.mainKeywords')}</label>
                                    <input
                                        type="text"
                                        value={step5Inputs.keywords}
                                        onChange={e => onStep5InputChange('keywords', e.target.value)}
                                        disabled={isRunning}
                                        className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {step.settings && step.settings.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Settings size={14} /> {t('automation.settings')}
                            </h4>
                            <div className="space-y-2">
                                {step.settings.map(setting => (
                                    <div key={setting.key}>
                                        <label className="text-sm text-gray-600 dark:text-gray-400">{t(setting.label)}</label>
                                        <input
                                            type={setting.type}
                                            value={settings[setting.key] ?? setting.defaultValue}
                                            onChange={(e) => onSettingChange(setting.key, e.target.value)}
                                            disabled={isRunning}
                                            className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                            <label className="font-semibold text-sm block flex items-center gap-2">
                                <Sparkles size={14} /> {t('automation.promptTemplate')}
                            </label>
                            <button
                                type="button"
                                onClick={handleRestoreDefaultClick}
                                disabled={isRunning}
                                className={`text-xs flex items-center gap-1 transition-colors duration-200 disabled:opacity-50 rounded-md px-2 py-1 ${
                                    confirmRestore
                                    ? 'bg-red-500/10 text-red-500 font-bold'
                                    : 'text-gray-500 hover:text-blue-500 hover:bg-blue-500/10'
                                }`}
                            >
                                <RotateCcw size={12} />
                                {confirmRestore ? t('automation.restoreConfirmButton') : t('automation.restoreDefaultPrompt')}
                            </button>
                        </div>
                        <textarea
                            value={step.promptTemplate}
                            onChange={(e) => onPromptChange(step.id, e.target.value)}
                            disabled={isRunning}
                            rows={8}
                            className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono disabled:opacity-70"
                        />
                         <p className="text-xs text-gray-500 mt-1">
                            {t('automation.promptHint')}
                        </p>
                    </div>
                </div>
            )}
            
            {output && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-sm">{t('automation.output')}:</h4>
                         <button onClick={handleCopy} className="p-1 text-gray-400 hover:text-primary disabled:text-gray-600" aria-label={t('automation.copyOutput')} disabled={isCopied}>
                            {isCopied ? <Check size={16} className="text-green-500" /> : <ClipboardCopy size={16} />}
                        </button>
                    </div>
                    <div className="bg-light-bg dark:bg-dark-bg p-3 rounded-md max-h-60 overflow-y-auto">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">{output}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};