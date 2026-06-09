import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface ExpiredScreenProps {
  onLogout: () => void;
}

export const ExpiredScreen: React.FC<ExpiredScreenProps> = ({ onLogout }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md text-center bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-2xl">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2">{t('expired.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('expired.message')}
        </p>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors"
        >
          <LogOut size={20} />
          {t('header.logout')}
        </button>
      </div>
    </div>
  );
};
