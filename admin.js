/* Forge Game Center — ADM robusto / Supabase */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://pveivfqmeuswycgmpnue.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Qpuk0Q-UsRKUP0jNgkzvAA_MymEGzQ8';
  const SUPABASE_CDNS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
    'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js'
  ];

  const defaultGames = {
    cyber: {name:'Cyber Detective',image:'assets/cyber-detective.png',status:'available',url:'https://jogos-forge.onrender.com'},
    pet: {name:'Forge Pet',image:'assets/forge-pet.png',status:'updating',url:'#'},
    hangman: {name:'Hangman Pro',image:'assets/hangman-pro.png',status:'updating',url:'#'},
    words: {name:'Palavras Ocultas',image:'assets/palavras-ocultas.png',status:'updating',url:'#'}
  };
  const labels = {
    available:['PRONTO','O jogo está disponível para jogar.'],
    updating:['ATUALIZANDO','O jogo está recebendo atualizações e estará disponível em breve.'],
    soon:['EM BREVE','O jogo está sendo preparado pela Forge Studios.'],
    offline:['INDISPONÍVEL','O jogo está temporariamente indisponível.']
  };

  let supabaseClient = null;
  let games = clone(defaultGames);
  let maintenance = {enabled:false,title:'Estamos em manutenção',message:'Estamos realizando algumas melhorias no Forge Game Center. Voltaremos logo.',returnAt:'',button:'Aguardar retorno'};
  let channel = null;
  let booting = true;

  const $ = (s) => document.querySelector(s);
  const runtime = (msg, error=false) => {
    const el = $('#adminRuntimeMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = 'admin-feedback runtime-message' + (error ? ' error' : '');
  };
  const setAuthMessage = (msg,error=false) => {
    const el = $('#adminAuthMessage');
    if (!el) return;
    el.textContent = msg;
    el.className = 'admin-feedback' + (error ? ' error' : '');
  };
  const setSync = (msg) => { const el=$('#syncStatus'); if(el) el.textContent=msg; };
  const setControlsVisible = (v) => { $('#adminControls').hidden=!v; $('#adminLogin').hidden=v; };
  function clone(o){ return JSON.parse(JSON.stringify(o)); }

  function friendlyAuthError(error) {
    const m = String(error?.message || '').toLowerCase();
    if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (m.includes('user already registered')) return 'Este e-mail já possui uma conta. Use “Entrar”.';
    if (m.includes('email not confirmed')) return 'O e-mail ainda não foi confirmado. Confirme-o e tente novamente.';
    if (m.includes('password')) return 'A senha não atende aos requisitos configurados no Supabase.';
    if (m.includes('rate limit')) return 'Limite temporário de tentativas de e-mail atingido. Aguarde alguns minutos.';
    if (m.includes('captcha')) return 'O Supabase está exigindo CAPTCHA para esta tentativa de cadastro.';
    return error?.message || 'Erro de autenticação.';
  }

  function loadScript(src) {
    return new Promise((resolve,reject) => {
      const s=document.createElement('script');
      s.src=src;
      s.async=true;
      s.onload=()=>resolve();
      s.onerror=()=>reject(new Error('Não foi possível carregar '+src));
      document.head.appendChild(s);
    });
  }

  async function ensureSupabase() {
    if (window.supabase?.createClient) return window.supabase;
    let lastError;
    for (const cdn of SUPABASE_CDNS) {
      try {
        runtime('Carregando conexão segura com o Supabase…');
        await loadScript(cdn);
        if (window.supabase?.createClient) return window.supabase;
      } catch (e) { lastError=e; }
    }
    throw lastError || new Error('Biblioteca Supabase não carregou.');
  }

  async function boot() {
    try {
      runtime('Conectando ao Supabase…');
      const lib = await ensureSupabase();
      supabaseClient = lib.createClient(SUPABASE_URL,SUPABASE_KEY,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
      });
      setSync('● Conectado');
      runtime('Painel carregado.');
      wireEvents();
      await initAdmin();
      booting=false;
    } catch (error) {
      booting=false;
      setSync('● Erro');
      runtime('Não foi possível iniciar o Supabase: '+(error.message||error),true);
      setAuthMessage('Atualize a página. Se continuar, verifique se o deploy contém este admin.js atualizado.',true);
    }
  }

  async function currentAdmin() {
    if (!supabaseClient) return null;
    const {data:{session},error:sessionError}=await supabaseClient.auth.getSession();
    if (sessionError) { setControlsVisible(false); setAuthMessage('Erro ao recuperar a sessão: '+sessionError.message,true); return null; }
    if (!session) {
      setControlsVisible(false);
      $('#claimAdminBtn').hidden=true;
      return null;
    }
    const {data,error}=await supabaseClient.from('forge_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
    if (error) {
      setControlsVisible(false);
      setAuthMessage('Erro ao verificar administrador: '+error.message,true);
      return null;
    }
    if (!data) {
      setControlsVisible(false);
      $('#claimAdminBtn').hidden=false;
      setAuthMessage('Conta autenticada. Como ainda não existe administrador, você pode ativar esta conta como o primeiro administrador.');
      return null;
    }
    $('#claimAdminBtn').hidden=true;
    setControlsVisible(true);
    $('#adminUserLabel').textContent=session.user.email||'Administrador';
    return session.user;
  }

  async function login() {
    if (!supabaseClient) return setAuthMessage('O Supabase ainda não terminou de carregar. Aguarde e tente novamente.',true);
    const email=$('#adminEmail').value.trim(), password=$('#adminPassword').value;
    if (!email || !password) return setAuthMessage('Informe e-mail e senha.',true);
    setAuthMessage('Entrando…'); setSync('● Autenticando…');
    const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
    if (error) { setSync('● Erro'); return setAuthMessage('Não foi possível entrar: '+friendlyAuthError(error),true); }
    setAuthMessage('Login realizado. Verificando permissões…');
    await initAdmin();
    if (data?.user) runtime('Usuário autenticado com sucesso.');
  }

  async function signup() {
    if (!supabaseClient) return setAuthMessage('O Supabase ainda não terminou de carregar. Aguarde e tente novamente.',true);
    const email=$('#adminEmail').value.trim(), password=$('#adminPassword').value;
    if (!email) return setAuthMessage('Informe um e-mail.',true);
    if (password.length<6) return setAuthMessage('A senha precisa ter pelo menos 6 caracteres.',true);
    setAuthMessage('Criando conta…'); setSync('● Criando conta…');
    const {data,error}=await supabaseClient.auth.signUp({email,password});
    if (error) { setSync('● Erro'); return setAuthMessage('Não foi possível criar a conta: '+friendlyAuthError(error),true); }
    if (!data?.user) { setSync('● Erro'); return setAuthMessage('O Supabase não retornou o usuário criado.',true); }
    if (!data.session) {
      setSync('● Aguardando confirmação');
      return setAuthMessage('✓ Conta criada. Confirme o e-mail recebido e depois toque em “Entrar”. Se não receber a mensagem, verifique Spam/Lixo eletrônico.');
    }
    setSync('● Conta criada');
    setAuthMessage('✓ Conta criada e autenticada. Ative o primeiro administrador abaixo.');
    await initAdmin();
  }

  async function claimFirstAdmin() {
    if (!supabaseClient) return setAuthMessage('Supabase não conectado.',true);
    const {data:{session}}=await supabaseClient.auth.getSession();
    if (!session) return setAuthMessage('Entre na conta antes de ativar o primeiro administrador.',true);
    setAuthMessage('Ativando primeiro administrador…'); setSync('● Ativando…');
    const {data,error}=await supabaseClient.rpc('forge_claim_first_admin');
    if (error) { setSync('● Erro'); return setAuthMessage('Não foi possível ativar: '+error.message,true); }
    if (data===true) {
      setAuthMessage('✓ Primeiro administrador ativado com sucesso.');
      setSync('● Administrador ativo');
      await initAdmin();
    } else {
      setAuthMessage('Já existe um administrador no sistema. Esta conta não pode ser ativada automaticamente.',true);
      setSync('● Não ativado');
    }
  }

  async function logout() { if(supabaseClient) await supabaseClient.auth.signOut(); location.reload(); }

  function renderGames() {
    const box=$('#gameControls');
    box.innerHTML=Object.entries(games).map(([id,g])=>{
      const [label,desc]=labels[g.status]||labels.updating;
      return `<article class="game-control"><img src="${g.image}" alt=""><div class="gc-info"><strong>${escapeHtml(g.name)}</strong><small>${escapeHtml(desc)}</small></div><div class="gc-actions"><span class="gc-state ${g.status}">${label}</span><select data-game="${id}"><option value="available" ${g.status==='available'?'selected':''}>Pronto</option><option value="updating" ${g.status==='updating'?'selected':''}>Atualizando</option><option value="soon" ${g.status==='soon'?'selected':''}>Em breve</option><option value="offline" ${g.status==='offline'?'selected':''}>Indisponível</option></select></div></article>`;
    }).join('');
    box.querySelectorAll('select').forEach(s=>s.addEventListener('change',()=>updateGameStatus(s.dataset.game,s.value)));
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  async function updateGameStatus(id,status) {
    const g=games[id]; if(!g||!supabaseClient)return;
    setSync('● Salvando…');
    const {error}=await supabaseClient.from('forge_game_status').update({status}).eq('game_id',id);
    if(error){setSync('● Erro');return setAuthMessage('Erro ao salvar '+g.name+': '+error.message,true);}
    g.status=status; renderGames(); setSync('● Sincronizado');
  }

  function fillMaintenance() {
    $('#maintenanceEnabled').checked=!!maintenance.enabled;
    $('#maintenanceTitle').value=maintenance.title||'';
    $('#maintenanceMessage').value=maintenance.message||'';
    $('#maintenanceReturn').value=maintenance.returnAt?new Date(maintenance.returnAt).toISOString().slice(0,16):'';
    $('#maintenanceButton').value=maintenance.button||'';
  }

  async function loadData() {
    if(!supabaseClient)return;
    setSync('● Carregando…');
    const [gRes,mRes]=await Promise.all([
      supabaseClient.from('forge_game_status').select('game_id,name,image,status,url').order('game_id'),
      supabaseClient.from('forge_site_settings').select('*').eq('id','main').single()
    ]);
    if(gRes.error||mRes.error){setSync('● Erro');return setAuthMessage('Erro ao carregar dados: '+(gRes.error||mRes.error).message,true);}
    games={}; for(const row of gRes.data||[]) games[row.game_id]={name:row.name,image:row.image,status:row.status,url:row.url};
    maintenance={enabled:mRes.data.maintenance_enabled,title:mRes.data.maintenance_title,message:mRes.data.maintenance_message,returnAt:mRes.data.maintenance_return_at||'',button:mRes.data.maintenance_button||''};
    renderGames(); fillMaintenance(); setSync('● Sincronizado');
  }

  async function saveMaintenance() {
    if(!supabaseClient)return;
    const payload={maintenance_enabled:$('#maintenanceEnabled').checked,maintenance_title:$('#maintenanceTitle').value.trim()||'Estamos em manutenção',maintenance_message:$('#maintenanceMessage').value.trim()||'Voltaremos logo.',maintenance_return_at:$('#maintenanceReturn').value?new Date($('#maintenanceReturn').value).toISOString():null,maintenance_button:$('#maintenanceButton').value.trim()||'Aguardar retorno'};
    setSync('● Salvando…');
    const {error}=await supabaseClient.from('forge_site_settings').update(payload).eq('id','main');
    if(error){setSync('● Erro');return setAuthMessage('Erro ao salvar manutenção: '+error.message,true);}
    maintenance={enabled:payload.maintenance_enabled,title:payload.maintenance_title,message:payload.maintenance_message,returnAt:payload.maintenance_return_at,button:payload.maintenance_button};
    $('#saveFeedback').textContent='✓ Sincronizado com o Supabase'; setTimeout(()=>$('#saveFeedback').textContent='',2500); setSync('● Sincronizado');
  }

  async function resetGames(){
    if(!confirm('Restaurar os status padrão dos quatro jogos?'))return;
    setSync('● Restaurando…');
    for(const [id,g] of Object.entries(defaultGames)){
      const {error}=await supabaseClient.from('forge_game_status').update({status:g.status}).eq('game_id',id);
      if(error)return setAuthMessage('Erro ao restaurar: '+error.message,true);
    }
    await loadData();
  }

  function subscribeRealtime(){
    if(channel) supabaseClient.removeChannel(channel);
    channel=supabaseClient.channel('forge-control-admin')
      .on('postgres_changes',{event:'*',schema:'public',table:'forge_game_status'},loadData)
      .on('postgres_changes',{event:'*',schema:'public',table:'forge_site_settings'},loadData)
      .subscribe();
  }

  async function initAdmin(){
    const user=await currentAdmin();
    if(!user)return;
    await loadData();
    subscribeRealtime();
  }

  function wireEvents(){
    $('#adminLoginBtn').addEventListener('click',login);
    $('#adminSignupBtn').addEventListener('click',signup);
    $('#claimAdminBtn').addEventListener('click',claimFirstAdmin);
    $('#adminLogoutBtn').addEventListener('click',logout);
    $('#saveMaintenance').addEventListener('click',saveMaintenance);
    $('#maintenanceEnabled').addEventListener('change',saveMaintenance);
    $('#resetGames').addEventListener('click',resetGames);
    $('#adminPassword').addEventListener('keydown',e=>{if(e.key==='Enter')login();});
    supabaseClient.auth.onAuthStateChange((event)=>{
      if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='TOKEN_REFRESHED') setTimeout(initAdmin,50);
    });
  }

  document.addEventListener('DOMContentLoaded',boot,{once:true});
})();
