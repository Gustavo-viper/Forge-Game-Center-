# Forge Game Center — Standalone

A Central passa a ser um aplicativo local:

- Android: APK instalável com a Central empacotada.
- Windows: instalador EXE via Electron.
- A Central não precisa do Render para abrir.
- Os jogos que possuem servidor próprio continuam podendo usar Internet.
- iOS continua como “Em breve”.

## Android

A estrutura correta é `apps/android/app/src/main/`.

O workflow copia `index-2.html`, `style-2.css`, `app-2.js`, `sw-2.js`, `manifest-2.json`, `assets/` e `games/` para dentro do APK.

## Windows

O Electron abre `apps/windows/web/index.html`, uma cópia local da Central.

## Downloads oficiais

Quando uma tag `v*` for criada, o workflow publica:

- `Forge-Game-Center.apk`
- `Forge-Game-Center-Setup-1.0.0.exe`

O APK é debug-signed para instalação sem configurar um keystore privado. Para Play Store, use um keystore de release próprio.
