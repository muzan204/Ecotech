/* eslint-disable no-undef */

const CACHE_NAME = "ecoTech-pwa-cache-v1";
const urlsToCache = ["/", "/index.html", "/app.js", "/manifest.json", "/images/notification-icon.png", "/images/notification-badge.png"];

// ----------------------
// Cache install/activate
// ----------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Arquivos em cache");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (response) return response;
        return new Response("Recurso não disponível e falha de rede", { status: 503 });
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// ----------------------
// Push handling
// ----------------------
self.addEventListener("push", (event) => {
  let data = { title: "Notificação", body: "Nova notificação!" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Push recebido mas não é JSON:", e);
      // fallback: tenta tratar como texto
      data = {
        title: "Notificação",
        body: event.data.text()
      };
    }
  }

  console.log("Push recebido:", data);

  const options = {
    body: data.body,
    icon: "/images/notification-icon.png",
    badge: "/images/notification-badge.png",
    actions: [
      { action: "open", title: "Abrir App" },
      { action: "close", title: "Fechar Notificação" }
    ],
    // ajuda browsers a mostrarem corretamente
    data: {
      url: data.url || "/index.html"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Notificação", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      // Se a ação for "close", não faz nada além de fechar.
      if (event.action === "close") return;

      // Abre a janela da PWA
      const url = event.notification?.data?.url || "/index.html";
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

      for (const client of allClients) {
        if (client.url === url && "focus" in client) {
          client.focus();
          return;
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })()
  );
});

