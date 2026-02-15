# Betak - Cross-Platform Short Video Solution 

> The ultimate short-video platform for **Android**, **iOS**, and **Web Dashboard**.

![Android](https://img.shields.io/badge/Android-Kotlin-green.svg?logo=android)
![iOS](https://img.shields.io/badge/iOS-Swift-blue.svg?logo=apple)
![Web](https://img.shields.io/badge/Dashboard-React%20%2B%20Node.js-yellow.svg?logo=react)

---

## 📂 Project Structure

This repository is a **Monorepo** containing the complete ecosystem for the Betak platform:

```bash
betak.live/
├── betak_android_app/       # Native Android Application (Kotlin + Compose)
├── betak_ios_app/           # Native iOS Application (Swift + SwiftUI)
├── betak_backend_dashord/   # Admin Dashboard & Backend (Node.js + React)
└── DB/                     # Database Backups & Scripts [NEW]
```

---

## 📱 Android Application
**Native Android experience built with modern Jetpack Compose.**

### 🛠 Tech Stack
- **Language:** Kotlin
- **UI:** Jetpack Compose (Material3)
- **Video:** Media3 ExoPlayer (Optimized)
- **Architecture:** MVVM + Clean Architecture

---

## 🍎 iOS Application
**Premium iOS experience tailored for iPhone.**

### 🛠 Tech Stack
- **Language:** Swift 5.x
- **UI:** SwiftUI
- **Minimum Target:** iOS 16.0+

---

## 💻 Admin Dashboard & Backend
**Control panel to manage content, users, and analytics.**

### 🛠 Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js (Express)
- **Database:** PostgreSQL / MongoDB

---

## 🚀 Quick Start (Admin Dashboard)

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment:**
Copy `.env.example` to `.env` and update with your database credentials.

3. **Database Setup:**
- Create database `betak`.
- Import backup from `DB/BeTak_DB.sql` or run migrations: `npm run migrate`.

4. **Start development server:**
```bash
npm run dev
```

---

## 📄 License

ISC © Be-Tak Team
