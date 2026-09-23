# Supabase — Forge Game Center

Projeto: `pveivfqmeuswycgmpnue`

## O que já foi configurado
- `forge_game_status`: status dos quatro jogos.
- `forge_site_settings`: manutenção global do Game Center.
- `forge_admin_users`: usuários autorizados a alterar o painel.
- RLS habilitado. Leitura pública; escrita somente para administradores autenticados.
- Realtime habilitado para status dos jogos e manutenção.

## Primeiro acesso ao painel
1. Abra `admin.html`.
2. Clique em **Criar conta** e use seu e-mail/senha.
3. Confirme o e-mail se o projeto exigir confirmação.
4. Entre novamente.
5. Se aparecer **Ativar primeiro administrador**, clique uma vez.

A partir daí, somente usuários registrados em `forge_admin_users` poderão alterar os estados.

## Comportamento
- O Game Center público lê o Supabase.
- Alterações de status são transmitidas por Realtime e também há uma atualização periódica de segurança.
- O modo manutenção é global e bloqueia a interface pública com uma tela cheia.
- O portal não possui login para jogadores; somente o painel administrativo possui autenticação.
