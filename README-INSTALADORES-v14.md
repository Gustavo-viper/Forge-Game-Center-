# Forge Game Center v14 — instaladores corrigidos

Os arquivos `.apk` e `.exe` vazios foram removidos. Eles eram placeholders de 2 bytes e nunca poderiam instalar.

Agora o projeto contém os projetos nativos corretos e os workflows do GitHub Actions geram os instaladores reais.

## Windows
`.github/workflows/windows.yml` gera `Forge-Game-Center-Setup-1.0.0.exe` e publica no release `latest`.

## Android
`.github/workflows/android.yml` gera `Forge-Game-Center.apk` e publica no release `latest`.

## Downloads do site
Os botões apontam para os assets do release `latest`, não para ZIPs.

Importante: o primeiro build precisa terminar com sucesso no GitHub Actions para os assets aparecerem na Release.
