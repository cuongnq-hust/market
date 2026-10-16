import { ref, onMounted } from 'vue';

const deferredPrompt = ref<any>(null);
const canInstall = ref(false);
const isInstalled = ref(false);
const isIos = ref(false);
const showIosModal = ref(false);

export function usePwaInstall() {
  onMounted(() => {
    if (typeof window === 'undefined') return;

    // Kiểm tra xem đã chạy ở chế độ standalone (đã cài đặt app) hay chưa
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      isInstalled.value = true;
      return;
    }

    // Kiểm tra xem có phải thiết bị iOS (iPhone/iPad Safari) không
    const ua = window.navigator.userAgent.toLowerCase();
    isIos.value = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;

    // Bắt sự kiện beforeinstallprompt của Chrome / Android / Edge
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt.value = e;
      canInstall.value = true;
    });

    window.addEventListener('appinstalled', () => {
      isInstalled.value = true;
      canInstall.value = false;
      deferredPrompt.value = null;
    });
  });

  const promptInstall = async (): Promise<boolean> => {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      const choiceResult = await deferredPrompt.value.userChoice;
      if (choiceResult.outcome === 'accepted') {
        canInstall.value = false;
        deferredPrompt.value = null;
        return true;
      }
      return false;
    }

    // Nếu là iOS Safari
    if (isIos.value) {
      showIosModal.value = true;
      return true;
    }

    // Fallback cho desktop/trình duyệt khác
    showIosModal.value = true;
    return false;
  };

  return {
    canInstall,
    isInstalled,
    isIos,
    showIosModal,
    promptInstall,
  };
}
