import * as T from '../vendor/three/three.module.js';
import {criarRobo} from './robo.js';
import {controles} from './controles.js';

function tela(p) {
  const c=document.createElement('canvas');
  c.width=1024; c.height=512;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#17181b'; ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#facc15'; ctx.font='bold 108px Sora, sans-serif';
  ctx.fillText(String(p.numero).padStart(2,'0'),48,120);
  ctx.fillRect(48,151,928,6);
  ctx.font='bold 76px Sora, sans-serif'; ctx.fillStyle='#eeeeef';
  let linha='',y=265;
  for(const palavra of p.titulo.split(' ')){
    const nova=(linha+' '+palavra).trim();
    if(ctx.measureText(nova).width>928){ctx.fillText(linha,48,y);y+=87;linha=palavra;}
    else linha=nova;
  }
  ctx.fillText(linha,48,y);
  const textura=new T.CanvasTexture(c);
  textura.colorSpace=T.SRGBColorSpace;
  return new T.MeshBasicMaterial({map:textura});
}

export function criarMundo(container,palcos,abrir,toque,falhou) {
  const render=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  render.setPixelRatio(Math.min(devicePixelRatio,2));
  const cena=new T.Scene();
  cena.background=new T.Color(0x19191b);
  cena.fog=new T.FogExp2(0x242020,.033);
  const camera=new T.PerspectiveCamera(58,1,.06,75);
  camera.position.set(0,1.67,4.4); camera.lookAt(0,1.4,0);
  const concreto=new T.MeshStandardMaterial({color:0x515150,roughness:.36,metalness:.14});
  const aco=new T.MeshStandardMaterial({color:0x3c4044,metalness:.42,roughness:.52});
  const faixa=new T.MeshBasicMaterial({color:0xe4a23d});
  const lampada=new T.MeshBasicMaterial({color:0xffdea3});
  const caixa=new T.BoxGeometry();
  function bloco(pai,mat,x,y,z,w,h,d) {
    const m=new T.Mesh(caixa,mat);
    m.position.set(x,y,z); m.scale.set(w,h,d); pai.add(m); return m;
  }
  const piso=bloco(cena,concreto,0,-.16,0,38,.32,36);
  const juntaPiso=new T.MeshStandardMaterial({color:0x363737,roughness:.8});
  for(let i=-15;i<=15;i+=5){
    bloco(cena,juntaPiso,i,.002,0,.018,.003,34);
    bloco(cena,juntaPiso,0,.002,i,36,.003,.018);
  }
  for (const x of [-18,18]) bloco(cena,aco,x,4.25,0,.4,8.5,36);
  for (const z of [-17,17]) bloco(cena,aco,0,4.25,z,36,8.5,.4);
  bloco(cena,aco,0,8.5,0,36,.2,35);
  for(let z=-15;z<=15;z+=5){
    bloco(cena,aco,0,7.8,z,36,.5,.32);
    bloco(cena,lampada,0,7.48,z,6,.07,.18);
    for(const lado of [-1,1]){
      bloco(cena,aco,lado*16,3.85,z,.42,7.7,.52);
      bloco(cena,aco,lado*14.8,6.65,z,.25,3.5,.34).rotation.z=-lado*.75;
    }
  }
  cena.add(new T.HemisphereLight(0xffe3be,0x737985,1.55));
  const sol=new T.DirectionalLight(0xffdb9a,2.6);
  sol.position.set(-4,8,5);cena.add(sol);
  const foco=new T.PointLight(0xffbb63,65,18); foco.position.set(0,5,1); cena.add(foco);
  const base=new T.Mesh(new T.CylinderGeometry(1.05,1.18,.16,48),aco);
  base.position.y=.08;cena.add(base);
  const anel=new T.Mesh(new T.RingGeometry(1.25,1.28,64),faixa);
  anel.rotation.x=-Math.PI/2;anel.position.y=.012;cena.add(anel);
  const pedestal=new T.Group();pedestal.position.y=.16;cena.add(pedestal);
  const robo=criarRobo(pedestal);
  const pontos=new Map(),alvos=[];
  for(const p of palcos){
    const ang=T.MathUtils.degToRad(-112+(p.numero-1)*44.8);
    const palco=new T.Group();
    palco.position.set(Math.sin(ang)*10.5,0,-Math.cos(ang)*10.5);
    palco.rotation.y=-ang; cena.add(palco);
    const objetos=[
      bloco(palco,aco,0,.12,0,5.35,.24,1.85),
      bloco(palco,aco,0,1.65,-.18,4.86,2.86,.23),
      bloco(palco,faixa,0,.25,.89,5.1,.07,.055)
    ];
    const painel=new T.Mesh(new T.PlaneGeometry(4.65,2.325),tela(p));
    painel.position.set(0,1.72,-.045);palco.add(painel);
    for (const m of [...objetos,painel]) {m.userData.numero=p.numero;alvos.push(m);}
    for(let i=2;i<=8;i+=1.35)bloco(palco,faixa,0,.009,i,.075,.016,.74);
    pontos.set(p.numero,{destino:palco.position.clone().multiplyScalar(.72),olhar:new T.Vector3(palco.position.x,1.7,palco.position.z)});
  }
  container.replaceChildren(render.domElement);
  let ativo=false,anterior=0;
  const reduz=matchMedia('(prefers-reduced-motion: reduce)');
  function posicionar(n){
    const {destino,olhar}=pontos.get(n);
    controle.parar();camera.position.set(destino.x,1.67,destino.z);camera.lookAt(olhar);
  }
  const controle=controles(camera,render.domElement,piso,alvos,n=>{
    const chegar=()=>{posicionar(n);abrir(n);};
    if(reduz.matches)chegar();else controle.ir(pontos.get(n).destino,chegar);
  },toque);
  function tamanho(){
    const {clientWidth:w,clientHeight:h}=container;
    if(w && h){render.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  }
  const observer=new ResizeObserver(tamanho);observer.observe(container);
  function quadro(t){
    const dt=Math.min(.05,(t-anterior)/1000);anterior=t;
    if(!document.querySelector('dialog[open]'))controle.quadro(dt);
    robo.quadro(dt);render.render(cena,camera);
  }
  function mostrar(sim){
    controle.parar();ativo=sim;tamanho();anterior=performance.now();render.setAnimationLoop(sim?quadro:null);
  }
  render.domElement.addEventListener('webglcontextlost',e=>{
    e.preventDefault();const estavaAtivo=ativo;mostrar(false);observer.disconnect();
    if(estavaAtivo)falhou();else falhou(false);
  });
  function verRobo(){
    controle.parar();
    camera.position.set(0,1.67,3.55);
    camera.lookAt(0,1.36,0);
  }
  return {mostrar,posicionar,verRobo,atualizar:(ids,completo,animar)=>robo.atualizar(ids,completo,animar&&!reduz.matches)};
}
