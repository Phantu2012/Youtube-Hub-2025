
import React from 'react';
import { Youtube, AlertTriangle, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { firebaseConfig } from '../firebase';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Youtube className="text-primary" size={56} />
          <div>
            <h1 className="text-4xl font-bold text-left">{t('login.titleLine1')}</h1>
            <h1 className="text-4xl font-bold text-left">{t('login.titleLine2')}</h1>
          </div>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {t('login.tagline')}
        </p>
        <div className="bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-2xl max-w-sm mx-auto">
          <h2 className="text-3xl font-bold mb-2">{t('login.signInTitle')}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('login.signInPrompt')}</p>
          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M43.611 20.083H24v8.61h11.011c-1.637 5.564-6.91 9.55-13.011 9.55-7.79 0-14.1-6.31-14.1-14.1s6.31-14.1 14.1-14.1c4.438 0 8.324 2.103 10.74 5.31l6.7-6.7C39.046 3.99 32.11 0 24 0 10.74 0 0 10.74 0 24s10.74 24 24 24c12.572 0 22.92-9.23 23.82-21.356A24.013 24.013 0 0043.611 20.083z"></path>
              <path fill="#34A853" d="M43.611 20.083H24v8.61h11.011c-1.637 5.564-6.91 9.55-13.011 9.55-7.79 0-14.1-6.31-14.1-14.1s6.31-14.1 14.1-14.1c4.438 0 8.324 2.103 10.74 5.31l6.7-6.7C39.046 3.99 32.11 0 24 0 10.74 0 0 10.74 0 24s10.74 24 24 24c12.572 0 22.92-9.23 23.82-21.356A24.013 24.013 0 0043.611 20.083z"></path>
              <path fill="#FBBC05" d="M24 48c6.48 0 12.31-2.14 16.6-5.64l-6.7-6.7c-2.14 1.43-4.88 2.28-7.9 2.28-6.1 0-11.37-4.0-13.2-9.56H3.4v6.86C7.94 42.86 15.4 48 24 48z"></path>
              <path fill="#EA4335" d="M10.8 28.44c-.47-1.4-.73-2.9-.73-4.44s.26-3.04.73-4.44V12.7H3.4C1.24 16.7 0 20.24 0 24s1.24 7.3 3.4 11.3z"></path>
              <path fill="#FFFFFF" d="M43.611 20.083H24v8.61h11.011c-.8 2.7-2.5 4.9-4.8 6.4l6.7 6.7c3.9-3.6 6.6-8.9 6.6-15.1.001-1.48-.14-2.92-.4-4.32z"></path>
            </svg>
            {t('login.signInButton')}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-8 max-w-sm mx-auto">
            {t('login.securityNote')}
        </p>
      </div>

      <div className="w-full max-w-3xl mt-12 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-800 dark:text-yellow-200">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
          <h3 className="text-xl font-bold">{t('login.setupGuide.title')}</h3>
        </div>
        <p className="mt-2 mb-6 text-sm">{t('login.setupGuide.intro')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
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
        </div>
      </div>
    </div>
  );
};
