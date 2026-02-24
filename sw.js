const CACHE_NAME = "ml-refeicoes-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Não cachear API do Supabase (ou outras APIs)
function isApiRequest(url) {
  return url.includes("supabase.co") || url.includes("/rest/v1/") || url.includes("/auth/v1/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = req.url;

  // deixa APIs sempre na rede
  if (isApiRequest(url)) return;

  // HTML: network-first (pra atualizar mais fácil)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Assets: cache-first
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});