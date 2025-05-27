# 📍 PinPointd  
**Dezvoltat de Dumitrescu Darius–Ioan**  

PinPointd este o aplicație socială interactivă bazată pe localizare, ce permite utilizatorilor să creeze și să descopere postări geografice în timp real, să comunice instantaneu și să își promoveze inițiativele local. Proiectul este construit cu un accent puternic pe performanță, scalabilitate și design modern.

---

## 🔧 Tehnologii și Arhitectură

- **Frontend**: React 18.2 + TypeScript 5.0.2
- **UI**: Material UI, TailwindCSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Realtime DB, Cloud Functions, Storage)
- **AI**: Asistent personalizat (Pheobe)
- **I18n**: i18next (4 limbi suportate)
- **Media**: Cloudinary, browser-image-compression
- **Maps**: Leaflet, Mapbox GL, @react-google-maps/api

---

## 🧠 Tehnici și Algoritmi

- **Debouncing, memoization, lazy loading** pentru optimizarea UI-ului
- **react-window** pentru liste mari
- **useReducer + Context API** pentru management de stare
- **Code splitting** și **tree shaking** pentru performanță
- **Compresie media la upload**

---

## 🗂 Structură Cod

- Modularizare per funcționalitate: `auth/`, `chat/`, `maps/`, `profile/`
- Componente izolate, respectând Atomic Design
- Lazy loading pentru componente mari
- Principii SOLID și SOA

---

## 📈 Scalabilitate

- Serverless prin Firebase Hosting & Functions
- Arhitectură ușor extensibilă pe verticală (noi funcții)
- Structuri de date normalizate și interogări indexate

---

## ✅ Funcționalități

- **📌 Postări geolocalizate**: Adaugă PinPoint-uri cu text, imagini, tag-uri și coordonate.
- **🔍 Filtrare avansată**: după distanță, dată, popularitate, tip etc.
- **💬 Chat live**: sincronziare în timp real cu Realtime Database, suport pentru text, voice-to-text și imagini.
- **🤖 AI Assistant (Pheobe)**: oferă suport contextual platformei.
- **🚀 Boost cu tokenuri**: Promovează postări local cu tokenuri virtuale (10€ per token).
- **🗺 Mod offline**: Cache local pentru postările recente.
- **🌐 Multilingv**: Română, Engleză, Franceză, Spaniolă.
- **🧩 Accesibilitate**: contrast, zoom, screen reader, suport tastatură.
- **📱 UX mobil**: Navigație touch-friendly și swipe gestures.

---

## 🔒 Securitate

- Inputuri sanitizate (XSS protected)
- Firebase Auth + JWT (CSRF protected)
- NoSQL - fără riscuri SQLi
- Rate limiting via Firebase Rules
- Validări: regex, TypeScript, Firebase side

---

## 🚀 Deploy Local (Localhost)

1. Instalează Node.js
2. Clonează repo-ul:
```bash
git clone https://github.com/DumitrescuDarius/Infoeducatie_PinPointd.git
cd PinPointd
npm install
npm run dev
