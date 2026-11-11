import { createApp, watch } from 'vue'
import {useAuthStore} from "./iam/store/auth.store.js";
import './style.css'
import i18n from "./i18n.js";
import { PrimeVue } from "@primevue/core";
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import sharedComponents from './shared/components/index.js';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import {
    Button,
    Card,
    Column,
    ConfirmationService,
    ConfirmDialog,
    Calendar,
    Checkbox,
    DataTable,
    ToggleSwitch,
    Slider,
    Dropdown,
    Dialog,
    DialogService,
    Drawer,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Menu,
    ProgressSpinner,
    Rating,
    RadioButton,
    SelectButton,
    Tag,
    Textarea,
    Toast,
    ToastService,
    Toolbar,
    Message,
    Fieldset,
    Password

} from "primevue";

import Chart from 'primevue/chart';

import pinia from "./pinia.js";
import router, { updateDocumentTitle } from "./router/index.js";
import App from "./App.vue";

// Aura preset with the OsitoPolar brand blue (#0079c2) as the primary scale.
const OsitoPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#ebf5fb', 100: '#d0e6f5', 200: '#a0cfeb', 300: '#63afde', 400: '#2f94d1',
            500: '#0079c2', 600: '#0068a6', 700: '#00578a', 800: '#00466e', 900: '#003552', 950: '#00243a'
        }
    }
});

if (import.meta.env.VITE_DEMO_MODE === 'true') i18n.global.locale = 'es';

// keep <html lang> and the tab title in sync with the active locale
watch(() => i18n.global.locale, (locale) => {
    document.documentElement.lang = locale;
    updateDocumentTitle();
}, { immediate: true });

const app = createApp(App);
app.use(i18n)
    .use(pinia)
    .use(PrimeVue, {
        ripple: true,
        theme: {
            preset: OsitoPreset,
            // light-only app: this class is never applied, so dark mode stays off
            options: { darkModeSelector: '.op-dark-never', cssLayer: false }
        }
    })
    .use(sharedComponents)
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-button',         Button)
    .component('pv-card',           Card)
    .component('pv-chart',          Chart)
    .component('pv-input-switch',   ToggleSwitch)
    .component('pv-slider',         Slider)
    .component('pv-column',         Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-data-table',     DataTable)
    .component('pv-dialog',         Dialog)
    .component('pv-select-button',  SelectButton)
    .component('pv-float-label',    FloatLabel)
    .component('pv-icon-field',     IconField)
    .component('pv-input-icon',     InputIcon)
    .component('pv-input-text',     InputText)
    .component('pv-dropdown',       Dropdown)
    .component('pv-input-number',   InputNumber)
    .component('pv-menu',           Menu)
    .component('pv-progress-spinner', ProgressSpinner)
    .component('pv-radio-button',   RadioButton)
    .component('pv-rating',         Rating)
    .component('pv-drawer',         Drawer)
    .component('pv-checkbox',       Checkbox)
    .component('pv-tag',            Tag)
    .component('pv-calendar',       Calendar)
    .component('pv-textarea',       Textarea)
    .component('pv-toolbar',        Toolbar)
    .component('pv-toast',          Toast)
    .component('pv-message',        Message)
    .component('pv-fieldset',       Fieldset)
    .component('pv-password',       Password)
    .use(router)
    .mount('#app')
const authStore = useAuthStore();
authStore.initializeAuth();