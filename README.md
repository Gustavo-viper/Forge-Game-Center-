# Forge Game Center

Portal da Forge Studios com catálogo de jogos, Forge Labs e controle administrativo.

## Arquivos principais
- `index.html` — site público
- `style.css` — visual e responsividade
- `app.js` — navegação, status, manutenção e Forge Labs
- `admin.html` — painel administrativo
- `admin.js` — controles dos jogos e manutenção
- `SUPABASE-SETUP.md` — arquitetura para sincronização entre dispositivos
- `assets/` — logos e imagens dos jogos

## Fluxo de status
No painel administrativo, cada jogo pode ser marcado como:
- Pronto
- Atualizando
- Em breve
- Indisponível

O site público altera automaticamente os cards e, quando necessário, abre uma tela de status em vez de encaminhar o jogador.

## Manutenção
Ative `Modo manutenção` no painel para exibir uma tela cheia no site público com título, mensagem e previsão de retorno.

## Observação importante
A versão sem backend usa `localStorage`. Isso é suficiente para testes locais, mas não sincroniza alterações entre dispositivos. Para produção, conecte o painel ao Supabase com Auth + RLS conforme `SUPABASE-SETUP.md`.
