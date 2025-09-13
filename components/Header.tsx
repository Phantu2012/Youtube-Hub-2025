
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Youtube, Settings, LogOut, LayoutDashboard, Bot, Globe } from 'lucide-react';
import { User } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onOpenSettings: () => void;
    user: User | null;
    onLogout: () => void;
    activeView: 'projects' | 'automation';
    setActiveView: (view: 'projects' | 'automation') => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onOpenSettings, user, onLogout, activeView, setActiveView }) => {
    const { t, setLanguage, language } = useTranslation();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    const NavButton: React.FC<{view: 'projects' | 'automation', label: string, icon: React.ReactNode}> = ({ view, label, icon }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === view
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    // Close the language menu when clicking outside of it.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const handleLanguageChange = (lang: 'en' | 'vi') => {
        setLanguage(lang);
        setIsLangMenuOpen(false);
    }

    return (
        <header className="bg-light-card dark:bg-dark-card shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <Youtube className="text-primary" size={32} />
                        <h1 className="text-xl font-bold text-light-text dark:text-dark-text hidden sm:block">{t('header.title')}</h1>
                    </div>
                     <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-4 flex items-center gap-2">
                        <NavButton view="projects" label={t('header.projects')} icon={<LayoutDashboard size={16}/>} />
                        <NavButton view="automation" label={t('header.automation')} icon={<Bot size={16}/>} />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                         <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                            <span className="font-semibold hidden sm:inline">{user.name}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                         <div className="relative" ref={langMenuRef}>
                            <button
                                onClick={() => setIsLangMenuOpen(prev => !prev)}
                                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                                aria-label="Change language"
                            >
                                <Globe size={20} />
                                <span className="text-xs font-bold">{language.toUpperCase()}</span>
                            </button>
                            <div className={`absolute right-0 mt-2 w-24 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-md shadow-lg transition-opacity duration-200 ${isLangMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                                <button onClick={() => handleLanguageChange('en')} className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'font-bold text-primary' : ''} hover:bg-gray-100 dark:hover:bg-gray-700`}>English</button>
                                <button onClick={() => handleLanguageChange('vi')} className={`block w-full text-left px-4 py-2 text-sm ${language === 'vi' ? 'font-bold text-primary' : ''} hover:bg-gray-100 dark:hover:bg-gray-700`}>Tiếng Việt</button>
                            </div>
                        </div>

                        <button
                            onClick={onOpenSettings}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label={t('header.openSettings')}
                        >
                           <Settings size={20} />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label={t('header.toggleTheme')}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        {user && (
                            <button
                                onClick={onLogout}
                                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                aria-label={t('header.logout')}
                            >
                               <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
