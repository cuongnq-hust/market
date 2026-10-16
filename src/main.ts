import { createApp } from 'vue';
import 'leaflet/dist/leaflet.css';
import './assets/main.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);
app.mount('#app');

// Register Service Worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

