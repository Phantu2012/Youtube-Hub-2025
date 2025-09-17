import React, { useState } from 'react';
import { X, Save, Key, Eye, EyeOff, Info, Bot, Youtube, Sparkles, PlusCircle, Trash2 } from 'lucide-react';
import { ChannelDna, ApiKeys, AIProvider, AIModel, Channel, Project } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ChannelDnaWizard } from './ChannelDnaWizard';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
    currentChannels: ChannelDna;
    onSave: (settings: { apiKeys: ApiKeys, selectedProvider: AIProvider, selectedModel: AIModel }) => void;
    projects: Project[];
    onChannelsChange: (channels: Channel[]) => void;
    onDeleteChannel: (channelId: string) => void;
}

const models: Record<AIProvider, { value: AIModel, label: string }[]> = {
    gemini: [
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
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

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKeys, selectedProvider, selectedModel, currentChannels, onSave, onChannelsChange, onDeleteChannel }) => {
    const { t } = useTranslation();
    const [localApiKeys, setLocalApiKeys] = useState(apiKeys);
    const [localProvider, setLocalProvider] = useState<AIProvider>(selectedProvider);
    const [localModel, setLocalModel] = useState<AIModel>(selectedModel);
    const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
        setLocalApiKeys(prev => ({ ...prev, [provider]: value }));
    };
    
    const handleChannelChange = (id: string, field: 'name' | 'dna', value: string) => {
        const updatedChannels = currentChannels.map(ch => ch.id === id ? { ...ch, [field]: value } : ch);
        onChannelsChange(updatedChannels);
    };

    const handleAddNewChannel = () => {
        const newChannel: Channel = {
            id: `channel_${Date.now()}`,
            name: t('settings.newChannelName'),
            dna: ''
        };
        onChannelsChange([...currentChannels, newChannel]);
    };
    
    const handleLaunchWizard = (channel: Channel) => {
        setEditingChannel(channel);
        setIsWizardOpen(true);
    };

    const handleDnaGenerated = (newDna: string) => {
        if (editingChannel) {
            handleChannelChange(editingChannel.id, 'dna', newDna);
        }
        setIsWizardOpen(false);
        setEditingChannel(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ apiKeys: localApiKeys, selectedProvider: localProvider, selectedModel: localModel });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
                <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700"></div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Info size={20} /> {t('settings.manageChannels')}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    {t('settings.channelDnaDescription')}
                                </p>
                                <div className="space-y-4">
                                    {currentChannels.map(channel => (
                                        <div key={channel.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <input
                                                    type="text"
                                                    value={channel.name}
                                                    onChange={(e) => handleChannelChange(channel.id, 'name', e.target.value)}
                                                    className="text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary"
                                                    placeholder={t('settings.channelNamePlaceholder')}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => handleLaunchWizard(channel)} className="p-2 text-gray-500 hover:text-purple-500"><Sparkles size={16} title={t('settings.buildWithAI')} /></button>
                                                    <button type="button" onClick={() => onDeleteChannel(channel.id)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} title={t('settings.deleteChannel')} /></button>
                                                </div>
                                            </div>
                                            <textarea
                                                value={channel.dna}
                                                onChange={(e) => handleChannelChange(channel.id, 'dna', e.target.value)}
                                                className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                                placeholder={t('settings.dna.placeholder')}
                                                rows={6}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleAddNewChannel}
                                        className="w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-primary/50 hover:bg-primary/10"
                                    >
                                        <PlusCircle size={16} />
                                        {t('settings.addChannel')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-light-bg dark:bg-dark-bg/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 flex-shrink-0">
                            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">{t('common.cancel')}</button>
                            <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg">
                                <Save size={16} /> {t('settings.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {isWizardOpen && editingChannel && (
                <ChannelDnaWizard 
                    isOpen={isWizardOpen}
                    onClose={() => setIsWizardOpen(false)}
                    onComplete={handleDnaGenerated}
                    apiKeys={apiKeys}
                    selectedProvider={selectedProvider}
                    selectedModel={selectedModel}
                />
            )}
        </>
    );
};
