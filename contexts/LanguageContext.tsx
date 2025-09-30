import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import enData from '../locales/en';
import viData from '../locales/vi';

type Language = 'en' | 'vi';

export interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useLocalStorage<Language>('language', 'vi');
    const [translations] = useState<Record<Language, any>>({
        en: enData,
        vi: viData,
    });

    const t = useCallback((key: string, options?: Record<string, string | number>): string => {
        const findTranslation = (lang: Language): string | undefined => {
            const keys = key.split('.');
            let result = translations[lang];
            for (const k of keys) {
                result = result?.[k];
                if (result === undefined) return undefined;
            }
            return typeof result === 'string' ? result : undefined;
        };
    
        let translatedString = findTranslation(language);
    
        if (translatedString === undefined && language !== 'en') {
            translatedString = findTranslation('en');
        }
    
        if (translatedString === undefined) {
            console.warn(`Translation key '${key}' not found in any language.`);
            return key;
        }

        if (options) {
            return Object.entries(options).reduce((str, [optKey, value]) => {
                return str.replace(new RegExp(`{{${optKey}}}`, 'g'), String(value));
            }, translatedString);
        }

        return translatedString;
    }, [language, translations]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};