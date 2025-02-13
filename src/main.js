import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Material from '@primevue/themes/material';
import Button from 'primevue/button';
import './assets/tailwind.css';
import 'primeicons/primeicons.css';

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Material,
    },
});

app.component('Button', Button);

app.mount('#app');