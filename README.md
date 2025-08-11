# Tachado - Todo App

A mobile-first todo app with real-time sharing, smooth drag-and-drop, and app-like mobile UX.

Live: https://tachado.netlify.app

## ✨ Features

- Real-time sync (Firebase Realtime Database)
- Session sharing with memorable URLs (e.g., `bravo-zorro-123`)
- Drag & drop reordering (SortableJS)
- Swipe to delete completed items (with haptics)
- Offline-first with localStorage fallback
- PWA: installable, works offline, service worker + manifest
- Modern, glass-morphism UI with smooth animations

## 🚀 Quick start

Prereqs: Node 18+, npm

```bash
git clone https://github.com/grojasv/tachado.git
cd tachado
npm install
cp env.example .env          # add your Firebase values
npm run dev                  # http://localhost:4321
```

## 🔐 Environment variables

Create `.env` from `env.example` and fill in Firebase config (PUBLIC_ keys are exposed to client):

```
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_DATABASE_URL=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

Note: After changing `.env`, restart the dev server so Astro picks up new values.

## 🧭 Scripts

| Command           | Action                                           |
|-------------------|--------------------------------------------------|
| npm install       | Install dependencies                             |
| npm run dev       | Start dev server (http://localhost:4321)         |
| npm run build     | Build to `dist/`                                 |
| npm run preview   | Preview the production build                     |

## ☁️ Deploy (Netlify)

1) Connect repo on Netlify (New site from Git → select `tachado`).
2) Build command: `npm run build`  ·  Publish directory: `dist`
3) Environment variables: add all `PUBLIC_FIREBASE_*` from `.env`
4) Deploy. Netlify will auto-deploy on push to `main`.

## 📱 PWA & Mobile UX

- Install from browser (Add to Home Screen)
- Safe-area padding for iOS
- Native-like gestures and subtle haptics

## 📄 Project plan

See `PROJECT_PLAN.md` for phases, status, and next tasks.

## ✅ Status

- Phases 1–7: Completed
- Phase 8: In Progress (mobile app-like polish)
