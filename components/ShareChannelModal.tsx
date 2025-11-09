import React, { useState, useEffect, useRef } from 'react';
import { Channel, User, Role } from '../types';
import { X, Send, Loader, Trash2, Crown, Edit } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { db, firebase } from '../firebase';
import { getDefaultRoles } from '../constants';

interface ShareChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: Channel;
    currentUser: User;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    onUpdateMembers: (channel: Channel, newMembers: Channel['members']) => void;
}

export const ShareChannelModal: React.FC<ShareChannelModalProps> = ({ isOpen, onClose, channel, currentUser, showToast, onUpdateMembers }) => {
    const { t } = useTranslation();
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [members, setMembers] = useState<User[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const confirmTimerRef = useRef<number | null>(null);
    const channelRoles = channel.roles || getDefaultRoles(t);

    useEffect(() => {
        if (!isOpen) return;

        const memberUids = Object.keys(channel.members);
        if (memberUids.length > 0) {
            const fetchMembers = async () => {
                const memberDocs = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', memberUids).get();
                const memberData = memberDocs.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
                setMembers(memberData);
            };
            fetchMembers();
        } else {
            setMembers([]);
        }
    }, [isOpen, channel.members]);
    
    useEffect(() => {
        return () => {
            if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
        };
    }, []);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;

        setIsInviting(true);
        try {
            const userQuery = await db.collection('users').where('email', '==', inviteEmail.trim()).limit(1).get();

            if (userQuery.empty) {
                showToast(t('toasts.userNotFound'), 'error');
                return;
            }

            const invitedUser = userQuery.docs[0];
            const invitedUserId = invitedUser.id;

            if (channel.members[invitedUserId]) {
                showToast(t('toasts.userAlreadyMember'), 'error');
                return;
            }
            
            const newMembers = { ...channel.members, [invitedUserId]: 'editor' };
            onUpdateMembers(channel, newMembers);
            showToast(t('toasts.userAdded'), 'success');
            setInviteEmail('');

        } catch (error) {
            console.error("Error inviting user:", error);
            showToast(t('toasts.updateMembersFailed'), 'error');
        } finally {
            setIsInviting(false);
        }
    };
    
    const handleRoleChange = (memberUid: string, newRoleId: string) => {
        const newMembers = { ...channel.members, [memberUid]: newRoleId };
        onUpdateMembers(channel, newMembers);
    };

    const handleRemove = (memberUid: string) => {
         if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);

        if (confirmDeleteId === memberUid) {
            const newMembers = { ...channel.members };
            delete newMembers[memberUid];
            onUpdateMembers(channel, newMembers);
            showToast(t('toasts.userRemoved'), 'info');
            setConfirmDeleteId(null);
        } else {
            setConfirmDeleteId(memberUid);
            confirmTimerRef.current = window.setTimeout(() => setConfirmDeleteId(null), 4000);
        }
    };

    if (!isOpen) return null;

    const isOwner = currentUser.uid === channel.ownerId;
    const availableRoles = channelRoles.filter(r => r.id !== 'owner');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold truncate">{t('shareModal.title', { channelName: channel.name })}</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X /></button>
                    </div>
                </div>
                
                {isOwner && (
                    <div className="p-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                        <label className="font-semibold text-sm mb-2 block">{t('shareModal.invite')}</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder={t('shareModal.invitePlaceholder')}
                                className="flex-grow p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                                disabled={isInviting}
                            />
                            <button
                                onClick={handleInvite}
                                disabled={isInviting}
                                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg disabled:bg-opacity-70"
                            >
                                {isInviting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                                {isInviting ? t('shareModal.inviting') : t('shareModal.invite')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-grow overflow-y-auto p-6">
                     <h3 className="font-semibold text-sm mb-4">{t('shareModal.members')}</h3>
                     <div className="space-y-3">
                        {members.map(member => {
                            const roleId = channel.members[member.uid];
                            const role = channelRoles.find(r => r.id === roleId);
                            const isCurrentUser = member.uid === currentUser.uid;
                            const isMemberOwner = member.uid === channel.ownerId;

                            return (
                                <div key={member.uid} className="flex items-center justify-between p-3 bg-light-bg dark:bg-dark-bg/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-semibold">{member.name} {isCurrentUser && <span className="text-xs text-blue-500">({t('shareModal.you')})</span>}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {isMemberOwner ? (
                                            <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                <Crown size={12}/>
                                                {role?.name || t('roles.owner')}
                                            </span>
                                        ) : (
                                            <select
                                                value={roleId}
                                                onChange={(e) => handleRoleChange(member.uid, e.target.value)}
                                                disabled={!isOwner}
                                                className="text-xs p-1.5 rounded-md border-gray-300 dark:border-gray-600 bg-light-card dark:bg-dark-card focus:ring-primary focus:border-primary disabled:opacity-70"
                                            >
                                                {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                        )}
                                        {isOwner && !isMemberOwner && (
                                            <button 
                                                onClick={() => handleRemove(member.uid)}
                                                className={`p-2 rounded-md transition-colors ${confirmDeleteId === member.uid ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-red-500'}`}
                                                title={t('shareModal.remove')}
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>

            </div>
        </div>
    );
};