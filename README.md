# HabitIQ

**Track smarter, live better.**

A cross-platform habit-tracking app built with Expo / React Native (Android-first,
iOS-compatible) and a FastAPI backend. Fully usable offline with no login wall;
data persists locally in SQLite and the backend mirrors the schema for optional
future sync.

## Features

- **Today** – your active habits as cards with a spring-animated tap-to-complete
  circle, streak badges, haptic feedback, and a quick-add FAB.
- **Stats** – GitHub-style per-month contribution grid for each habit, plus
  per-week / per-month bar charts and animated summary tiles (current streak,
  longest streak, total completions, completion rate).
- **Habits** – manage custom habits: name, icon, color, frequency
  (daily / specific weekdays / X-times-per-week), optional reminder.
  Drag to reorder, swipe to archive or delete.
- **Settings** – light/dark/system theme, notification permission, JSON & CSV
  export, anonymous device backup code, about.
- Skippable onboarding carousel on first launch.

## Tech stack

- Expo SDK 54 + expo-router (file-based navigation)
- react-native-reanimated v3 (all animations, UI-thread worklets)
- react-native-gesture-handler + react-native-draggable-flatlist
- react-native-svg (custom heatmap & charts — no heavy chart libs)
- zustand (state) + expo-sqlite (offline persistence)
- expo-haptics, expo-notifications (local reminders), Inter via @expo-google-fonts
- Backend: FastAPI + SQLAlchemy 2.0 + Alembic (see [backend/README.md](backend/README.md))

## Run the app

```bash
npm install
npx expo start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

## Project structure

```
app/                 # expo-router screens
  _layout.tsx        # theme provider, fonts, onboarding redirect
  (tabs)/            # Today, Stats, Habits, Settings
  habit/[id].tsx     # full-year habit detail
  onboarding.tsx
components/           # HabitCard, CompleteButton, YearGrid, BarChart, sheets, ...
db/                   # expo-sqlite schema + queries
store/                # zustand habit store
lib/                  # theme, dates, stats, notifications, export, types
constants/            # palette, icons
backend/              # FastAPI + SQLAlchemy API
```

## Design

Unified cobalt-on-white palette (accent `#2F5DFF`), bold Inter headlines, soft
rounded cards with subtle shadows, a 5-step blue heatmap intensity scale, and an
optional pastel mood-tag palette. Full light and dark themes.

## Backend

See [backend/README.md](backend/README.md). The app is offline-first; the backend
is optional and intended for a future background-sync layer using anonymous,
device-based identity (`X-Device-Id` header — no signup/login).
