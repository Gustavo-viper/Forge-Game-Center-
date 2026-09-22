const SUPABASE_URL='https://pveivfqmeuswycgmpnue.supabase.co';
const SUPABASE_KEY='sb_publishable_Qpuk0Q-UsRKUP0jNgkzvAA_MymEGzQ8';
const { createClient } = window.supabase;
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);

const defaultGames={
  cyber:{name:'Cyber Detective',image:'assets/cyber-detective.png',status:'available',url:'https://jogos-forge.onrender.com'},
  pet:{name:'Forge Pet',image:'assets/forge-pet.png',status:'updating',url:'#'},
  hangman:{name:'Hangman Pro',image:'assets/hangman-pro.png',status:'updating',url:'#'},
  words:{name:'Palavras Ocultas',image:'assets/palavras-ocultas.png',status:'updating',url:'#'}
};
const labels={available:['PRONTO','O jogo está disponível para jogar.'],updating:['ATUALIZANDO','O jogo está recebendo atualizações e estará disponível em breve.'],soon:['EM BREVE','O jogo está sendo preparado pela Forge Studios.'],offline:['INDISPONÍVEL','O jogo está temporariamente indisponível.']};
let games=structuredClone(defaultGames);
let maintenance={enabled:false,title:'Estamos em manutenção',message:'Estamos realizando algumas melhorias no Forge Game Center. Voltaremos logo.',returnAt:'',button:'Aguardar retorno'};
let channel=null;

const $=s=>document.querySelector(s);
function setAuthMessage(msg,error=false){const el=$('#adminAuthMessage');el.textContent=msg;el.className='admin-feedback '+(error?'error':'')}
function setSync(msg){$('#syncStatus').textContent=msg}
function setControlsVisible(v){$('#adminControls').hidden=!v;$('#adminLogin').hidden=v}

async function currentAdmin(){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){setControlsVisible(false);return null}
  const {data,error}=await supabase.from('forge_admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(error){setAuthMessage('Erro ao verificar administrador: '+error.message,true);setControlsVisible(false);return null}
  if(!data){setControlsVisible(false);$('#claimAdminBtn').hidden=false;setAuthMessage('Conta autenticada, mas ainda não é administradora. Se este for o primeiro administrador, use “Ativar primeiro administrador”.');return null}
  $('#claimAdminBtn').hidden=true;setControlsVisible(true);$('#adminUserLabel').textContent=session.user.email||'Administrador';return session.user
}

async function login(){
  const email=$('#adminEmail').value.trim(),password=$('#adminPassword').value;
  if(!email||!password)return setAuthMessage('Informe e-mail e senha.',true);
  setAuthMessage('Entrando...');
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error)return setAuthMessage('Não foi possível entrar: '+error.message,true);
  await initAdmin();
}
async function signup(){
  const email=$('#adminEmail').value.trim(),password=$('#adminPassword').value;
  if(!email||password.length<6)return setAuthMessage('Informe um e-mail e uma senha com pelo menos 6 caracteres.',true);
  setAuthMessage('Criando conta...');
  const {data,error}=await supabase.auth.signUp({email,password});
  if(error)return setAuthMessage('Não foi possível criar a conta: '+error.message,true);
  if(!data.session)return setAuthMessage('Conta criada. Confirme o e-mail recebido e depois entre no painel.');
  await initAdmin();
}
async function claimFirstAdmin(){
  setAuthMessage('Ativando primeiro administrador...');
  const {data,error}=await supabase.rpc('forge_claim_first_admin');
  if(error)return setAuthMessage('Não foi possível ativar: '+error.message,true);
  if(data){setAuthMessage('✓ Primeiro administrador ativado.');await initAdmin()}
  else setAuthMessage('Já existe um administrador no sistema. Esta conta não pode ser ativada automaticamente.',true)
}
async function logout(){await supabase.auth.signOut();location.reload()}

function renderGames(){
  const box=$('#gameControls');
  box.innerHTML=Object.entries(games).map(([id,g])=>{const [label,desc]=labels[g.status]||labels.updating;return `<article class="game-control"><img src="${g.image}" alt=""><div class="gc-info"><strong>${g.name}</strong><small>${desc}</small></div><div class="gc-actions"><span class="gc-state ${g.status}">${label}</span><select data-game="${id}"><option value="available" ${g.status==='available'?'selected':''}>Pronto</option><option value="updating" ${g.status==='updating'?'selected':''}>Atualizando</option><option value="soon" ${g.status==='soon'?'selected':''}>Em breve</option><option value="offline" ${g.status==='offline'?'selected':''}>Indisponível</option></select></div></article>`}).join('');
  box.querySelectorAll('select').forEach(s=>s.onchange=()=>updateGameStatus(s.dataset.game,s.value));
}
async function updateGameStatus(id,status){
  const g=games[id]; if(!g)return;
  setSync('● Salvando...');
  const {error}=await supabase.from('forge_game_status').update({status}).eq('game_id',id);
  if(error){setSync('● Erro ao salvar');setAuthMessage('Erro ao salvar '+g.name+': '+error.message,true);return}
  g.status=status;renderGames();setSync('● Sincronizado');
}

function fillMaintenance(){
  $('#maintenanceEnabled').checked=!!maintenance.enabled;
  $('#maintenanceTitle').value=maintenance.title||'';
  $('#maintenanceMessage').value=maintenance.message||'';
  $('#maintenanceReturn').value=maintenance.returnAt?new Date(maintenance.returnAt).toISOString().slice(0,16):'';
  $('#maintenanceButton').value=maintenance.button||'';
}
async function loadData(){
  setSync('● Carregando...');
  const [gRes,mRes]=await Promise.all([
    supabase.from('forge_game_status').select('game_id,name,image,status,url').order('game_id'),
    supabase.from('forge_site_settings').select('*').eq('id','main').single()
  ]);
  if(gRes.error||mRes.error){setSync('● Erro');setAuthMessage((gRes.error||mRes.error).message,true);return}
  games={};for(const row of gRes.data){games[row.game_id]={name:row.name,image:row.image,status:row.status,url:row.url}}
  maintenance={enabled:mRes.data.maintenance_enabled,title:mRes.data.maintenance_title,message:mRes.data.maintenance_message,returnAt:mRes.data.maintenance_return_at||'',button:mRes.data.maintenance_button||''};
  renderGames();fillMaintenance();setSync('● Sincronizado');
}
async function saveMaintenance(){
  const payload={maintenance_enabled:$('#maintenanceEnabled').checked,maintenance_title:$('#maintenanceTitle').value.trim()||'Estamos em manutenção',maintenance_message:$('#maintenanceMessage').value.trim()||'Voltaremos logo.',maintenance_return_at:$('#maintenanceReturn').value?new Date($('#maintenanceReturn').value).toISOString():null,maintenance_button:$('#maintenanceButton').value.trim()||'Aguardar retorno'};
  setSync('● Salvando...');
  const {error}=await supabase.from('forge_site_settings').update(payload).eq('id','main');
  if(error){setSync('● Erro');return setAuthMessage('Erro ao salvar manutenção: '+error.message,true)}
  maintenance={enabled:payload.maintenance_enabled,title:payload.maintenance_title,message:payload.maintenance_message,returnAt:payload.maintenance_return_at,button:payload.maintenance_button};
  $('#saveFeedback').textContent='✓ Sincronizado com o Supabase';setTimeout(()=>$('#saveFeedback').textContent='',2500);setSync('● Sincronizado');
}
async function resetGames(){
  if(!confirm('Restaurar os status padrão dos quatro jogos?'))return;
  setSync('● Restaurando...');
  for(const [id,g] of Object.entries(defaultGames)) await supabase.from('forge_game_status').update({status:g.status}).eq('game_id',id);
  await loadData();
}
function subscribeRealtime(){
  if(channel)supabase.removeChannel(channel);
  channel=supabase.channel('forge-control-admin').on('postgres_changes',{event:'*',schema:'public',table:'forge_game_status'},loadData).on('postgres_changes',{event:'*',schema:'public',table:'forge_site_settings'},loadData).subscribe();
}
async function initAdmin(){
  const user=await currentAdmin();if(!user)return;
  await loadData();subscribeRealtime();
}

$('#adminLoginBtn').onclick=login;$('#adminSignupBtn').onclick=signup;$('#claimAdminBtn').onclick=claimFirstAdmin;$('#adminLogoutBtn').onclick=logout;$('#saveMaintenance').onclick=saveMaintenance;$('#maintenanceEnabled').onchange=saveMaintenance;$('#resetGames').onclick=resetGames;
supabase.auth.onAuthStateChange(()=>setTimeout(initAdmin,0));
initAdmin();
