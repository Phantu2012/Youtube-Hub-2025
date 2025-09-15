
import React from 'react';
import { ShieldAlert, ExternalLink, Copy, RotateCcw } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface AuthErrorScreenProps {
  domain: string;
  onResolve: () => void;
}

const FIREBASE_PROJECT_ID = 'youtube-video-hub-1017358933371';

export const AuthErrorScreen: React.FC<AuthErrorScreenProps> = ({ domain, onResolve }) => {
  const { t } = useTranslation();

  const handleCopy = () => {
    navigator.clipboard.writeText(domain);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl text-center bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-2xl">
        <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-3xl font-bold mb-2">{t('authError.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('authError.intro')}
        </p>
        
        <div className="text-left bg-light-bg dark:bg-dark-bg p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-lg mb-4 text-center">{t('authError.howToFixTitle')}</h3>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
            <div>
              <p className="font-semibold">{t('authError.step1Title')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('authError.step1Desc')}</p>
              <div className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-800 rounded-md">
                <code className="text-sm font-semibold">{domain}</code>
                <button onClick={handleCopy} className="p-1 text-gray-500 hover:text-primary" title={t('authError.copyDomain')}>
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
            <div>
              <p className="font-semibold">{t('authError.step2Title')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('authError.step2Desc')}</p>
              <a
                href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
              >
                {t('authError.step2Button')} <ExternalLink size={16} />
              </a>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
            <div>
              <p className="font-semibold">{t('authError.step3Title')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('authError.step3Desc')}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onResolve}
          className="mt-8 w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors"
        >
          <RotateCcw size={20} />
          {t('authError.tryAgainButton')}
        </button>
      </div>
    </div>
  );
};
