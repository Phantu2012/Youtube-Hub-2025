
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Language = 'en' | 'vi';

const initialTranslations: Record<Language, any> = { en: {}, vi: {} };

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
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [translations, setTranslations] = useState<Record<Language, any>>(initialTranslations);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                // Use fetch with absolute paths to load translation files
                const [enResponse, viResponse] = await Promise.all([
                    fetch('/locales/en.json'),
                    fetch('/locales/vi.json')
                ]);
                const enData = await enResponse.json();
                const viData = await viResponse.json();
                setTranslations({ en: enData, vi: viData });
                setIsLoaded(true);
            } catch (error) {
                console.error('Failed to load translations:', error);
            }
        };
        loadTranslations();
    }, []);

    const t = useCallback((key: string, options?: Record<string, string | number>): string => {
        if (!isLoaded) {
            return key; // Return the key itself if translations are not loaded yet
        }

        const keys = key.split('.');
        let result = translations[language];
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                // Fallback to English if key not found in current language
                let fallbackResult = translations['en'];
                for (const fk of keys) {
                    fallbackResult = fallbackResult?.[fk];
                }
                result = fallbackResult;
                break;
            }
        }

        if (typeof result !== 'string') {
            console.warn(`Translation key '${key}' not found.`);
            return key;
        }

        if (options) {
            result = Object.entries(options).reduce((str, [key, value]) => {
                return str.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            }, result);
        }

        return result;
    }, [language, translations, isLoaded]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
