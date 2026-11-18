import {Vector2,Vector3,Raycaster} from '../vendor/three/three.module.js';

export function controles(camera,canvas,piso,alvos,visitar,toque) {
  const teclas=new Set(), toqueAtivo=new Set();
  const mapa={w:'frente',arrowup:'frente',s:'tras',arrowdown:'tras',a:'esquerda',arrowleft:'esquerda',d:'direita',arrowright:'direita'};
  const raio=new Raycaster(), ponteiro=new Vector2();
  let toqueInicial=null, arrastou=false, rota=[], aoChegar=null;
  let vx=0,vz=0;
  const limite=9.1, obstaculo=1.38;
  canvas.tabIndex=0;
  canvas.setAttribute('aria-label','Hangar 3D. Use WASD ou as setas para caminhar.');
  camera.rotation.order='YXZ';
  function parar() { teclas.clear(); toqueAtivo.clear(); rota=[]; aoChegar=null; vx=vz=0; }
  canvas.onkeydown=e=>{
    const dir=mapa[e.key.toLowerCase()];
    if (dir) { e.preventDefault(); teclas.add(e.key.toLowerCase()); rota=[]; }
  };
  canvas.onkeyup=e=>teclas.delete(e.key.toLowerCase());
  canvas.onblur=()=>teclas.clear();
  for(const [dir,simbolo,nome] of [['esquerda','←','esquerda'],['frente','↑','frente'],['tras','↓','trás'],['direita','→','direita']]){
    const btn=document.createElement('button');
    btn.textContent=simbolo; btn.setAttribute('aria-label','Andar para '+nome); toque.append(btn);
    btn.onpointerdown=e=>{btn.setPointerCapture(e.pointerId); toqueAtivo.add(dir); rota=[];};
    btn.onlostpointercapture=()=>toqueAtivo.delete(dir);
    btn.onclick=e=>{if(e.detail===0) passo(dir);};
  }
  function limitar(p) {
    const r=Math.hypot(p.x,p.z);
    if(r===0){p.z=obstaculo;return p;}
    const fator=Math.min(limite,Math.max(obstaculo,r))/r;
    p.x*=fator; p.z*=fator;
    return p;
  }
  function passo(dir) {
    const v=new Vector3(Number(dir==='direita')-Number(dir==='esquerda'),0,Number(dir==='tras')-Number(dir==='frente'));
    v.applyAxisAngle(new Vector3(0,1,0),camera.rotation.y);
    limitar(camera.position.addScaledVector(v,.3));
  }
  function ir(p,fim) {
    parar();
    const a=camera.position.clone(); a.y=0;
    const b=limitar(new Vector3(p.x,0,p.z));
    const delta=b.clone().sub(a);
    const t=Math.max(0,Math.min(1,-a.dot(delta)/(delta.lengthSq()||1)));
    if (a.clone().addScaledVector(delta,t).length()<obstaculo+.08) {
      const inicio=Math.atan2(a.z,a.x), final=Math.atan2(b.z,b.x);
      const arco=Math.atan2(Math.sin(final-inicio),Math.cos(final-inicio));
      const passos=Math.max(1,Math.ceil(Math.abs(arco)/.35));
      for(let i=0;i<=passos;i++){
        const ang=inicio+arco*i/passos;
        rota.push(new Vector3(1.65*Math.cos(ang),0,1.65*Math.sin(ang)));
      }
    }
    rota.push(b); aoChegar=fim;
  }
  canvas.onpointerdown=e=>{
    if(toqueInicial || e.button!==0)return;
    canvas.focus(); canvas.setPointerCapture(e.pointerId);
    toqueInicial={x:e.clientX,y:e.clientY,px:e.clientX,py:e.clientY,id:e.pointerId}; arrastou=false;
  };
  canvas.onpointermove=e=>{
    const p=toqueInicial;
    if(!p || p.id!==e.pointerId)return;
    if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>4)arrastou=true;
    if(arrastou){
      camera.rotation.y-=(e.clientX-p.px)*.004;
      camera.rotation.x=Math.max(-1.12,Math.min(1.12,camera.rotation.x-(e.clientY-p.py)*.004));
    }
    p.px=e.clientX; p.py=e.clientY;
  };
  canvas.onpointerup=e=>{
    if(toqueInicial?.id!==e.pointerId)return;
    toqueInicial=null;
    if(arrastou)return;
    const rect=canvas.getBoundingClientRect();
    ponteiro.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
    raio.setFromCamera(ponteiro,camera);
    const hit=raio.intersectObjects([piso,...alvos],false)[0];
    if(hit?.object.userData.numero)visitar(hit.object.userData.numero);
    else if(hit)ir(hit.point);
  };
  canvas.onlostpointercapture=()=>{toqueInicial=null;};
  function quadro(dt) {
    if(rota.length){
      const p=rota[0],dx=p.x-camera.position.x,dz=p.z-camera.position.z;
      const dist=Math.hypot(dx,dz), passo=Math.min(dist,2.65*dt);
      camera.position.x+=dx/(dist||1)*passo; camera.position.z+=dz/(dist||1)*passo;
      if(dist<=passo+.001){rota.shift(); if(!rota.length)aoChegar?.();}
      return;
    }
    const dirs=new Set([...toqueAtivo,...[...teclas].map(k=>mapa[k])]);
    const x=Number(dirs.has('direita'))-Number(dirs.has('esquerda')),z=Number(dirs.has('tras'))-Number(dirs.has('frente'));
    const yaw=camera.rotation.y,k=2.2/(Math.hypot(x,z)||1), blend=1-Math.exp(-12*dt);
    vx+=((x*Math.cos(yaw)+z*Math.sin(yaw))*k-vx)*blend;
    vz+=((z*Math.cos(yaw)-x*Math.sin(yaw))*k-vz)*blend;
    camera.position.x+=vx*dt; camera.position.z+=vz*dt; limitar(camera.position);
  }
  return {ir,quadro,parar};
}
