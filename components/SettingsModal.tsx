
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Save, Key, Eye, EyeOff, Info, Bot, Youtube, Sparkles, PlusCircle, Trash2, Link, Loader, Share2, Users, Edit, Check } from 'lucide-react';
import { ChannelDna, ApiKeys, AIProvider, AIModel, Channel, User, Role, Permission } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ChannelDnaWizard } from './ChannelDnaWizard';
import { ALL_PERMISSIONS, getDefaultRoles } from '../constants';


interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    apiKeys: ApiKeys;
    selectedProvider: AIProvider;
    selectedModel: AIModel;
    currentChannels: ChannelDna;
    onSave: (settings: { apiKeys: ApiKeys, selectedProvider: AIProvider, selectedModel: AIModel }) => void;
    onAddChannel: (channel: Omit<Channel, 'id' | 'ownerId' | 'members' | 'roles'>) => Promise<void>;
    onUpdateChannel: (channel: Channel) => void;
    onDeleteChannel: (channelId: string) => void;
    onShareChannel: (channel: Channel) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    onUpdateChannelRoles: (channelId: string, roles: Role[]) => void;
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

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, apiKeys, selectedProvider, selectedModel, currentChannels, onSave, onAddChannel, onUpdateChannel, onDeleteChannel, onShareChannel, showToast, onUpdateChannelRoles }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'general' | 'channels' | 'roles'>('general');
    const [localApiKeys, setLocalApiKeys] = useState(apiKeys);
    const [localProvider, setLocalProvider] = useState<AIProvider>(selectedProvider);
    const [localModel, setLocalModel] = useState<AIModel>(selectedModel);
    const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isAddingChannel, setIsAddingChannel] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const confirmTimerRef = useRef<number | null>(null);
    
    // State for roles management
    const ownedChannels = useMemo(() => currentChannels.filter(c => c.ownerId === user.uid), [currentChannels, user.uid]);
    const [managingRolesForChannelId, setManagingRolesForChannelId] = useState<string | null>(ownedChannels[0]?.id || null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const permissionGroups = useMemo(() => {
        return ALL_PERMISSIONS.reduce((acc, p) => {
            if (!acc[p.group]) acc[p.group] = [];
            acc[p.group].push(p);
            return acc;
        }, {} as Record<string, typeof ALL_PERMISSIONS>);
    }, []);

    useEffect(() => {
        return () => {
            if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        };
    }, []);

    const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
        setLocalApiKeys(prev => ({ ...prev, [provider]: value }));
    };
    
    const handleChannelChange = (id: string, field: 'name' | 'dna' | 'channelUrl', value: string) => {
        const channelToUpdate = currentChannels.find(ch => ch.id === id);
        if (channelToUpdate) {
            onUpdateChannel({ ...channelToUpdate, [field]: value });
        }
    };

    const handleAddNewChannel = async () => {
        setIsAddingChannel(true);
        try {
            const newChannel: Omit<Channel, 'id' | 'ownerId' | 'members' | 'roles'> = {
                name: t('settings.newChannelName'),
                dna: '',
                channelUrl: '',
            };
            await onAddChannel(newChannel);
        } catch (error) {
            console.error("Failed to add channel:", error);
        } finally {
            setIsAddingChannel(false);
        }
    };
    
    const handleDeleteChannelClick = (channelId: string) => {
        if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);

        if (confirmDeleteId === channelId) {
            onDeleteChannel(channelId);
            setConfirmDeleteId(null);
        } else {
            setConfirmDeleteId(channelId);
            confirmTimerRef.current = window.setTimeout(() => {
                setConfirmDeleteId(null);
            }, 4000);
        }
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

    const handleSaveRole = () => {
        if (!editingRole || !managingRolesForChannelId) return;
        const channel = currentChannels.find(c => c.id === managingRolesForChannelId);
        if (!channel) return;
        
        let roles = channel.roles || getDefaultRoles(t);
        const isNew = !roles.some(r => r.id === editingRole.id);

        if (isNew) {
            roles.push(editingRole);
        } else {
            roles = roles.map(r => r.id === editingRole.id ? editingRole : r);
        }
        
        onUpdateChannelRoles(channel.id, roles);
        setEditingRole(null);
    };
    
    const handleDeleteRole = (roleId: string) => {
        if (!managingRolesForChannelId) return;
        const channel = currentChannels.find(c => c.id === managingRolesForChannelId);
        if (!channel) return;
        
        // Ensure role is not in use
        const isRoleInUse = Object.values(channel.members).includes(roleId);
        if (isRoleInUse) {
            showToast(t('toasts.roleInUseError'), 'error');
            return;
        }

        const updatedRoles = (channel.roles || getDefaultRoles(t)).filter(r => r.id !== roleId);
        onUpdateChannelRoles(channel.id, updatedRoles);
    };
    
    const handleAddNewRole = () => {
        setEditingRole({
            id: `role_${Date.now()}`,
            name: '',
            permissions: [],
        });
    };
    
    const handlePermissionToggle = (permission: Permission, isChecked: boolean) => {
        if (!editingRole) return;
        let newPermissions = [...editingRole.permissions];
        if (isChecked) {
            if (!newPermissions.includes(permission)) {
                newPermissions.push(permission);
            }
        } else {
            newPermissions = newPermissions.filter(p => p !== permission);
        }
        setEditingRole({ ...editingRole, permissions: newPermissions });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ apiKeys: localApiKeys, selectedProvider: localProvider, selectedModel: localModel });
        onClose();
    };

    const handleProviderChange = (provider: AIProvider) => {
        setLocalProvider(provider);
        // When provider changes, also reset the model to the first valid one
        setLocalModel(models[provider][0].value);
    };

    if (!isOpen) return null;
    
    const selectedChannelForRoles = currentChannels.find(c => c.id === managingRolesForChannelId);
    const rolesForSelectedChannel = selectedChannelForRoles?.roles || getDefaultRoles(t);

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
                <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                            </div>
                            <div className="border-b border-gray-200 dark:border-gray-700 mt-4">
                                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                    <button type="button" onClick={() => setActiveTab('general')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>General</button>
                                    <button type="button" onClick={() => setActiveTab('channels')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'channels' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Channels</button>
                                    <button type="button" onClick={() => setActiveTab('roles')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Roles & Permissions</button>
                                </nav>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
                             {activeTab === 'general' && (
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
                                                                onChange={() => handleProviderChange(provider)}
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
                                                    {models[localProvider] && models[localProvider].map(model => (
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
                             )}
                            
                            {activeTab === 'channels' && (
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
                                        {currentChannels.map(channel => {
                                            const isOwner = user.uid === channel.ownerId;
                                            return (
                                            <div key={channel.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <input
                                                        type="text"
                                                        value={channel.name}
                                                        onChange={(e) => handleChannelChange(channel.id, 'name', e.target.value)}
                                                        className="text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary"
                                                        placeholder={t('settings.channelNamePlaceholder')}
                                                        readOnly={!isOwner}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        {isOwner && (
                                                            <>
                                                                <button type="button" onClick={() => onShareChannel(channel)} className="p-2 text-gray-500 hover:text-green-500" title={t('settings.shareChannel')}><Share2 size={16} /></button>
                                                                <button type="button" onClick={() => handleLaunchWizard(channel)} className="p-2 text-gray-500 hover:text-purple-500" title={t('settings.buildWithAI')}><Sparkles size={16} /></button>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleDeleteChannelClick(channel.id)} 
                                                                    className={`p-2 rounded-md transition-colors ${confirmDeleteId === channel.id ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-red-500'}`} 
                                                                    title={confirmDeleteId === channel.id ? t('settings.deleteChannelConfirmation') : t('settings.deleteChannel')}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="font-semibold text-sm mb-1 block flex items-center gap-2"><Link size={14}/>{t('settings.channelUrl')}</label>
                                                    <input
                                                        type="url"
                                                        value={channel.channelUrl || ''}
                                                        onChange={(e) => handleChannelChange(channel.id, 'channelUrl', e.target.value)}
                                                        className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                                        placeholder={t('settings.channelUrlPlaceholder')}
                                                        readOnly={!isOwner}
                                                    />
                                                </div>

                                                <textarea
                                                    value={channel.dna}
                                                    onChange={(e) => handleChannelChange(channel.id, 'dna', e.target.value)}
                                                    className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                                    placeholder={t('settings.dna.placeholder')}
                                                    rows={4}
                                                    readOnly={!isOwner}
                                                />
                                            </div>
                                        )})}
                                        <button
                                            type="button"
                                            onClick={handleAddNewChannel}
                                            disabled={isAddingChannel}
                                            className="w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-primary/50 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isAddingChannel ? <Loader size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                                            {isAddingChannel ? t('settings.addingChannel') : t('settings.addChannel')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'roles' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold flex items-center gap-2"><Users size={20} /> {t('settings.rolesPermissionsTab')}</h3>
                                        <select
                                            value={managingRolesForChannelId || ''}
                                            onChange={e => setManagingRolesForChannelId(e.target.value)}
                                            className="p-2 text-sm bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                                        >
                                            <option value="" disabled>{t('automation.selectChannelPlaceholder')}</option>
                                            {ownedChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    {managingRolesForChannelId && !editingRole && (
                                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                                            {rolesForSelectedChannel.map(role => (
                                                <div key={role.id} className="flex items-center justify-between p-2 rounded-md hover:bg-light-bg dark:hover:bg-dark-bg">
                                                    <span className="font-semibold">{role.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => setEditingRole(role)} className="p-2 text-gray-500 hover:text-blue-500"><Edit size={16} /></button>
                                                        {!role.isDefault && (
                                                            <button type="button" onClick={() => handleDeleteRole(role.id)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={handleAddNewRole} className="w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold py-2 px-4 rounded-lg border-2 border-dashed border-primary/50 hover:bg-primary/10">
                                                <PlusCircle size={16} /> {t('settings.roles.add')}
                                            </button>
                                        </div>
                                    )}

                                    {editingRole && (
                                        <div className="p-4 border border-primary/50 rounded-lg space-y-4">
                                            <h4 className="text-md font-bold">{editingRole.id.startsWith('role_') ? t('settings.roles.add') : t('settings.roles.edit', {name: editingRole.name})}</h4>
                                            <input
                                                type="text"
                                                value={editingRole.name}
                                                onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                                                placeholder={t('settings.roles.namePlaceholder')}
                                                className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                                            />
                                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                                {Object.entries(permissionGroups).map(([group, permissions]) => (
                                                    <div key={group}>
                                                        <h5 className="font-semibold capitalize text-sm mb-2 text-primary">{t(`permissions.group.${group}`)}</h5>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {permissions.map(p => (
                                                                <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={editingRole.permissions.includes(p.id)}
                                                                        onChange={e => handlePermissionToggle(p.id, e.target.checked)}
                                                                        className="form-checkbox h-4 w-4 rounded text-primary focus:ring-primary-dark"
                                                                    />
                                                                    <span>{t(p.labelKey)}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button type="button" onClick={() => setEditingRole(null)} className="py-2 px-4 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600">{t('common.cancel')}</button>
                                                <button type="button" onClick={handleSaveRole} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg"><Check size={16} /> {t('settings.roles.save')}</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

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
