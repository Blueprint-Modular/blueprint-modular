// Service worker minimal pour PWA (app.blueprint-modular.com)
// Permet l'installation "Ajouter à l'écran d'accueil"
const CACHE_NAME = "bpm-app-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through : pas de cache, la requête part au réseau
  event.respondWith(fetch(event.request));
});
