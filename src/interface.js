import {carregar} from './dados.js';
import {progresso} from './progresso.js';

const el=id=>document.getElementById(id);
const evento=await carregar(el('aviso'));
if(evento) iniciar(evento);

function iniciar(dados) {
  const {palcos,pecas,apresentador,fecho}=dados;
  const salvo=progresso(palcos), painel=el('painel'), corpo=el('sessao');
  let modo='entrada', palcoAtual=null, mundo=null, carregando=false;
  const numero=n=>String(n).padStart(2,'0');
  const obter=n=>palcos.find(p=>p.numero===n);
  const visiveis=()=>salvo.feitas.flatMap(n=>obter(n).pecas);
  const completo=()=>salvo.feitas.length===palcos.length;
  const criar=(tag,texto,classe)=>{
    const no=document.createElement(tag); no.textContent=texto;
    if(classe)no.className=classe;
    return no;
  };
  function botao(texto,acao){
    const b=criar('button',texto); b.onclick=acao;return b;
  }
  function link(texto,url){
    const a=criar('a',texto);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
  }
  for(const porta of dados.portas){
    el('portas').append(criar('h3',porta.titulo),criar('p',porta.para_quem),link(porta.curso,porta.url));
  }
  function agenda(animar=false){
    const feitas=salvo.feitas;
    el('contagem').textContent=feitas.length+' de '+palcos.length+' etapas feitas';
    el('rever').hidden=!completo();
    el('agenda').replaceChildren(...palcos.map(p=>{
      const feita=feitas.includes(p.numero);
      const card=document.createElement('article'),cab=criar('div','','etapa');
      cab.append(criar('span','Palco '+numero(p.numero),'numero'),criar('span',feita?'Feita':'A fazer',feita?'feita':''));
      const ir=botao('Ir até lá',()=>irPara(p.numero));
      ir.setAttribute('aria-label','Ir até lá — '+p.titulo);
      card.append(cab,criar('h3',p.titulo),ir);return card;
    }));
    mundo?.atualizar(visiveis(),completo(),animar);
  }
  function abrir(contexto,titulo){
    el('contexto').textContent=contexto;
    const h=criar('h2',titulo);h.id='tituloPainel';h.tabIndex=-1;corpo.replaceChildren(h);
    if(!painel.open)painel.showModal();
    painel.scrollTop=0;h.focus();
  }
  function secao(titulo,texto){corpo.append(criar('h3',titulo),criar('p',texto));}
  function mostrarFecho(){
    palcoAtual=null;
    abrir('Jarvis ligado','Seu assistente está montado');
    corpo.append(criar('p',apresentador.encerramento),criar('h3',fecho.pergunta),link(fecho.cta,'https://inema.club'));
    corpo.append(criar('h3','Para ir além'));
    for(const item of dados.alem)corpo.append(link(item.titulo,item.url),criar('p',item.descricao));
  }
  function marcar(n){
    if(!obter(n)||salvo.feitas.includes(n))return;
    if(modo==='3d')mundo.verRobo();
    salvo.marcar(n);agenda(true);
    if(completo())mostrarFecho();
    else if(palcoAtual===n)sessao(n);
  }
  function sessao(n){
    const p=obter(n);palcoAtual=n;
    abrir('Palco '+numero(n)+' / '+numero(palcos.length),p.titulo);
    corpo.append(criar('p',p.fala));
    secao('O que você ganha',p.ganho);
    corpo.append(criar('h3','Material'));
    if(p.video){
      const video=p.video;
      const assistir=botao('Assistir · '+video.titulo+' ('+video.duracao+')',()=>{
        const frame=document.createElement('iframe');
        frame.title=video.titulo;frame.allowFullscreen=true;
        frame.referrerPolicy='strict-origin-when-cross-origin';
        frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(video.youtube_id);
        assistir.replaceWith(frame);
      });
      corpo.append(assistir);
    }
    for(const m of p.materiais)corpo.append(link(m.titulo,m.url),criar('p',m.detalhe));
    secao('Sua tarefa',p.tarefa);secao('Pronto quando',p.pronto_quando);
    secao('Encaixe no robô',p.pecas.map(id=>pecas.find(item=>item.id===id).parte_robo).join(' · '));
    const feita=salvo.feitas.includes(n);
    const marcarBtn=botao(feita?'Etapa feita':'Marcar como feita',()=>marcar(n));
    marcarBtn.id='marcar';marcarBtn.disabled=feita;corpo.append(marcarBtn);
  }
  function irPara(n){
    if(!obter(n))return;
    if(modo==='entrada')exibir(false);
    if(modo==='3d')mundo.posicionar(n);
    sessao(n);
  }
  function exibir(tres){
    modo=tres?'3d':'sem-3d';
    el('entrada').hidden=true; el('evento').hidden=false; el('hangar').hidden=!tres;
    el('cracha').hidden=false; el('cracha').textContent=salvo.nome||'Visitante';
    el('tituloModo').textContent=tres?'Hangar de montagem':'Programação sem 3D';
    el('trocar').textContent=tres?'Assistir sem 3D':'Entrar no hangar';
    el('fala').textContent=apresentador.nome+' · '+apresentador.abertura;
    mundo?.mostrar(tres);agenda();el('tituloModo').focus();
  }
  function falhou(avisar=true){
    mundo=null;el('toque').replaceChildren();el('cena').replaceChildren();
    if(avisar){
      exibir(false);el('aviso').textContent='O 3D ficou indisponível. A programação está aberta no modo sem 3D.';
      el('aviso').hidden=false;
    }
  }
  async function entrar(tres){
    if(carregando)return;
    el('aviso').hidden=true;
    if(!tres || mundo){exibir(tres);return;}
    carregando=true;
    try{
      const {criarMundo}=await import('./mundo.js');
      mundo=criarMundo(el('cena'),palcos,sessao,el('toque'),falhou);
      exibir(true);
    }catch{falhou();}
    finally{carregando=false;}
  }
  el('promessa').textContent=dados.chamada.nucleo.split('. ')[0]+'.';
  el('nome').value=salvo.nome;
  el('acesso').onsubmit=e=>{
    e.preventDefault();salvo.identificar(el('nome').value);entrar(e.submitter?.value!=='sem-3d');
  };
  for(const b of el('acesso').querySelectorAll('button'))b.disabled=false;
  el('trocar').onclick=()=>entrar(modo!=='3d');
  el('rever').onclick=mostrarFecho;
  el('fechar').onclick=()=>painel.close();
  painel.onclose=()=>{
    if(painel.open)return;
    corpo.replaceChildren();
    const ultimo=palcoAtual;palcoAtual=null;
    const destino=ultimo?el('agenda').children[ultimo-1]?.querySelector('button'):el('rever');
    if(!el('evento').hidden)(destino&&!destino.hidden?destino:el('agendaTitulo')).focus();
  };
  window.__evento={
    estado:()=>({modo,palcoAtual,feitas:salvo.feitas,pecasVisiveis:visiveis(),webgl:!!mundo}),
    irPara,marcar,limpar(){
      salvo.limpar();el('nome').value='';el('cracha').textContent='Visitante';palcoAtual=null;
      if(painel.open)painel.close();agenda();
    }
  };
}
