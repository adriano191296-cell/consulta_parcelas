const CACHE_NAME = 'consulta-parcelas-v24';

const ARQUIVOS_CACHE = [
    './',
    './index.html',
    './style.css',
    './style-extra.css',
    './script.js',
    './dados.js',
    './manifest.json',
    './icons/ACM10.jpeg',
    './icons/ac.jpeg',
    './icons/adr.jpeg',
    './icons/logo_ofc.jpeg',
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
    if (evento.request.method !== 'GET') {
        return;
    }

    evento.respondWith(
        caches.match(evento.request).then((resposta) => {
            if (resposta) {
                return resposta;
            }

            return fetch(evento.request)
                .then((respostaRede) => {
                    const copia = respostaRede.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(evento.request, copia);
                    });
                    return respostaRede;
                })
                .catch(() => {
                    if (evento.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return caches.match(evento.request);
                });
        })
    );
});
