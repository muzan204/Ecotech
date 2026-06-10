import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

// ----------------------
// Firebase Config
// ----------------------
// Substitua pelos valores do seu Firebase (Config do app + sender id + project id)
const firebaseConfig = {
  apiKey: "AIzaSyATRqpLXbrDnHk83PIMjZP0WcEwEdYggYM",
  authDomain: "ecotech-eadd8.firebaseapp.com",
  projectId: "ecotech-eadd8",
  storageBucket: "ecotech-eadd8.firebasestorage.app",
  messagingSenderId: "770250054222",
  appId: "1:770250054222:web:f5cfff5e8bab6fbbd0011f",
  measurementId: "G-ZHRB3F1514"
};

// Chave pública VAPID do Firebase para Web Push
const VAPID_PUBLIC_KEY = "BAap1XNYIrmi0pMKecPZTQRAzVaA4ICy0aVI37MAk4qFDL0Eepb3_VfSgvEK-b645q2R3DHFLBp-mZ61fIq8uFY";

// ----------------------
// Service Worker register
// ----------------------
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker indisponível");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/service-worker.js");
    console.log("Service Worker registrado com sucesso:", registration);
    return registration;
  } catch (err) {
    console.error("Falha no registro do Service Worker:", err);
    throw err;
  }
}

// ----------------------
// Notification permission + token
// ----------------------
function setStatus(message) {
  const el = document.getElementById("status");
  if (el) el.textContent = message;
}

async function askNotificationPermissionAndSubscribe() {
  if (!navigator.onLine) {
    setStatus("Você está offline. Notificações não serão recebidas até a rede voltar.");
    console.log("offline: notificações não serão recebidas");
    return;
  }

  if (!("Notification" in window)) {
    console.warn("Notificações não suportadas");
    setStatus("Notificações não suportadas neste navegador.");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    setStatus("Permissão negada para notificações.");
    console.log("Permissão negada");
    return;
  }

  setStatus("Permissão concedida. Gerando token...");
  console.log("Permissão concedida");

  // Necessário para FCM em background/foreground
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      // Service worker obrigatório no modo modular (alguns browsers)
      // eslint-disable-next-line no-undef
      serviceWorkerRegistration: await navigator.serviceWorker.getRegistration()
    });

    if (token) {
      console.log("Token de Push gerado:", token);
      setStatus(`Token de Push gerado. (Token salvo/local)

${token.slice(0, 60)}...`);
      // Aqui você enviaria o token para seu back-end para poder mandar notificações.
      // Ex: fetch('/api/save-token', {method:'POST', body: JSON.stringify({token})})
    } else {
      setStatus("Nenhum token disponível. Solicite permissão para notificações.");
    }
  } catch (err) {
    console.error("Erro ao gerar token:", err);
    setStatus("Erro ao gerar token de push. Verifique a configuração VAPID/Firebase.");
  }
}

// ----------------------
// Foreground messages
// ----------------------
function setupForegroundListener() {
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  onMessage(messaging, (payload) => {
    console.log("Mensagem recebida enquanto o app está em primeiro plano:", payload);

    const title = payload?.notification?.title || "Notificação";
    const body = payload?.notification?.body || "Você recebeu uma mensagem.";

    // Mostra uma notificação no foreground
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/images/notification-icon.png"
      });
    }
  });
}

// ----------------------
// UI wiring
// ----------------------
window.addEventListener("load", async () => {
  await registerServiceWorker();

  setupForegroundListener();

  const btn = document.getElementById("btnAskPermission");
  if (btn) {
    btn.addEventListener("click", () => {
      askNotificationPermissionAndSubscribe();
    });
  }

  setStatus(
    "Clique em 'Ativar Notificações Push'. Configure firebaseConfig e VAPID_PUBLIC_KEY no app.js."
  );
});

