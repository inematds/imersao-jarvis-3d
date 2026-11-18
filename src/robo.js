import * as T from '../vendor/three/three.module.js';

export function criarRobo(cena) {
  const raiz = new T.Group();
  cena.add(raiz);
  const metal = new T.MeshStandardMaterial({color:0xd1d2cf,metalness:.45,roughness:.44});
  const junta = new T.MeshStandardMaterial({color:0x323439,metalness:.5,roughness:.5});
  const vidro = new T.MeshStandardMaterial({color:0x090a0c,metalness:.38,roughness:.16});
  const esfera = new T.SphereGeometry(1,24,16);
  const caixa = new T.BoxGeometry(1,1,1);
  function forma(geo,mat,x,y,z,w,h,d) {
    const obj = new T.Mesh(geo,mat);
    obj.position.set(x,y,z);
    obj.scale.set(w,h,d);
    raiz.add(obj);
    return obj;
  }
  const oval = (...args) => forma(esfera,...args);
  oval(junta,0,1.39,0,.24,.34,.15);
  oval(metal,0,1.58,0,.335,.31,.18);
  oval(metal,0,1.08,0,.23,.16,.155);
  oval(junta,0,1.87,0,.1,.12,.095);
  oval(metal,0,2.015,0,.157,.192,.146);
  oval(vidro,0,2.028,.055,.16,.132,.122);
  for (const s of [-1,1]) {
    oval(junta,s*.31,1.72,0,.102,.105,.105);
    oval(metal,s*.37,1.56,0,.089,.18,.093).rotation.z=s*.15;
    oval(junta,s*.39,1.39,0,.072,.075,.075);
    oval(metal,s*.4,1.24,.012,.072,.15,.074);
    oval(junta,s*.4,1.08,.022,.045,.065,.05);
    if (s===1) oval(metal,s*.4,.995,.025,.059,.095,.05);
    oval(metal,s*.143,.816,0,.111,.244,.121);
    oval(junta,s*.148,.59,.006,.084,.09,.085);
    oval(metal,s*.15,.342,-.014,.081,.218,.089);
    oval(junta,s*.15,.135,0,.066,.068,.062);
    oval(metal,s*.15,.072,.057,.085,.068,.152);
  }
  const pecas = new Map();
  function modulo(id,x,y,z,w,h,d) {
    const moldura = new T.LineSegments(new T.EdgesGeometry(caixa),new T.LineBasicMaterial({color:0x616267}));
    moldura.scale.set(w,h,d);
    moldura.position.set(x,y,z);
    raiz.add(moldura);
    const corpo = forma(caixa,metal.clone(),x,y,z,w,h,d);
    corpo.visible=false;
    pecas.set(id,{corpo,moldura,tempo:0,z});
  }
  modulo('modelo',0,2.145,.045,.14,.065,.105);
  modulo('canal',0,1.868,.091,.14,.055,.055);
  modulo('identidade',-.084,1.63,.168,.15,.08,.032);
  modulo('memoria',0,1.98,-.137,.14,.09,.06);
  modulo('ferramentas',-.4,1.002,.023,.105,.15,.079);
  modulo('travas',-.4,1.095,.024,.115,.055,.115);
  modulo('testes',.32,1.78,.054,.1,.07,.095);
  modulo('diario',0,1.55,-.18,.23,.21,.09);
  const linha=forma(caixa,new T.MeshBasicMaterial({color:0xffbc43}),0,2.032,.174,.114,.008,.009);
  linha.visible=false;
  return {
    atualizar(ids,completo,animar) {
      linha.visible=completo;
      for (const [id,p] of pecas) {
        const mostrar=ids.includes(id);
        p.tempo=mostrar && !p.corpo.visible && animar ? .65 : 0;
        p.corpo.visible=mostrar;
        p.moldura.visible=!mostrar;
      }
    },
    quadro(dt) {
      for (const p of pecas.values()) {
        p.tempo=Math.max(0,p.tempo-dt);
        p.corpo.position.z=p.z+Math.sign(p.z)*.27*p.tempo/.65;
        p.corpo.material.emissive.setHex(0xffb83c);
        p.corpo.material.emissiveIntensity=p.tempo*2;
      }
    }
  };
}
