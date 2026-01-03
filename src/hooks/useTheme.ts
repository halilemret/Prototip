import { useUserStore } from '@/stores/user.store';
import { darkColors, lightColors } from '@/constants/theme';

export const useTheme = () => {
    const theme = useUserStore((state) => state.theme);
    const colors = theme === 'light' ? lightColors : darkColors;

    return {
        theme,
        colors,
        isDark: theme === 'dark',
    };
};
