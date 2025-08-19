/**
 * Service Worker for 懶得變有錢 Blog
 * 提供積極的快取策略和離線支援
 */

const CACHE_NAME = "lazytoberich-v1.0.0";
const RUNTIME_CACHE = "lazytoberich-runtime-v1.0.0";

// 需要預快取的核心資源
const PRECACHE_RESOURCES = [
  "/",
  "/about/",
  "/contact/",
  "/blog/",
  "/offline/",
  "/assets/scss/main.css",
  "/js/search.js",
  "/plugins/cookie.js",
  "/images/logo.png",
  "/images/favicon.png",
];

// 快取策略設定
const CACHE_STRATEGIES = {
  // 靜態資源 - Cache First
  staticAssets: {
    pattern: /\.(css|js|png|jpg|jpeg|webp|svg|woff|woff2|ttf|eot)$/,
    strategy: "CacheFirst",
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  // HTML 頁面 - Network First with fallback
  pages: {
    pattern: /^https:\/\/marskingx\.github\.io\//,
    strategy: "NetworkFirst",
    maxAge: 24 * 60 * 60, // 1天
  },
  // 外部 API - Network Only
  external: {
    pattern: /^https:\/\/(www\.google|fonts\.|cdn\.)/,
    strategy: "NetworkOnly",
  },
};

// Service Worker 安裝
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Pre-caching core resources");
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting()),
  );
});

// Service Worker 啟動
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker");
  event.waitUntil(
    Promise.all([
      // 清理舊快取
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE,
            )
            .map((cacheName) => caches.delete(cacheName)),
        );
      }),
      // 立即控制所有頁面
      self.clients.claim(),
    ]),
  );
});

// 處理 fetch 請求
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只處理 GET 請求
  if (request.method !== "GET") return;

  // 確定快取策略
  let strategy = "NetworkFirst"; // 預設策略

  if (CACHE_STRATEGIES.staticAssets.pattern.test(url.pathname)) {
    strategy = CACHE_STRATEGIES.staticAssets.strategy;
  } else if (CACHE_STRATEGIES.external.pattern.test(url.origin)) {
    strategy = CACHE_STRATEGIES.external.strategy;
  } else if (url.origin === location.origin) {
    strategy = CACHE_STRATEGIES.pages.strategy;
  }

  event.respondWith(handleRequest(request, strategy));
});

// 處理請求的核心邏輯
async function handleRequest(request, strategy) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  switch (strategy) {
    case "CacheFirst":
      return cachedResponse || fetchAndCache(request, cache);

    case "NetworkFirst":
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.log("[SW] Network failed, trying cache:", request.url);
        return cachedResponse || createOfflineResponse(request);
      }

    case "NetworkOnly":
      return fetch(request);

    default:
      return fetchAndCache(request, cache);
  }
}

// 取得並快取資源
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("[SW] Fetch failed:", request.url);
    const cachedResponse = await cache.match(request);
    return cachedResponse || createOfflineResponse(request);
  }
}

// 建立離線回應
function createOfflineResponse(request) {
  const url = new URL(request.url);

  // HTML 頁面返回離線頁面
  if (request.headers.get("Accept").includes("text/html")) {
    return (
      caches.match("/offline/") ||
      new Response("<h1>離線模式</h1><p>請檢查網路連線</p>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    );
  }

  // 圖片返回佔位圖
  if (request.headers.get("Accept").includes("image")) {
    return new Response("", { status: 204 });
  }

  // 其他資源返回 404
  return new Response("", { status: 404 });
}

// 處理來自主線程的訊息
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "GET_VERSION":
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;

    case "CLEAN_OLD_CACHES":
      cleanOldCaches();
      break;

    case "PREFETCH_CLEANUP":
      // 清理預取資源
      console.log("[SW] Cleaning up prefetch resources");
      break;
  }
});

// 清理舊快取
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(
    (name) =>
      name.startsWith("lazytoberich-") &&
      name !== CACHE_NAME &&
      name !== RUNTIME_CACHE,
  );

  await Promise.all(oldCaches.map((cacheName) => caches.delete(cacheName)));
  console.log("[SW] Cleaned old caches:", oldCaches);
}

// 背景同步（如果支援）
if ("sync" in self.registration) {
  self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
      event.waitUntil(backgroundSync());
    }
  });
}

async function backgroundSync() {
  console.log("[SW] Background sync triggered");
  // 在背景更新關鍵資源
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(["/"]);
  } catch (error) {
    console.log("[SW] Background sync failed:", error);
  }
}
