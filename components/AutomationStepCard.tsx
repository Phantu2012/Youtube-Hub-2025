import React, { useState } from 'react';
import { AutomationStep, AutomationStepStatus, ToastMessage } from '../types';
import { CheckCircle, Loader, XCircle, AlertTriangle, Sparkles, ChevronDown, ClipboardCopy, Settings, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface AutomationStepCardProps {
    step: AutomationStep;
    status: AutomationStepStatus;
    output: string;
    onPromptChange: (id: number, newPrompt: string) => void;
    settings: Record<string, string | number>;
    onSettingChange: (key: string, value: string | number) => void;
    isRunning: boolean;
    showToast: (message: string, type: ToastMessage['type']) => void;
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

export const AutomationStepCard: React.FC<AutomationStepCardProps> = ({ step, status, output, onPromptChange, settings, onSettingChange, isRunning, showToast }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (output) {
            navigator.clipboard.writeText(output);
            showToast(t('toasts.copied'), 'success');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
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
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label={isExpanded ? t('automation.collapse') : t('automation.expand')}
                >
                    <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t(step.description)}</p>
                    
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
                        <label className="font-semibold text-sm mb-1 block flex items-center gap-2">
                            <Sparkles size={14} /> {t('automation.promptTemplate')}
                        </label>
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
