
import React from 'react';
import { DatabaseZap, ExternalLink, RotateCcw } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface DbConnectionErrorScreenProps {
  error: {
    type: 'generic' | 'unavailable';
    message: string;
  };
  onReset: () => void;
}

const FIREBASE_PROJECT_ID = 'video-hub-1aabc';

export const DbConnectionErrorScreen: React.FC<DbConnectionErrorScreenProps> = ({ error, onReset }) => {
  const { t } = useTranslation();

  const renderUnavailableError = () => (
    <>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {t('dbError.unavailableIntro')}
      </p>
      <div className="text-left bg-light-bg dark:bg-dark-bg p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <h3 className="font-bold text-lg mb-4 text-center">{t('dbError.setupTitle')}</h3>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
          <div>
            <p className="font-semibold">{t('dbError.step1.title')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('dbError.step1.description')}</p>
            <a
              href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
            >
              {t('dbError.step1.button')} <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
          <div>
            <p className="font-semibold">{t('dbError.step2.title')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dbError.step2.description')}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
          <div>
            <p className="font-semibold">{t('dbError.step3.title')}</p>
             <p className="text-sm text-gray-500 dark:text-gray-400">{t('dbError.step3.description')}</p>
          </div>
        </div>
      </div>
    </>
  );

  const renderGenericError = () => (
    <>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {error.message}
      </p>
      <div className="text-left bg-light-bg dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">{t('dbError.troubleshootingTitle')}</h3>
          <ul className="list-disc list-inside text-sm space-y-3 text-gray-600 dark:text-gray-400">
              <li>{t('dbError.check1')}</li>
              <li>{t('dbError.check2')}</li>
              <li>{t('dbError.check3')}</li>
          </ul>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl text-center bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-2xl">
        <DatabaseZap className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-3xl font-bold mb-2">{t('dbError.title')}</h1>
        
        {error.type === 'unavailable' ? renderUnavailableError() : renderGenericError()}

        <button
          onClick={onReset}
          className="mt-8 w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors"
        >
          <RotateCcw size={20} />
          {t('dbError.backToLogin')}
        </button>
      </div>
    </div>
  );
};
