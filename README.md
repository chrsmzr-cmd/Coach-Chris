# Coaching-Logbuch — eigenständige Web-App

Frontend (React/Vite) + kleiner Node/Express-Server + Postgres-Datenbank.
Läuft komplett unabhängig von Claude — kein Claude-Konto für Coachees nötig.

## Struktur
```
client/   React-App (das eigentliche Tool)
server/   Express-Server, stellt /api/storage/:key bereit und liefert das gebaute Frontend aus
render.yaml  Blueprint für automatisches Setup bei Render
```

## Deployment bei Render (mit render.yaml, empfohlen)

1. Dieses Projekt in ein neues GitHub-Repository pushen.
2. Bei Render einloggen → **New** → **Blueprint** → das GitHub-Repo auswählen.
   Render liest `render.yaml` und legt automatisch an:
   - einen Web Service (`coaching-logbuch`)
   - eine Postgres-Datenbank (`coaching-logbuch-db`, kostenpflichtige Basic-Stufe, läuft dauerhaft)
   Die Datenbank-Verbindung (`DATABASE_URL`) wird automatisch verknüpft.
3. Deploy abwarten (paar Minuten beim ersten Mal).
4. Die fertige URL (`https://coaching-logbuch-xxxx.onrender.com`) ist der Link für Coach und Coachees — kein Login nötig.

## Alternative: manuelles Setup (ohne render.yaml)

1. Bei Render: **New** → **PostgreSQL** → Name vergeben, Plan „Basic" wählen (nicht „Free" — die läuft nach 30 Tagen ab).
2. **New** → **Web Service** → GitHub-Repo verbinden.
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment Variable `DATABASE_URL` → die „Internal Database URL" der Postgres-Instanz aus Schritt 1 eintragen.
3. Deploy.

## Lokal testen (optional, bevor ihr live geht)

```bash
# Terminal 1: Datenbank z. B. lokal über Docker oder eine Render-Testdatenbank
cd server
DATABASE_URL=postgres://... npm install
npm start

# Terminal 2
cd client
npm install
npm run dev
```
Die App läuft dann unter `http://localhost:5173`.

## Push-Benachrichtigungen (neu)

Damit Nachrichten als echte Handy-Benachrichtigung ankommen, braucht Render drei zusätzliche
Umgebungsvariablen beim Web Service (**Environment** → **Add Environment Variable**):

| Key | Wert |
|---|---|
| `VAPID_PUBLIC_KEY` | `BEkynt8jt0SC9806K3_UExyvweOckO5bk0NxxTf_G3oGS5l5JZ7v_Zb6DmA-OGPhF6TJkGh9ZNBj5YKgHln4z9I` |
| `VAPID_PRIVATE_KEY` | `BG61aMismsDMN0biCSSQ_7ab31i0ujZG4UBALCci9xI` |
| `VITE_VAPID_PUBLIC_KEY` | *(derselbe Wert wie `VAPID_PUBLIC_KEY`)* |

Wichtig: `VITE_VAPID_PUBLIC_KEY` muss **beim Build** verfügbar sein (Vite backt Umgebungsvariablen
zum Zeitpunkt des Builds ein) — bei Render reicht es, sie ganz normal als Environment Variable
einzutragen, sie wird automatisch auch beim Build-Schritt berücksichtigt. Nach dem Eintragen
einmal **Manual Deploy** anstoßen, damit sie greift.

**iOS-Besonderheit, unbedingt beachten:** Safari auf dem iPhone unterstützt Web-Push **nur für
Seiten, die über „Zum Home-Bildschirm hinzufügen" installiert wurden** (iOS 16.4 oder neuer).
Ein normaler Safari-Tab bekommt keine Push-Benachrichtigungen, egal was hier eingerichtet ist.
Coach und Coachee müssen also:
1. Den Link in Safari öffnen
2. Über „Teilen" → „Zum Home-Bildschirm" hinzufügen
3. Die App über das neue Icon öffnen (nicht mehr über Safari direkt)
4. Im Tab „Nachrichten" auf „🔔 Aktivieren" tippen und die Berechtigung erlauben

Android/Chrome funktioniert auch ohne Installation zum Home-Bildschirm.


Nur die Speicherung: Statt der artefakt-eigenen `window.storage`-Funktion nutzt die App jetzt
einen einfachen Schlüssel-Wert-Speicher über den eigenen Server (`/api/storage/:key`), der in
Postgres liegt. Geräte-lokale Einstellungen (z. B. welche Rolle/welcher Coachee auf diesem
Gerät zuletzt gewählt wurde) liegen weiterhin nur im Browser (`localStorage`), genau wie vorher
auf dem Gerät verankert. Der komplette Rest der App — alle Tabs, die gesamte Logik — ist unverändert.
