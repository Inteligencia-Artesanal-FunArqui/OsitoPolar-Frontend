import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';

// Spanish is the default; a saved choice from the language switcher wins (same keys as the switcher).
const storageKey = import.meta.env.VITE_DEMO_MODE === 'true'
    ? 'ositopolar-vue-demo-language'
    : 'user-language';

function initialLocale() {
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved === 'en' || saved === 'es') return saved;
    } catch { /* storage can be blocked; fall through to the default */ }
    return 'es';
}

const i18n = createI18n({
    locale: initialLocale(),
    fallbackLocale: 'en',
    globalInjection: true,
    messages: { en, es },
});

export default i18n;
