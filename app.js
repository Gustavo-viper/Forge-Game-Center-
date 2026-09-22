/* Forge Game Center — site público sincronizado com Supabase REST */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://pveivfqmeuswycgmpnue.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Qpuk0Q-UsRKUP0jNgkzvAA_MymEGzQ8';
  const API = `${SUPABASE_URL}/rest/v1`;

  const defaults = {
    cyber:{name:'Cyber Detective',status:'available',url:'https://jogos-forge.onrender.com'},
    pet:{name:'Forge Pet',status:'updating',url:'#'},
    hangman:{name:'Hangman Pro',status:'updating',url:'#'},
    words:{name:'Palavras Ocultas',status:'updating',url:'#'}
  };

  const statusInfo = {
    available:{label:'DISPONÍVEL',title:'Jogo pronto para jogar!',text:'O jogo está disponível no Forge Game Center.'},
    updating:{label:'ATUALIZANDO',title:'Estamos atualizando este jogo',text:'A equipe da Forge Studios está trabalhando neste projeto. Ele estará disponível assim que a atualização estiver pronta.'},
    soon:{label:'EM BREVE',title:'Este jogo está chegando',text:'O projeto ainda está sendo preparado pela Forge Studios. Fique de olho nas próximas novidades.'},
    offline:{label:'INDISPONÍVEL',title:'Jogo temporariamente indisponível',text:'Este jogo está temporariamente indisponível. Tente novamente mais tarde.'}
  };

  let games = {...defaults};
  let maintenance = {
    enabled:false,
    title:'Estamos em manutenção',
    message:'Estamos realizando algumas melhorias no Forge Game Center. Voltaremos logo.',
    returnAt:'',
    button:'Aguardar retorno'
  };
  let loading = false;

  const $ = s => document.querySelector(s);

  function setCloud(online=true){
    const b = $('#cloudSyncBadge');
    if(!b) return;
    b.innerHTML = online ? '☁️ <span>Online</span>' : '⚠️ <span>Reconectando...</span>';
    b.classList.toggle('offline', !online);
  }

  function formatDate(v){
    if(!v) return '';
    const d = new Date(v);
    if(Number.isNaN(d.getTime())) return '';
    return 'Previsão de retorno: ' + d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
  }

  function showMaintenance(){
    const screen = $('#maintenanceScreen');
    if(!screen) return;

    if(!maintenance.enabled){
      screen.hidden = true;
      return;
    }

    $('#maintenanceTitlePublic').textContent = maintenance.title || 'Estamos em manutenção';
    $('#maintenanceMessagePublic').textContent = maintenance.message || 'Estamos realizando algumas melhorias. Voltaremos logo.';
    $('#maintenanceReturnPublic').textContent = formatDate(maintenance.returnAt);

    const btn = $('#maintenanceButtonPublic');
    btn.textContent = maintenance.button || 'Aguardar retorno';
    btn.onclick = () => loadCloud(true);
    screen.hidden = false;
  }

  function applyGameStatuses(){
    document.querySelectorAll('[data-game-card]').forEach(card => {
      const id = card.dataset.gameCard;
      const g = games[id] || defaults[id];
      const info = statusInfo[g.status] || statusInfo.updating;

      const label = card.querySelector('.game-status');
      if(label){
        label.textContent = '● ' + info.label;
        label.className = 'status game-status ' + g.status;
      }

      const meta = card.querySelector('.meta b');
      if(meta) meta.textContent = g.status === 'available' ? 'DISPONÍVEL' : info.label;

      const btn = card.querySelector('.card-btn');
      if(btn) btn.textContent = g.status === 'available' ? 'Jogar agora →' : 'Ver status →';
    });
  }

  function openStatus(id){
    const g = games[id] || defaults[id];
    const info = statusInfo[g.status] || statusInfo.updating;
    $('#statusTitle').textContent = g.name;
    $('#statusText').textContent = info.text;
    $('#statusEyebrow').textContent = info.label;

    const action = $('#statusAction');
    if(g.status === 'available' && g.url && g.url !== '#'){
      action.textContent = 'Jogar agora →';
      action.href = g.url;
      action.target = '_blank';
      action.rel = 'noopener noreferrer';
    }else{
      action.textContent = 'Fechar';
      action.href = '#';
      action.removeAttribute('target');
      action.removeAttribute('rel');
    }
    $('#statusModal').hidden = false;
  }

  function closeStatus(){
    const modal = $('#statusModal');
    if(modal) modal.hidden = true;
  }

  function authHeaders(){
    return {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json'
    };
  }

  async function restGet(path){
    const response = await fetch(`${API}/${path}`, {
      method:'GET',
      headers:authHeaders(),
      cache:'no-store'
    });
    if(!response.ok){
      const text = await response.text();
      throw new Error(`Supabase ${response.status}: ${text}`);
    }
    return response.json();
  }

  async function loadCloud(force=false){
    if(loading && !force) return;
    loading = true;
    setCloud(false);

    try{
      const cacheBust = `_t=${Date.now()}`;
      const [gameRows, settingRows] = await Promise.all([
        restGet(`forge_game_status?select=game_id,name,status,url&order=game_id&${cacheBust}`),
        restGet(`forge_site_settings?select=id,maintenance_enabled,maintenance_title,maintenance_message,maintenance_return_at,maintenance_button&id=eq.main&${cacheBust}`)
      ]);

      const next = {};
      for(const row of gameRows || []){
        next[row.game_id] = {
          name: row.name,
          status: row.status,
          url: row.url || '#'
        };
      }
      games = {...defaults, ...next};

      const m = settingRows?.[0];
      if(m){
        maintenance = {
          enabled: !!m.maintenance_enabled,
          title: m.maintenance_title || 'Estamos em manutenção',
          message: m.maintenance_message || 'Estamos realizando algumas melhorias. Voltaremos logo.',
          returnAt: m.maintenance_return_at || '',
          button: m.maintenance_button || 'Aguardar retorno'
        };
      }

      setCloud(true);
      showMaintenance();
      applyGameStatuses();
    }catch(error){
      console.error('[Forge Game Center] Falha ao sincronizar:', error);
      setCloud(false);
      // Mantém a última informação válida na tela em caso de falha temporária.
      showMaintenance();
      applyGameStatuses();
    }finally{
      loading = false;
    }
  }

  // Menu mobile
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('#nav');
  if(menu && nav) menu.addEventListener('click',()=>nav.classList.toggle('open'));
  document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));

  // Links internos
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const href = a.getAttribute('href');
    if(href && href !== '#') history.replaceState(null,'',href);
  }));

  // Cards/jogos
  document.querySelectorAll('.game-launch').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();
    const id = a.dataset.game;
    const g = games[id] || defaults[id];
    if(g.status === 'available' && g.url && g.url !== '#'){
      window.location.href = g.url;
    }else{
      openStatus(id);
    }
  }));

  $('#statusClose')?.addEventListener('click',closeStatus);
  $('#statusModal')?.addEventListener('click',e=>{
    if(e.target.id === 'statusModal') closeStatus();
  });
  document.addEventListener('keydown',e=>{ if(e.key === 'Escape') closeStatus(); });

  // Primeira leitura + atualização frequente. Assim o jogador recebe alterações do ADM mesmo se o Realtime estiver bloqueado.
  loadCloud(true);
  setInterval(()=>loadCloud(false),5000);

  /* Forge Labs — ideias locais nesta versão. */
  const ideaForm=$('#ideaForm'),ideaText=$('#ideaText'),ideaCount=$('#ideaCount'),ideaList=$('#ideaList'),ideaMessage=$('#ideaMessage'),STORAGE_KEY='forgeGameCenterIdeas';
  function getIdeas(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
  function setIdeas(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function renderIdeas(){
    if(!ideaList)return;
    const ideas=getIdeas();
    if(!ideas.length){ideaList.innerHTML='<p>Nenhuma ideia enviada ainda.</p>';return}
    ideaList.innerHTML=ideas.map((x,i)=>`<div class="idea-entry"><div><strong>${escapeHtml(x.type)} · ${escapeHtml(x.game)}</strong><small>${escapeHtml(x.name||'Jogador Forge')} — ${escapeHtml(x.text)}</small></div><button type="button" data-remove="${i}">Excluir</button></div>`).join('');
    ideaList.querySelectorAll('[data-remove]').forEach(btn=>btn.onclick=()=>{const arr=getIdeas();arr.splice(Number(btn.dataset.remove),1);setIdeas(arr);renderIdeas()});
  }
  if(ideaText){
    ideaText.addEventListener('input',()=>ideaCount.textContent=ideaText.value.length);
    ideaForm.addEventListener('submit',e=>{
      e.preventDefault();
      const text=ideaText.value.trim();
      if(text.length<5){ideaMessage.textContent='Conte um pouco mais sobre a sua ideia.';ideaMessage.className='idea-message error';return}
      const arr=getIdeas();
      arr.unshift({name:$('#ideaName').value.trim(),type:$('#ideaType').value,game:$('#ideaGame').value,text,date:new Date().toISOString()});
      setIdeas(arr.slice(0,20));
      ideaForm.reset();
      ideaCount.textContent='0';
      ideaMessage.textContent='🚀 Ideia salva! Obrigado por ajudar a construir a Forge.';
      ideaMessage.className='idea-message';
      renderIdeas();
    });
    renderIdeas();
  }
})();
