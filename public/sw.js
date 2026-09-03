/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 *
 * Offline support without a build-time manifest: the worker caches what the
 * game actually asks for. Navigations stay network-first so a fresh deploy is
 * always picked up online and the cache is only ever a fallback — never a way
 * to strand someone on an old build.
 */

const VERSION = "v1";
const CACHE = `bubble-game-${VERSION}`;
const FALLBACK = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(FALLBACK))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

const putCopy = async (request, response) => {
  if (!response || !response.ok) return response;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
  return response;
};

/** Hashed build output never changes under a given URL, so serve it from cache. */
const cacheFirst = async (request) => {
  const hit = await caches.match(request);
  if (hit) return hit;
  return putCopy(request, await fetch(request));
};

/** Assets that can change without a new URL: serve fast, refresh in the background. */
const staleWhileRevalidate = async (request) => {
  const hit = await caches.match(request);
  const fresh = fetch(request)
    .then((response) => putCopy(request, response))
    .catch(() => undefined);
  return hit ?? (await fresh) ?? Response.error();
};

const networkFirst = async (request) => {
  try {
    return await putCopy(request, await fetch(request));
  } catch {
    return (await caches.match(request)) ?? (await caches.match(FALLBACK)) ?? Response.error();
  }
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Leave fonts, analytics and anything else off-origin entirely alone.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (/\.(png|svg|mp3|webmanifest|ico)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
