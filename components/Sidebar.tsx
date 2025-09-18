
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Youtube, Settings, LogOut, LayoutDashboard, Bot, Globe } from 'lucide-react';
import { User } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SidebarProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onOpenSettings: () => void;
    user: User | null;
    onLogout: () => void;
    activeView: 'projects' | 'automation';
    setActiveView: (view: 'projects' | 'automation') => void;
}

const NavButton: React.FC<{
    view: 'projects' | 'automation',
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    onClick: () => void
}> = ({ view, label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            isActive
                ? 'bg-primary/10 text-primary'
                : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ActionButton: React.FC<{
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    className?: string,
}> = ({ label, icon, onClick, className = '' }) => (
     <button
        onClick={onClick}
        className={`p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${className}`}
        aria-label={label}
        title={label}
    >
        {icon}
    </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ theme, toggleTheme, onOpenSettings, user, onLogout, activeView, setActiveView }) => {
    const { t, setLanguage, language } = useTranslation();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (lang: 'en' | 'vi') => {
        setLanguage(lang);
        setIsLangMenuOpen(false);
    }

    return (
         <aside className="hidden md:flex flex-col w-64 bg-light-card dark:bg-dark-card shadow-lg flex-shrink-0">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                <Youtube className="text-primary" size={32} />
                <h1 className="text-xl font-bold text-light-text dark:text-dark-text">{t('header.title')}</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavButton
                    view="projects"
                    label={t('header.projects')}
                    icon={<LayoutDashboard size={20} />}
                    isActive={activeView === 'projects'}
                    onClick={() => setActiveView('projects')}
                />
                <NavButton
                    view="automation"
                    label={t('header.automation')}
                    icon={<Bot size={20} />}
                    isActive={activeView === 'automation'}
                    onClick={() => setActiveView('automation')}
                />
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                {user && (
                    <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div className="overflow-hidden">
                           <p className="font-semibold text-sm truncate">{user.name}</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-around">
                    <div className="relative" ref={langMenuRef}>
                        <ActionButton
                            onClick={() => setIsLangMenuOpen(prev => !prev)}
                            label="Change language"
                            icon={<>
                                <Globe size={20} />
                                <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-primary text-white rounded-full px-1">{language.toUpperCase()}</span>
                           </>}
                        />
                        <div className={`absolute bottom-full right-0 mb-2 w-28 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-md shadow-lg transition-opacity duration-200 ${isLangMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                            <button onClick={() => handleLanguageChange('en')} className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'font-bold text-primary' : ''} hover:bg-gray-100 dark:hover:bg-gray-700`}>English</button>
                            <button onClick={() => handleLanguageChange('vi')} className={`block w-full text-left px-4 py-2 text-sm ${language === 'vi' ? 'font-bold text-primary' : ''} hover:bg-gray-100 dark:hover:bg-gray-700`}>Tiếng Việt</button>
                        </div>
                    </div>
                    
                    <ActionButton onClick={onOpenSettings} label={t('header.openSettings')} icon={<Settings size={20} />} />
                    <ActionButton onClick={toggleTheme} label={t('header.toggleTheme')} icon={theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} />

                    {user && (
                        <ActionButton onClick={onLogout} label={t('header.logout')} icon={<LogOut size={20} />} />
                    )}
                </div>
            </div>
         </aside>
    );
};
