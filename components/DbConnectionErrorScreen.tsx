

import React from 'react';
import { DatabaseZap, ExternalLink, RotateCcw } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { firebaseConfig } from '../firebase';
import { CodeBlock } from './CodeBlock';

interface DbConnectionErrorScreenProps {
  onReset: () => void;
}

const InfoCard: React.FC<{
  step: number;
  title: string;
  children: React.ReactNode;
}> = ({ step, title, children }) => (
  <div className="p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-light-card dark:bg-dark-card">
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">{step}</div>
        <div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                {children}
            </div>
        </div>
    </div>
  </div>
);


export const DbConnectionErrorScreen: React.FC<DbConnectionErrorScreenProps> = ({ onReset }) => {
  const { t } = useTranslation();
  const firestoreUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`;
  const rulesUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`;
  const credentialsUrl = `https://console.cloud.google.com/apis/credentials?project=${firebaseConfig.projectId}`;

  const rulesExample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can manage their own document. Admins can manage any user document.
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow list, get, update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Admins can read/write global settings. Authenticated users can read them.
    match /system_settings/{settingId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Rules for a user's 'channels' subcollection
    match /users/{ownerId}/channels/{channelId} {
      // The owner can do anything with their channel.
      allow create, delete, write: if request.auth.uid == ownerId;

      // Any member of the channel (owner or editor) can read the channel's details.
      allow read: if request.auth.uid in resource.data.members;
    }

    // Rules for a user's 'projects' subcollection
    match /users/{ownerId}/projects/{projectId} {
      // Let channelId be the ID of the channel this project belongs to.
      let channelId = resource.data.channelId;
      // Let channelDoc be the actual channel document.
      let channelDoc = get(/databases/$(database)/documents/users/$(ownerId)/channels/$(channelId));
      
      // Any member of the project's parent channel (owner or editor) can create, read, update, or delete the project.
      allow read, write, create, delete: if request.auth.uid in channelDoc.data.members;
    }
  }
}`;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-3xl text-center bg-light-card dark:bg-dark-card p-6 md:p-8 rounded-xl shadow-2xl">
        <DatabaseZap className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-3xl font-bold mb-2">{t('dbError.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          {t('dbError.intro')}
        </p>

        <div className="text-left bg-light-bg dark:bg-dark-bg p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="font-bold text-xl mb-2 text-center">{t('dbError.howToFixTitle')}</h2>
          
          <InfoCard step={1} title={t('dbError.step1.title')}>
            <p>{t('dbError.step1.description')}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li>{t('dbError.step1.instruction1')}</li>
              <li>{t('dbError.step1.instruction2')}</li>
              <li>{t('dbError.step1.instruction3')}</li>
              <li>{t('dbError.step1.instruction4')}</li>
            </ul>
            <a href={firestoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow mt-2">
              {t('dbError.step1.button')} <ExternalLink size={16} />
            </a>
          </InfoCard>

          <InfoCard step={2} title={t('dbError.step2.title')}>
            <p>{t('dbError.step2.description')}</p>
            <ul className="list-decimal list-inside space-y-2 pl-2 mt-3">
                <li>{t('dbError.step2.instruction1')}</li>
                <li>{t('dbError.step2.instruction2')}</li>
            </ul>
            <CodeBlock code={rulesExample} title={t('dbError.step2.rulesExampleTitle')} />
            <a href={rulesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow mt-4">
              {t('dbError.step2.button')} <ExternalLink size={16} />
            </a>
          </InfoCard>

          <InfoCard step={3} title={t('dbError.step3.title')}>
            <p>{t('dbError.step3.description')}</p>
            <a href={credentialsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow mt-1">
              {t('dbError.step3.button')} <ExternalLink size={16} />
            </a>
          </InfoCard>
        </div>

        <p className="text-gray-600 dark:text-gray-400 my-6 font-semibold">
          {t('dbError.outro')}
        </p>

        <button
          onClick={onReset}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors"
        >
          <RotateCcw size={20} />
          {t('dbError.tryAgainButton')}
        </button>
      </div>
    </div>
  );
};