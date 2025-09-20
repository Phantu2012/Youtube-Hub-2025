


import React, { useState } from 'react';
import { Youtube, AlertTriangle, ExternalLink, Loader } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { firebaseConfig } from '../firebase';

interface LoginScreenProps {
  onLoginWithGoogle: () => void;
  onLoginWithEmail: (email: string, password: string) => Promise<void>;
  onRegisterWithEmail: (email: string, password: string) => Promise<void>;
}

type AuthTab = 'login' | 'register';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginWithGoogle, onLoginWithEmail, onRegisterWithEmail }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await onLoginWithEmail(email, password);
      } else {
        await onRegisterWithEmail(email, password);
      }
      // On success, the onAuthStateChanged listener in App.tsx will handle the navigation.
    } catch (error) {
      // Error toast is shown in the handler in App.tsx
      console.error("Auth form submission error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton: React.FC<{ tab: AuthTab; label: string }> = ({ tab, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`w-1/2 py-3 text-center font-semibold border-b-2 transition-colors ${
        activeTab === tab
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-light-text dark:hover:text-dark-text'
      }`}
    >
      {label}
    </button>
  );

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
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <TabButton tab="login" label={t('login.signInTab')} />
            <TabButton tab="register" label={t('login.registerTab')} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">{t('login.email')}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder={t('login.email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t('login.password')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder={t('login.password')}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors disabled:opacity-70"
            >
              {isLoading && <Loader size={20} className="animate-spin" />}
              {activeTab === 'login' ? t('login.signInButton') : t('login.createAccountButton')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-light-card dark:bg-dark-card text-gray-500">{t('login.orContinueWith')}</span>
            </div>
          </div>

          <button
            onClick={onLoginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M43.611 20.083H24v8.61h11.011c-1.637 5.564-6.91 9.55-13.011 9.55-7.79 0-14.1-6.31-14.1-14.1s6.31-14.1 14.1-14.1c4.438 0 8.324 2.103 10.74 5.31l6.7-6.7C39.046 3.99 32.11 0 24 0 10.74 0 0 10.74 0 24s10.74 24 24 24c12.572 0 22.92-9.23 23.82-21.356A24.013 24.013 0 0043.611 20.083z"></path>
              <path fill="#34A853" d="M43.611 20.083H24v8.61h11.011c-1.637 5.564-6.91 9.55-13.011 9.55-7.79 0-14.1-6.31-14.1-14.1s6.31-14.1 14.1-14.1c4.438 0 8.324 2.103 10.74 5.31l6.7-6.7C39.046 3.99 32.11 0 24 0 10.74 0 0 10.74 0 24s10.74 24 24 24c12.572 0 22.92-9.23 23.82-21.356A24.013 24.013 0 0043.611 20.083z"></path>
              <path fill="#FBBC05" d="M24 48c6.48 0 12.31-2.14 16.6-5.64l-6.7-6.7c-2.14 1.43-4.88 2.28-7.9 2.28-6.1 0-11.37-4.0-13.2-9.56H3.4v6.86C7.94 42.86 15.4 48 24 48z"></path>
              <path fill="#EA4335" d="M10.8 28.44c-.47-1.4-.73-2.9-.73-4.44s.26-3.04.73-4.44V12.7H3.4C1.24 16.7 0 20.24 0 24s1.24 7.3 3.4 11.3z"></path>
              <path fill="#FFFFFF" d="M43.611 20.083H24v8.61h11.011c-.8 2.7-2.5 4.9-4.8 6.4l6.7 6.7c3.9-3.6 6.6-8.9 6.6-15.1.001-1.48-.14-2.92-.4-4.32z"></path>
            </svg>
            {t('login.signInWithGoogle')}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-8 max-w-sm mx-auto">
            {t('login.securityNote')}
        </p>
      </div>
    </div>
  );
};