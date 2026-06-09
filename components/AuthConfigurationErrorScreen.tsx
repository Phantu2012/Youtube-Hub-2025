

import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Copy, RotateCcw, Check, Info } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { firebaseConfig } from '../firebase';

interface AuthConfigurationErrorScreenProps {
  error: {
    code: string;
    domain?: string;
  };
  onResolve: () => void;
}

const InfoCard: React.FC<{
  step: number;
  title: string;
  isHighlighted: boolean;
  children: React.ReactNode;
}> = ({ step, title, isHighlighted, children }) => (
  <div className={`p-4 rounded-lg border ${isHighlighted ? 'border-2 border-red-500 bg-red-500/5' : 'border-gray-300 dark:border-gray-600'}`}>
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

const CodeBlock: React.FC<{ text: string }> = ({ text }) => {
    const { t } = useTranslation();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="flex items-center justify-between gap-2 p-2 bg-gray-200 dark:bg-gray-800 rounded-md">
            <code className="text-sm font-semibold truncate">{text}</code>
            <button onClick={handleCopy} className="p-1 text-gray-500 hover:text-primary" title={t('authConfigError.copy')}>
                {isCopied ? <Check size={16} className="text-green-500"/> : <Copy size={16} />}
            </button>
        </div>
    );
};


export const AuthConfigurationErrorScreen: React.FC<AuthConfigurationErrorScreenProps> = ({ error, onResolve }) => {
  const { t } = useTranslation();
  const redirectUri = `https://` + `${firebaseConfig.authDomain}/__/auth/handler`;
  const origin = window.location.origin;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl text-center bg-light-card dark:bg-dark-card p-6 md:p-8 rounded-xl shadow-2xl">
        <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-3xl font-bold mb-2">{t('authConfigError.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('authConfigError.intro')}
        </p>
        
        <div className="text-left bg-light-bg dark:bg-dark-bg p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          
          <InfoCard step={1} title={t('authConfigError.check1.title')} isHighlighted={error.code === 'auth/operation-not-allowed'}>
              <p>{t('authConfigError.check1.desc')}</p>
              <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow mt-1">
                  {t('authConfigError.check1.button')} <ExternalLink size={16} />
              </a>
          </InfoCard>

          <InfoCard step={2} title={t('authConfigError.check2.title')} isHighlighted={error.code === 'auth/unauthorized-domain'}>
            <p>{t('authConfigError.check2.desc')}</p>
            <p>{t('authConfigError.check2.domainLabel')}</p>
            <CodeBlock text={error.domain || origin} />
            <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow mt-1">
                {t('authConfigError.check2.button')} <ExternalLink size={16} />
            </a>
          </InfoCard>

          <InfoCard step={3} title={t('authConfigError.check3.title')} isHighlighted={false}>
              <p>{t('authConfigError.check3.desc')}</p>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                <Info size={18} className="flex-shrink-0 mt-0.5" />
                <span className="text-xs">{t('authConfigError.check3.note')}</span>
              </div>
              <p className="font-semibold mt-2">{t('authConfigError.check3.originsLabel')}</p>
              <CodeBlock text={origin} />
              <p className="font-semibold mt-2">{t('authConfigError.check3.redirectsLabel')}</p>
              <CodeBlock text={redirectUri} />
              <a href={`https://console.cloud.google.com/apis/credentials?project=${firebaseConfig.projectId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow mt-2">
                  {t('authConfigError.check3.button')} <ExternalLink size={16} />
              </a>
          </InfoCard>

        </div>

        <p className="text-gray-600 dark:text-gray-400 my-6 font-semibold">
          {t('authConfigError.outro')}
        </p>

        <button
          onClick={onResolve}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors"
        >
          <RotateCcw size={20} />
          {t('authConfigError.tryAgainButton')}
        </button>
      </div>
    </div>
  );
};
