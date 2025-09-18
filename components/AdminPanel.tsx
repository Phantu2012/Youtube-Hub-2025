

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../firebase';
import firebase from 'firebase/compat/app';
import { useTranslation } from '../hooks/useTranslation';
import { Loader, UserCheck, UserX, Clock, Save, Shield, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const UserCard: React.FC<{
    user: User;
    onUpdate: (uid: string, status: User['status'], expiresAt: string | null) => Promise<void>;
}> = ({ user, onUpdate }) => {
    const { t, language } = useTranslation();
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

    const currentStatusLabel = statusOptions.find(opt => opt.value === user.status)?.label || user.status;

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-light-text dark:text-dark-text truncate flex items-center gap-2">
                        {user.name}
                        {/* FIX: Wrapped the Shield icon in a span to provide a title for the tooltip, as the component doesn't accept a `title` prop. */}
                        {user.isAdmin && <span title="Administrator"><Shield size={16} className="text-blue-500 flex-shrink-0" /></span>}
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
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
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

export const AdminPanel: React.FC<AdminPanelProps> = ({ showToast }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFirstAdmin, setIsFirstAdmin] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
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
                
                // Sort by admin status first, then by name
                usersData.sort((a, b) => {
                    if (a.isAdmin && !b.isAdmin) return -1;
                    if (!a.isAdmin && b.isAdmin) return 1;
                    return a.name.localeCompare(b.name);
                });
                
                setUsers(usersData);
                // Check if there are no admins set up yet
                if (!usersData.some(u => u.isAdmin)) {
                    setIsFirstAdmin(true);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                showToast(t('adminPanel.toasts.fetchFailed'), 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [showToast, t]);

    const handleUpdateUser = async (uid: string, status: User['status'], expiresAt: string | null) => {
        try {
            const userRef = db.collection('users').doc(uid);
            const userToUpdate = users.find(u => u.uid === uid);
            if (!userToUpdate) return;
            
            await userRef.update({
                status: status,
                expiresAt: expiresAt ? firebase.firestore.Timestamp.fromDate(new Date(expiresAt)) : null
            });

            // Update local state to reflect changes immediately
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loader className="w-10 h-10 animate-spin text-primary" />
                <p className="ml-4 text-lg text-gray-500 dark:text-gray-400">{t('adminPanel.loadingUsers')}</p>
            </div>
        );
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
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('adminPanel.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('adminPanel.description')}</p>
            <div className="space-y-4">
                {users.map(user => (
                    <UserCard key={user.uid} user={user} onUpdate={handleUpdateUser} />
                ))}
            </div>
        </div>
    );
};