// ☁️ Paso 3: Creación del Service Worker (sw.js) para Capacidad Offline

// 3.1. ⚙️ Variables de Configuración Inicial
// Service Worker para PWA
const CACHE_NAME = 'camara-pwa-v1'; // Nombre/versión del caché
const BASE_URL = "/pwa-camara/";
const urlsToCache = [ // Lista de archivos a guardar en caché
    BASE_URL + '/',
    BASE_URL + 'index.html',
    BASE_URL + 'app.js',
    BASE_URL + 'manifest.json',
    BASE_URL + 'icon-192.png',
    BASE_URL + 'icon-512.png',
];

// 3.2. 📥 Evento install: Almacenamiento Inicial
// Instalar Service Worker
self.addEventListener('install', function(event) {
    // 1. Usar event.waitUntil para asegurar que la instalación no termine hasta que el caché esté listo
    event.waitUntil(
        // 2. Abrir el caché con el nombre definido
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache abierto');
                // 3. Agregar todos los archivos de urlsToCache al almacenamiento
                return cache.addAll(urlsToCache);
            })
    );
});

// 3.3. 🌐 Evento fetch: Estrategia Cache First
// Interceptar peticiones
self.addEventListener('fetch', function(event) {
    // Usar event.respondWith para controlar la respuesta
    event.respondWith(
        // 1. Intentar encontrar la solicitud en el caché
        caches.match(event.request)
            .then(function(response) {
                // 2. Si se encuentra una respuesta en caché (es decir, el archivo existe)
                if (response) {
                    return response; // Devolver la versión en caché
                }
                // 3. Si no está en caché, ir a la red
                return fetch(event.request);
            })
    );
});

// 3.4. ♻️ Evento activate: Limpieza de Cachés Antiguos
// Activar Service Worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        // 1. Obtener todos los nombres de caché existentes
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                // 2. Mapear y filtrar los cachés que no coinciden con el nombre actual (CACHE_NAME)
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        // 3. Eliminar los cachés obsoletos
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});