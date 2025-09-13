
import React, { useState, useEffect } from 'react';
import { X, Save, Key, Eye, EyeOff, Info, Bot, Youtube } from 'lucide-react';
import { ChannelDna, ApiKeys, AIProvider, AIModel } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
    currentChannelDna: ChannelDna;
    onSave: (settings: { apiKeys: ApiKeys, selectedProvider: AIProvider, selectedModel: AIModel, channelDna: ChannelDna }) => void;
}

const models: Record<AIProvider, { value: AIModel, label: string }[]> = {
    gemini: [
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' }
    ],
    openai: [
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
};

const ApiKeyInput: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
}> = ({ id, label, value, onChange, placeholder }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="relative">
            <label htmlFor={id} className="font-semibold text-sm mb-1 block">{label}</label>
            <input
                id={id}
                type={isVisible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className="w-full p-2 pr-10 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute inset-y-0 right-0 top-6 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label={isVisible ? t('settings.hideApiKey') : t('settings.showApiKey')}
            >
                {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKeys, selectedProvider, selectedModel, currentChannelDna, onSave }) => {
    const { t } = useTranslation();
    const [localApiKeys, setLocalApiKeys] = useState(apiKeys);
    const [localProvider, setLocalProvider] = useState<AIProvider>(selectedProvider);
    const [localModel, setLocalModel] = useState<AIModel>(selectedModel);
    const [channelDna, setChannelDna] = useState(currentChannelDna);

    const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
        setLocalApiKeys(prev => ({ ...prev, [provider]: value }));
    };

    useEffect(() => {
        const availableModels = models[localProvider].map(m => m.value);
        if (!availableModels.includes(localModel as any)) {
            setLocalModel(availableModels[0]);
        }
    }, [localProvider, localModel]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ apiKeys: localApiKeys, selectedProvider: localProvider, selectedModel: localModel, channelDna });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-light-card dark:bg-dark-card z-10">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                         <div>
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                <Bot size={20} /> {t('settings.aiProvider.title')}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="font-semibold text-sm mb-2 block">{t('settings.aiProvider.selectProvider')}</label>
                                    <div className="flex gap-4">
                                        {(['gemini', 'openai'] as AIProvider[]).map(provider => (
                                            <label key={provider} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="ai-provider"
                                                    value={provider}
                                                    checked={localProvider === provider}
                                                    onChange={() => setLocalProvider(provider)}
                                                    className="form-radio text-primary focus:ring-primary"
                                                />
                                                <span className="capitalize">{provider}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="ai-model" className="font-semibold text-sm mb-1 block">{t('settings.aiProvider.selectModel')}</label>
                                    <select
                                        id="ai-model"
                                        value={localModel}
                                        onChange={(e) => setLocalModel(e.target.value as AIModel)}
                                        className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                                    >
                                        {models[localProvider].map(model => (
                                            <option key={model.value} value={model.value}>{model.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <ApiKeyInput
                                    id="geminiApiKey"
                                    label="Gemini API Key"
                                    value={localApiKeys.gemini}
                                    onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                                    placeholder={t('settings.apiKeyPlaceholder')}
                                />
                                <ApiKeyInput
                                    id="openaiApiKey"
                                    label="OpenAI API Key"
                                    value={localApiKeys.openai}
                                    onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                                    placeholder={t('settings.apiKeyPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700"></div>
                        
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                <Youtube size={20} /> {t('settings.youtubeApi.title')}
                            </h3>
                             <ApiKeyInput
                                id="youtubeApiKey"
                                label={t('settings.youtubeApiKey')}
                                value={localApiKeys.youtube}
                                onChange={(e) => handleApiKeyChange('youtube', e.target.value)}
                                placeholder={t('settings.apiKeyPlaceholder')}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {t('settings.youtubeApi.note')}
                            </p>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700"></div>

                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                <Info size={20} /> {t('settings.channelDna')}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                {t('settings.channelDnaDescription')}
                            </p>
                             <div>
                                <label htmlFor="channelDna" className="font-semibold text-sm mb-1 block">{t('settings.dna.label')}</label>
                                <textarea
                                    id="channelDna"
                                    name="channelDna"
                                    value={channelDna}
                                    onChange={(e) => setChannelDna(e.target.value)}
                                    className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    placeholder={t('settings.dna.placeholder')}
                                    rows={8}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 sticky bottom-0">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('common.cancel')}</button>
                        <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                            <Save size={16} /> {t('settings.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};