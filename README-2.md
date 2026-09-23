# Forge Game Center — Control Center v8

Atualização da Central Forge com:

- Painel ADM completo (Dashboard, Jogos, Forge Labs, Notícias, Roadmap, Imagens, Jogadores, Estatísticas, Avisos, Manutenção, Logs, Control Center, Downloads e Configurações).
- Hangman Pro apontando para `https://hagman-pro-forge.onrender.com`.
- PWA com `manifest.json` e Service Worker.
- Modo offline para a interface pública e cache da última sincronização.
- Painel ADM preparado para abrir a interface offline; alterações administrativas continuam dependendo de conexão para sincronizar com o Supabase.
- Área de downloads da Central para Android e Windows.
- iOS marcado como “Em breve”.
- Os jogos não são empacotados dentro da Central: continuam abrindo no navegador.

## Downloads

`downloads/Forge-Game-Center-Android.zip` e `downloads/Forge-Game-Center-Windows.zip` são pacotes PWA/offline da Central, não APK/EXE nativos.

Para Android e Windows, a instalação como aplicativo é feita pelo Chrome/Edge após disponibilizar a Central via HTTPS.


## v10 — Online + Offline
- A Central caches the last synchronized games, maintenance, news and announcements.
- Public news and announcements are read from Supabase when online and shown from local cache when offline.
- ADM queues news/announcement changes while offline and syncs them when connectivity returns.
- Android app loads the Central from local packaged assets; games remain external browser links.
- Windows app loads the Central locally; games remain external browser links.
- Hangman Pro URL: https://hagman-pro-forge.onrender.com

## v12 — Palavras Ocultas dentro da Central
- Palavras Ocultas agora é carregado localmente em `games/palavras-ocultas/`.
- O jogo abre em uma janela interna da Central, sem navegar para outro site.
- Os arquivos essenciais do jogo entram no cache da Central para uso offline.
- O mesmo conteúdo foi incluído nos assets locais do Android e nos pacotes Android/Windows.
