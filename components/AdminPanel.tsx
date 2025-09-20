





import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db, firebase } from '../firebase';
import { useTranslation } from '../hooks/useTranslation';
import { Loader, Save, Shield, AlertTriangle, ExternalLink, RotateCcw, Users, Edit3, Info } from 'lucide-react';
import { CodeBlock } from './CodeBlock'; 
import { firebaseConfig } from '../firebase';
import { AdminPromptsPanel } from './AdminPromptsPanel';

interface AdminPanelProps {
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const UserCard: React.FC<{
    user: User;
    onUpdate: (uid: string, status: User['status'], expiresAt: string | null) => Promise<void>;
}> = ({ user, onUpdate }) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<User['status']>(user.status);
    const [expiresAt, setExpiresAt] = useState<string>(user.expiresAt ? user.expiresAt.substring(0, 10) : '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const date = expiresAt ? expiresAt : null;
        await onUpdate(user.uid, status, date);
        setIsSaving(false);
    };

    const statusOptions: { value: User['status']; label: string }[] = [
        { value: 'active', label: t('adminPanel.statuses.active') },
        { value: 'pending', label: t('adminPanel.statuses.pending') },
        { value: 'expired', label: t('adminPanel.statuses.expired') },
    ];
    
    const statusClasses: Record<User['status'], string> = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-light-text dark:text-dark-text truncate flex items-center gap-2">
                        {user.name}
                        {user.isAdmin && <span title={t('adminPanel.administrator')}><Shield size={16} className="text-blue-500 flex-shrink-0" /></span>}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
            </div>
            <div className="flex-1 md:flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('adminPanel.status')}</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as User['status'])}
                        className={`w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 ${statusClasses[status]}`}
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text">{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col">
                     <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('adminPanel.expiresAt')}</label>
                     <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full p-2 text-sm bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                </div>
                <div className="sm:self-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-3 rounded-lg shadow-md transition-colors disabled:opacity-70"
                    >
                        {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSaving ? t('adminPanel.saving') : t('adminPanel.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PermissionErrorGuide: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
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

      // Any member of the channel (owner or editor) can read the channel's details.
      allow read: if request.auth.uid in resource.data.members;
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

const TabButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-light-text dark:hover:text-dark-text'
        }`}
    >
        {icon}
        {label}
    </button>
);


export const AdminPanel: React.FC<AdminPanelProps> = ({ showToast }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstAdmin, setIsFirstAdmin] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'prompts' | 'setup'>('users');

    const fetchUsers = async () => {
        setIsLoading(true);
        setPermissionError(false);
        try {
            const snapshot = await db.collection('users').get();
            const usersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    uid: doc.id,
                    name: data.name,
                    email: data.email,
                    avatar: data.avatar,
                    status: data.status,
                    expiresAt: data.expiresAt ? data.expiresAt.toDate().toISOString() : null,
                    isAdmin: data.isAdmin || false,
                };
            }) as User[];
            
            usersData.sort((a, b) => {
                if (a.isAdmin && !b.isAdmin) return -1;
                if (!a.isAdmin && b.isAdmin) return 1;
                return a.name.localeCompare(b.name);
            });
            
            setUsers(usersData);
            if (!usersData.some(u => u.isAdmin)) {
                setIsFirstAdmin(true);
            }
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                setPermissionError(true);
            } else {
                console.error("Error fetching users:", error);
                showToast(t('adminPanel.toasts.fetchFailed'), 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else {
            setIsLoading(false); 
        }
    }, [activeTab]);

    const handleUpdateUser = async (uid: string, status: User['status'], expiresAt: string | null) => {
        try {
            const userRef = db.collection('users').doc(uid);
            const userToUpdate = users.find(u => u.uid === uid);
            if (!userToUpdate) return;
            
            await userRef.update({
                status: status,
                expiresAt: expiresAt ? firebase.firestore.Timestamp.fromDate(new Date(expiresAt)) : null
            });

            setUsers(prevUsers => prevUsers.map(u =>
                u.uid === uid ? { ...u, status, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null } : u
            ));
            
            showToast(t('adminPanel.toasts.userUpdated', { name: userToUpdate.name }), 'success');
        } catch (error) {
            console.error("Error updating user:", error);
            const userToUpdate = users.find(u => u.uid === uid);
            showToast(t('adminPanel.toasts.updateFailed', { name: userToUpdate?.name || 'user' }), 'error');
        }
    };

    const renderUsersPanel = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-16">
                    <Loader className="w-10 h-10 animate-spin text-primary" />
                    <p className="ml-4 text-lg text-gray-500 dark:text-gray-400">{t('adminPanel.loadingUsers')}</p>
                </div>
            );
        }
        
        if (permissionError) {
            return <PermissionErrorGuide onRetry={fetchUsers} />;
        }
        
        if (isFirstAdmin) {
            return (
                <div className="max-w-3xl mx-auto mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-800 dark:text-yellow-200">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
                      <h3 className="text-xl font-bold">{t('adminPanel.firstAdminSetup.title')}</h3>
                    </div>
                    <p className="mt-2 mb-4 text-sm">{t('adminPanel.firstAdminSetup.intro')}</p>

                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>{t('adminPanel.firstAdminSetup.step1')}</li>
                        <li>{t('adminPanel.firstAdminSetup.step2')}</li>
                        <li>{t('adminPanel.firstAdminSetup.step3')}</li>
                        <li>{t('adminPanel.firstAdminSetup.step4')}</li>
                        <li>{t('adminPanel.firstAdminSetup.step5')}</li>
                        <li>{t('adminPanel.firstAdminSetup.step6')}</li>
                    </ol>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {users.map(user => (
                    <UserCard key={user.uid} user={user} onUpdate={handleUpdateUser} />
                ))}
            </div>
        );
    };

    const renderSetupGuidePanel = () => (
      <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-800 dark:text-yellow-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
          <h3 className="text-xl font-bold">{t('login.setupGuide.title')}</h3>
        </div>
        <p className="mt-2 mb-6 text-sm">{t('login.setupGuide.intro')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-light-card dark:bg-dark-card/30 p-4 rounded-md">
            <h4 className="font-bold">{t('login.setupGuide.step1Title')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-3">{t('login.setupGuide.step1Desc')}</p>
            <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow"
            >
              {t('login.setupGuide.step1Button')} <ExternalLink size={14} />
            </a>
          </div>
          <div className="bg-light-card dark:bg-dark-card/30 p-4 rounded-md">
            <h4 className="font-bold">{t('login.setupGuide.step2Title')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-3">{t('login.setupGuide.step2Desc')}</p>
             <a
              href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow"
            >
              {t('login.setupGuide.step2Button')} <ExternalLink size={14} />
            </a>
          </div>
          <div className="bg-light-card dark:bg-dark-card/30 p-4 rounded-md">
            <h4 className="font-bold">{t('login.setupGuide.step3Title')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 mb-3">{t('login.setupGuide.step3Desc')}</p>
             <a
              href={`https://console.cloud.google.com/apis/credentials?project=${firebaseConfig.projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow"
            >
              {t('login.setupGuide.step3Button')} <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    );

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('adminPanel.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('adminPanel.description')}</p>
            
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-2" aria-label="Tabs">
                    <TabButton 
                        label={t('adminPanel.userManagementTab')} 
                        icon={<Users size={16} />} 
                        isActive={activeTab === 'users'} 
                        onClick={() => setActiveTab('users')} 
                    />
                    <TabButton 
                        label={t('adminPanel.promptManagementTab')} 
                        icon={<Edit3 size={16} />} 
                        isActive={activeTab === 'prompts'} 
                        onClick={() => setActiveTab('prompts')} 
                    />
                    <TabButton 
                        label={t('adminPanel.setupGuideTab')} 
                        icon={<Info size={16} />} 
                        isActive={activeTab === 'setup'} 
                        onClick={() => setActiveTab('setup')} 
                    />
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'users' && renderUsersPanel()}
                {activeTab === 'prompts' && <AdminPromptsPanel showToast={showToast} />}
                {activeTab === 'setup' && renderSetupGuidePanel()}
            </div>
        </div>
    );
};