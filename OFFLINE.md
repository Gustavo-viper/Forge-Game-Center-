# Forge Game Center — Offline First v11

- The public web version uses a service worker and local cache after the first online visit.
- The Android app bundles the complete Central inside the APK, so the Central UI does not depend on internet access to start.
- Supabase is used only for synchronization of games/status/news/announcements when online.
- Cached/local data is shown immediately when offline.
- Game buttons still open the games in the external browser and therefore require internet to play.
