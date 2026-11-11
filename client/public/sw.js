const CACHE = "ptlog-shell-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));

// Gehashte Assets + Übungsfotos: Cache zuerst. Seite (index.html): Netz zuerst, aber nach 2,5 s
// (Server schläft noch) die zwischengespeicherte Version zeigen. /api wird nie angefasst.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/ex/")) {
    event.respondWith(caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(caches.open(CACHE).then(async (c) => {
      const network = fetch(req).then((res) => { if (res.ok) c.put("/", res.clone()); return res; });
      const cached = await c.match("/");
      if (!cached) return network;
      const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), 2500));
      return Promise.race([network.catch(() => cached), timeout]);
    }));
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "Coaching-Logbuch", body: "" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title || "Coaching-Logbuch", {
      body: data.body || "",
      badge: undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      if (list.length > 0) return list[0].focus();
      return self.clients.openWindow("/");
    })
  );
});
