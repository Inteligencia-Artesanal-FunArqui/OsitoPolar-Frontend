import { createApp } from 'vue'
import {useAuthStore} from "./iam/store/auth.store.js";
import './style.css'
import i18n from "./i18n.js";
import { PrimeVue } from "@primevue/core";
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
import router from "./router/index.js";
import App from "./App.vue";

const app = createApp(App);
app.use(i18n)
    .use(pinia)
    .use(PrimeVue, { ripple: true})
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