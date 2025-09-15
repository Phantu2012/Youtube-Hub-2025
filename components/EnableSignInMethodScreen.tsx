
import React from 'react';
import { ShieldAlert, ExternalLink, RotateCcw } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface EnableSignInMethodScreenProps {
  onResolve: () => void;
}

const FIREBASE_PROJECT_ID = 'youtube-video-hub-1017358933371';

export const EnableSignInMethodScreen: React.FC<EnableSignInMethodScreenProps> = ({ onResolve }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl text-center bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-2xl">
        <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-3xl font-bold mb-2">{t('enableSignInError.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('enableSignInError.intro')}
        </p>
        
        <div className="text-left bg-light-bg dark:bg-dark-bg p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-lg mb-4 text-center">{t('enableSignInError.howToFixTitle')}</h3>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
            <div>
              <p className="font-semibold">{t('enableSignInError.step1Title')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('enableSignInError.step1Desc')}</p>
              <a
                href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
              >
                {t('enableSignInError.step1Button')} <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
            <div>
              <p className="font-semibold">{t('enableSignInError.step2Title')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('enableSignInError.step2Desc')}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
            <div>
              <p className="font-semibold">{t('enableSignInError.step3Title')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('enableSignInError.step3Desc')}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onResolve}
          className="mt-8 w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors"
        >
          <RotateCcw size={20} />
          {t('enableSignInError.tryAgainButton')}
        </button>
      </div>
    </div>
  );
};
