const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const { Pool } = require("pg");
const webpush = require("web-push");

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "8mb" })); // großzügig, wegen evtl. Bild-Uploads als Data-URL

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:kontakt@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS storage (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Mehrere Schlüssel in EINER Anfrage (spart beim Start viele Roundtrips)
app.post("/api/storage-batch", async (req, res) => {
  try {
    const keys = Array.isArray(req.body && req.body.keys) ? req.body.keys.filter((k) => typeof k === "string").slice(0, 60) : [];
    if (keys.length === 0) return res.json({ values: {} });
    const r = await pool.query("SELECT key, value FROM storage WHERE key = ANY($1::text[])", [keys]);
    const values = {};
    keys.forEach((k) => { values[k] = null; });
    r.rows.forEach((row) => { values[row.key] = row.value; });
    res.json({ values });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "read_failed" });
  }
});

app.get("/api/storage/:key", async (req, res) => {
  try {
    const r = await pool.query("SELECT value FROM storage WHERE key = $1", [req.params.key]);
    res.json({ value: r.rows[0] ? r.rows[0].value : null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "read_failed" });
  }
});

app.put("/api/storage/:key", async (req, res) => {
  try {
    const value = req.body && typeof req.body.value === "string" ? req.body.value : null;
    await pool.query(
      `INSERT INTO storage (key, value, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [req.params.key, value]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "write_failed" });
  }
});

app.delete("/api/storage/:key", async (req, res) => {
  try {
    await pool.query("DELETE FROM storage WHERE key = $1", [req.params.key]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "delete_failed" });
  }
});

app.post("/api/push/notify", async (req, res) => {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return res.json({ ok: false, reason: "vapid_not_configured" });
    }
    const { targetKey, title, body } = req.body || {};
    if (!targetKey) return res.status(400).json({ ok: false, reason: "missing_target" });
    const r = await pool.query("SELECT value FROM storage WHERE key = $1", [targetKey]);
    if (!r.rows[0] || !r.rows[0].value) return res.json({ ok: false, reason: "no_subscription" });
    const sub = JSON.parse(r.rows[0].value);
    await webpush.sendNotification(sub, JSON.stringify({ title: title || "Coaching-Logbuch", body: body || "" }));
    res.json({ ok: true });
  } catch (e) {
    console.error("Push fehlgeschlagen:", e.message);
    res.json({ ok: false, reason: "send_failed" });
  }
});

// Gebautes Frontend mit ausliefern (ein einziger Render-Service für alles)
const clientDist = path.join(__dirname, "..", "client", "dist");
// Übungsfotos: zuerst im gebauten Frontend (client/public/ex), sonst direkt im Repo-Hauptverzeichnis
// (falls die Fotoordner dort hochgeladen wurden). Nur Ordner-/Dateinamen aus erlaubten Zeichen.
const repoRoot = path.join(__dirname, "..");
app.get("/ex/:id/:file", (req, res) => {
  const { id, file } = req.params;
  if (!/^[A-Za-z0-9_\-.]+$/.test(id) || id.startsWith(".") || !/^[01]\.webp$/.test(file)) return res.status(404).end();
  const candidates = [path.join(clientDist, "ex", id, file), path.join(repoRoot, id, file)];
  const hit = candidates.find((f) => fs.existsSync(f));
  if (!hit) return res.status(404).end();
  res.setHeader("Cache-Control", "public, max-age=2592000");
  res.sendFile(hit);
});

// Gehashte Assets (JS/CSS) und Übungsfotos dürfen lange gecacht werden, index.html nie.
app.use(express.static(clientDist, {
  setHeaders(res, filePath) {
    if (/[\\/]assets[\\/]/.test(filePath)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    else if (/[\\/]ex[\\/]/.test(filePath)) res.setHeader("Cache-Control", "public, max-age=2592000");
    else if (/index\.html$|sw\.js$/.test(filePath)) res.setHeader("Cache-Control", "no-cache");
  },
}));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "not_found" });
  // Fehlende Dateien (Fotos, Assets) sollen 404 liefern statt der Startseite
  if (/^\/(ex|assets)\//.test(req.path) || /\.(webp|png|jpe?g|js|css|map)$/.test(req.path)) return res.status(404).end();
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = process.env.PORT || 3001;
// Sofort lauschen (schnellerer Kaltstart); das Schema wird parallel angelegt.
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
ensureSchema().catch((e) => {
  console.error("Schema-Initialisierung fehlgeschlagen:", e);
  process.exit(1);
});
