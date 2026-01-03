
import { useUserStore } from '@/stores/user.store';
import { translations, TranslationKeys } from '@/constants/translations';

export const useTranslation = () => {
    const language = useUserStore((state) => state.language);

    const t: TranslationKeys = translations[language] || translations.en;

    return {
        t,
        language,
        setLanguage: useUserStore.getState().setLanguage
    };
};
