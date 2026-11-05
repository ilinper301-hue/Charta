// Charta · service worker (paso 4.5). PLANTILLA: build.py la copia a la raíz (/Charta/sw.js, scope /Charta/)
// poniendo d86ac496fd39 = huella de la app; si la app cambia, cambia este archivo y el navegador lo actualiza.
// Mismo origen que Lectori, Tabula, Fori…: solo se tocan las cachés que empiezan por "charta-".
const VERSION = "d86ac496fd39";
const CACHE = "charta-" + VERSION;
const ARCHIVOS = ["./", "./index.html", "./dist/", "./dist/index.html", "./manifest.webmanifest",
  "./iconos/icono-192.png", "./iconos/icono-512.png", "./iconos/maskable-192.png", "./iconos/maskable-512.png",
  "./iconos/favicon.png", "./iconos/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  // cache: "reload" → no coger la copia vieja de la caché HTTP de GitHub Pages.
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith("charta-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || !r.url.startsWith(self.registration.scope)) return;
  // Primero la caché (sin conexión e instantáneo); ?ficha=… y otros parámetros no cambian el archivo.
  e.respondWith(caches.open(CACHE).then((c) => c.match(r, { ignoreSearch: true }).then((hit) => hit ||
    fetch(r).then((resp) => { if (resp.ok && resp.type === "basic") c.put(r, resp.clone()); return resp; })
      .catch(() => r.mode === "navigate" ? c.match("./dist/index.html") : Response.error()))));
});
