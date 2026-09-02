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

## Was sich gegenüber der Claude-Artefakt-Version geändert hat

Nur die Speicherung: Statt der artefakt-eigenen `window.storage`-Funktion nutzt die App jetzt
einen einfachen Schlüssel-Wert-Speicher über den eigenen Server (`/api/storage/:key`), der in
Postgres liegt. Geräte-lokale Einstellungen (z. B. welche Rolle/welcher Coachee auf diesem
Gerät zuletzt gewählt wurde) liegen weiterhin nur im Browser (`localStorage`), genau wie vorher
auf dem Gerät verankert. Der komplette Rest der App — alle Tabs, die gesamte Logik — ist unverändert.
