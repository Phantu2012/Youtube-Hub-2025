
import React from 'react';
import { ShieldAlert, ExternalLink, Copy, RotateCcw } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { firebaseConfig } from '../firebase';

interface AuthConfigurationErrorScreenProps {
  error: {
    code: string;
    domain?: string;
  };
  onResolve: () => void;
}

export const AuthConfigurationErrorScreen: React.FC<AuthConfigurationErrorScreenProps> = ({ error, onResolve }) => {
  const { t } = useTranslation();

  const handleCopy = () => {
    if (error.domain) {
      navigator.clipboard.writeText(error.domain);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-3xl text-center bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-2xl">
        <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-3xl font-bold mb-2">{t('authConfigError.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('authConfigError.intro')}
        </p>
        
        <div className="text-left bg-light-bg dark:bg-dark-bg p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">

          {/* Problem 1: Google Sign-In Disabled */}
          <div className={`p-4 rounded-lg ${error.code === 'auth/operation-not-allowed' ? 'border-2 border-red-500 bg-red-500/5' : 'border border-gray-300 dark:border-gray-600'}`}>
            <h3 className="font-bold text-lg mb-2">{t('authConfigError.problem1Title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('authConfigError.problem1Intro')}</p>
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
                    <div>
                        <p className="font-semibold">{t('authConfigError.step1Title')}</p>
                        <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow mt-2">
                            {t('authConfigError.step1Button')} <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
                    <div>
                        <p className="font-semibold">{t('authConfigError.step2Title')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('authConfigError.step2Desc')}</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Problem 2: Unauthorized Domain */}
          <div className={`p-4 rounded-lg ${error.code === 'auth/unauthorized-domain' ? 'border-2 border-red-500 bg-red-500/5' : 'border border-gray-300 dark:border-gray-600'}`}>
            <h3 className="font-bold text-lg mb-2">{t('authConfigError.problem2Title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('authConfigError.problem2Intro')}</p>
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
                    <div>
                        <p className="font-semibold">{t('authConfigError.step3Title')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('authConfigError.step3Desc')}</p>
                         <div className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-800 rounded-md">
                            <code className="text-sm font-semibold">{error.domain}</code>
                            <button onClick={handleCopy} className="p-1 text-gray-500 hover:text-primary" title={t('authConfigError.copyDomain')}>
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">4</div>
                    <div>
                        <p className="font-semibold">{t('authConfigError.step4Title')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('authConfigError.step4Desc')}</p>
                        <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow">
                            {t('authConfigError.step4Button')} <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
          </div>
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