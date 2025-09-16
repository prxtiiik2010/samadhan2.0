import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', rtl: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سندھی', rtl: true },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মেইতেই লোন্' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    () => {
      const savedLanguage = localStorage.getItem('samadhan-language');
      return SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage) || SUPPORTED_LANGUAGES[0];
    }
  );

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const translationModule = await import(`../translations/${currentLanguage.code}.ts`);
        setTranslations(translationModule.default);
      } catch (error) {
        // Try fallback to English first
        try {
          const fallbackModule = await import('../translations/en.ts');
          setTranslations(fallbackModule.default);
          console.warn(`Translation file for ${currentLanguage.code} not found, using English`);
        } catch (fallbackError) {
          // Use base fallback if English also fails
          try {
            const baseFallback = await import('../translations/fallback.ts');
            setTranslations(baseFallback.default);
            console.warn('Using base fallback translations');
          } catch (finalError) {
            console.error('Failed to load any translation files:', finalError);
            setTranslations({});
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('samadhan-language', currentLanguage.code);
    
    // Update document direction for RTL languages
    document.documentElement.dir = currentLanguage.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  const t = (key: string, defaultValue?: string) => {
    return translations[key] || defaultValue || key;
  };

  const value = {
    currentLanguage,
    setLanguage,
    t,
    isRTL: currentLanguage.rtl || false
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};