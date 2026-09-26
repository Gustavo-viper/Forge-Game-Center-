# Forge Game Center — versão corrigida

## Download
A seção de downloads agora aponta diretamente para:
- `downloads/Forge-Game-Center-Android.apk`
- `downloads/Forge-Game-Center-Windows.exe`

Não há mais links para ZIP na seção pública.

## Estrutura corrigida
- Web: `index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js`
- Android: `apps/android/app/src/main/...`
- Windows: Electron em `apps/windows`
- Palavras Ocultas: `games/palavras-ocultas/`

## GitHub Actions
Os workflows continuam gerando APK e instalador EXE como artifacts.

## Observação
Os arquivos presentes em `downloads/` são os instaladores que os botões públicos usam. Para substituir por builds novos, copie o APK/EXE gerado pelo Actions para essa pasta e faça commit.
