
import React, { useState, useEffect } from 'react';
import { db, firebaseConfig, firebase } from '../firebase';
import { useTranslation } from '../hooks/useTranslation';
import { Loader, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { User } from '../types';

interface SystemCheckPanelProps {
    user: User;
}

type CheckStatus = 'pending' | 'ok' | 'warning' | 'error';

interface CheckResult {
    id: string;
    titleKey: string;
    status: CheckStatus;
    messageKey: string;
    resolutionUrl?: string;
    resolutionKey?: string;
}

const StatusIcon: React.FC<{ status: CheckStatus }> = ({ status }) => {
    switch (status) {
        case 'pending':
            return <Loader size={20} className="animate-spin text-gray-400" />;
        case 'ok':
            return <CheckCircle size={20} className="text-green-500" />;
        case 'warning':
            return <AlertTriangle size={20} className="text-yellow-500" />;
        case 'error':
            return <XCircle size={20} className="text-red-500" />;
        default:
            return null;
    }
};

export const SystemCheckPanel: React.FC<SystemCheckPanelProps> = ({ user }) => {
    const { t } = useTranslation();
    const [checks, setChecks] = useState<CheckResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const runChecks = async () => {
            const results: CheckResult[] = [];
            
            // 1. Firebase Config Check
            results.push({ id: 'firebaseConfig', titleKey: 'adminPanel.systemCheck.firebaseConfig.title', status: 'pending', messageKey: '' });
            setChecks([...results]);
            const configValid = Object.values(firebaseConfig).every(val => val && !val.includes('AIza') && !val.includes("YOUR_"));
            results[0].status = configValid ? 'ok' : 'error';
            results[0].messageKey = configValid ? 'adminPanel.systemCheck.firebaseConfig.ok' : 'adminPanel.systemCheck.firebaseConfig.error';

            // 2. Firestore Connectivity & Rules Check
            results.push({ id: 'firestore', titleKey: 'adminPanel.systemCheck.firestore.title', status: 'pending', messageKey: '' });
            setChecks([...results]);
            try {
                await db.collection('system_settings').doc('automation_prompts').get();
                results[1].status = 'ok';
                results[1].messageKey = 'adminPanel.systemCheck.firestore.ok';
            } catch (e: any) {
                if (e.code === 'permission-denied') {
                    results[1].status = 'warning';
                    results[1].messageKey = 'adminPanel.systemCheck.firestore.warning';
                    results[1].resolutionKey = 'adminPanel.systemCheck.firestore.resolution';
                    results[1].resolutionUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`;
                } else {
                    results[1].status = 'error';
                    results[1].messageKey = 'adminPanel.systemCheck.firestore.error';
                    results[1].resolutionKey = 'adminPanel.systemCheck.firestore.resolution';
                    results[1].resolutionUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data`;
                }
            }
            setChecks([...results]);
            
            // 3. Admin Status Check
            results.push({ id: 'adminStatus', titleKey: 'adminPanel.systemCheck.adminStatus.title', status: 'pending', messageKey: '' });
            setChecks([...results]);
            const adminCheck = user.isAdmin;
            results[2].status = adminCheck ? 'ok' : 'error';
            results[2].messageKey = adminCheck ? 'adminPanel.systemCheck.adminStatus.ok' : 'adminPanel.systemCheck.adminStatus.error';
            results[2].resolutionKey = 'adminPanel.systemCheck.adminStatus.resolution';
            results[2].resolutionUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/data/users/${user.uid}`;
            setChecks([...results]);

            // 4. API Keys Check
            results.push({ id: 'apiKeys', titleKey: 'adminPanel.systemCheck.apiKeys.title', status: 'pending', messageKey: '' });
            setChecks([...results]);
            const storedKeys = localStorage.getItem('api-keys');
            const keys = storedKeys ? JSON.parse(storedKeys) : {};
            const youtubeKeyPresent = keys.youtube && keys.youtube.length > 5;
            results[3].status = youtubeKeyPresent ? 'ok' : 'warning';
            results[3].messageKey = youtubeKeyPresent ? 'adminPanel.systemCheck.apiKeys.ok' : 'adminPanel.systemCheck.apiKeys.warning';
            setChecks([...results]);
            
            // 5. Sharing Index Check
            results.push({ id: 'sharingIndex', titleKey: 'adminPanel.systemCheck.sharingIndex.title', status: 'pending', messageKey: '' });
            setChecks([...results]);
            try {
                // This query requires the index. It will fail if the index is missing.
                await db.collectionGroup('channels').where('memberIds', 'array-contains', 'test-user').limit(1).get();
                results[4].status = 'ok';
                results[4].messageKey = 'adminPanel.systemCheck.sharingIndex.ok';
            } catch (e: any) {
                if (e.code === 'failed-precondition') {
                    const urlMatch = e.message.match(/(https:\/\/[^\s]+)/);
                    results[4].status = 'error';
                    results[4].messageKey = 'adminPanel.systemCheck.sharingIndex.error';
                    results[4].resolutionKey = 'adminPanel.systemCheck.sharingIndex.resolution';
                    results[4].resolutionUrl = urlMatch ? urlMatch[0] : `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/indexes`;
                } else {
                    // Another error occurred, but it's not the missing index one.
                    results[4].status = 'ok';
                    results[4].messageKey = 'adminPanel.systemCheck.sharingIndex.ok'; // Assume ok if error is not precondition
                }
            }
            setChecks([...results]);

            setIsLoading(false);
        };
        runChecks();
    }, []);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('adminPanel.systemCheck.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('adminPanel.systemCheck.description')}</p>
                </div>
            </div>
            <div className="space-y-4">
                {checks.map(check => (
                    <div key={check.id} className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md flex items-start gap-4">
                        <div className="mt-1">
                            <StatusIcon status={check.status} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-light-text dark:text-dark-text">{t(check.titleKey)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t(check.messageKey)}</p>
                            {check.status !== 'ok' && check.status !== 'pending' && check.resolutionKey && (
                                <div className="mt-3">
                                    <a
                                        href={check.resolutionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg shadow"
                                    >
                                        {t(check.resolutionKey)} <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
