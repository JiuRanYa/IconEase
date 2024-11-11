import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export const useLanguage = () => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setCurrentLanguage(lng);
    };

    useEffect(() => {
        setCurrentLanguage(i18n.language);
    }, [i18n.language]);

    return {
        currentLanguage,
        changeLanguage,
    };
}; 