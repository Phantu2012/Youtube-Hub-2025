
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Youtube, Settings, LogOut, Globe, ChevronDown, Calendar, Shield, Edit3, Bot, LayoutDashboard } from 'lucide-react';
import { User } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface HeaderProps {
    user: User | null;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onOpenSettings: () => void;
    onLogout: () => void;
    activeView: 'projects' | 'automation' | 'calendar' | 'admin';
    setActiveView: (view: 'projects' | 'automation' | 'calendar' | 'admin') => void;
}

const NavButton: React.FC<{
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    onClick: () => void
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
            isActive
                ? 'bg-primary/10 text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {icon}
        <span className="hidden lg:inline">{label}</span>
    </button>
);

export const Header: React.FC<HeaderProps> = ({ user, theme, toggleTheme, onOpenSettings, onLogout, activeView, setActiveView }) => {
    const { t, language, setLanguage } = useTranslation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const langMenuRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        // FIX: Corrected a typo, changed `userMenu` to `userMenuRef` to correctly reference the menu's DOM element.
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
        if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
            setIsLangMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleLanguageChange = (lang: 'en' | 'vi') => {
        setLanguage(lang);
        setIsLangMenuOpen(false);
    };

    return (
        <header className="bg-light-card dark:bg-dark-card shadow-md flex-shrink-0 z-40">
            <div className="px-4 md:px-8 py-3 flex justify-between items-center">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Youtube className="text-primary" size={28} />
                        <h1 className="text-xl font-bold text-light-text dark:text-dark-text hidden sm:block">{t('header.title')}</h1>
                    </div>
                </div>

                {/* Center Section - Navigation */}
                <nav className="flex items-center gap-1 sm:gap-2">
                    <NavButton
                        label={t('header.projects')}
                        icon={<LayoutDashboard size={18}/>}
                        isActive={activeView === 'projects'}
                        onClick={() => setActiveView('projects')}
                    />
                    <NavButton
                        label={t('header.automation')}
                        icon={<Bot size={18}/>}
                        isActive={activeView === 'automation'}
                        onClick={() => setActiveView('automation')}
                    />
                    <NavButton
                        label={t('header.calendar')}
                        icon={<Calendar size={18}/>}
                        isActive={activeView === 'calendar'}
                        onClick={() => setActiveView('calendar')}
                    />
                    {user?.isAdmin && (
                         <>
                            <NavButton
                               label={t('header.admin')}
                               icon={<Shield size={18}/>}
                               isActive={activeView === 'admin'}
                               onClick={() => setActiveView('admin')}
                           />
                        </>
                    )}
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                     <div className="relative" ref={langMenuRef}>
                        <button onClick={() => setIsLangMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative" aria-label="Change language">
                             <Globe size={20} />
                             <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-primary text-white rounded-full px-1">{language.toUpperCase()}</span>
                        </button>
                        {isLangMenuOpen && (
                             <div className="absolute right-0 mt-2 w-28 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                                <button onClick={() => handleLanguageChange('en')} className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'font-bold text-primary' : ''} hover:bg-gray-100 dark:hover:bg-gray-700`}>English</button>
                                <button onClick={() => handleLanguageChange('vi')} className={`block w-full text-left px-4 py-2 text-sm ${language === 'vi' ? 'font-bold text-primary' : ''} hover:bg-gray-100 dark:hover:bg-gray-700`}>Tiếng Việt</button>
                            </div>
                        )}
                    </div>

                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('header.toggleTheme')}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    
                    {user && (
                        <div className="relative" ref={userMenuRef}>
                            <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex items-center gap-2">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-60 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-sm truncate">{user.name}</p>
                                            {user.isAdmin && <span title="Administrator" className="text-blue-500"><Shield size={16}/></span>}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <div className="p-1">
                                        <button onClick={() => { onOpenSettings(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <Settings size={16} />
                                            <span>{t('header.openSettings')}</span>
                                        </button>
                                        <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md">
                                            <LogOut size={16} />
                                            <span>{t('header.logout')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
