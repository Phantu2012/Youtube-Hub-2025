import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Loader } from 'lucide-react';

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
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
    const [translations, setTranslations] = useState<Record<Language, any> | null>(null);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                // Paths are relative to the root of the application (index.html)
                const [enResponse, viResponse] = await Promise.all([
                    fetch('./locales/en.json'),
                    fetch('./locales/vi.json')
                ]);
                if (!enResponse.ok || !viResponse.ok) {
                    throw new Error(`Failed to fetch translation files. Status: ${enResponse.status}, ${viResponse.status}`);
                }
                const enData = await enResponse.json();
                const viData = await viResponse.json();
                setTranslations({
                    en: enData,
                    vi: viData
                });
            } catch (error) {
                console.error("Failed to load translations:", error);
                // Fallback to empty objects to prevent app from crashing
                setTranslations({ en: {}, vi: {} });
            }
        };

        fetchTranslations();
    }, []);

    const t = useCallback((key: string, options?: Record<string, string | number>): string => {
        if (!translations) {
            return key; // Should not happen due to the loading guard below
        }

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

    if (!translations) {
        return (
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex justify-center items-center text-light-text dark:text-dark-text">
                <Loader className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-lg">Loading language files...</p>
            </div>
        );
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
