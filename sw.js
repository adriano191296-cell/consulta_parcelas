const CACHE_NAME = 'consulta-parcelas-v7';

const ARQUIVOS_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './dados.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
];

self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_CACHE))
    );

    self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((chaves) =>
            Promise.all(
                chaves
                    .filter((chave) => chave !== CACHE_NAME)
                    .map((chave) => caches.delete(chave))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        caches.match(evento.request).then((resposta) =>
            resposta || fetch(evento.request)
        )
    );
});
