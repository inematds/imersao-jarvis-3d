import * as T from '../vendor/three/three.module.js';

export function criarRobo(cena) {
  const chassis=new T.Group();
  cena.add(chassis);
  const material=(color,roughness,metalness)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const grafite=material(0x373b41,.52,.38), eixo=material(0x646b75,.48,.5);
  const vidro=material(0x090b10,.21,.28);
  const pecas=new Map();
  function armadura(id){
    const grupo=new T.Group();
    grupo.name=id;grupo.visible=false;chassis.add(grupo);
    grupo.userData.metal=material(0xb9bdc4,.58,.32);
    pecas.set(id,grupo);
    return grupo;
  }
  const cubo=new T.BoxGeometry();
  const cilindro=new T.CylinderGeometry(.5,.5,1,10);
  // Painel estampado, mais estreito na ponta inferior e com os quatro cantos cortados.
  const perfil=new T.Shape();
  const pontos=[[-.32,-.48],[.32,-.48],[.40,-.38],[.49,.32],[.36,.48],[-.36,.48],[-.49,.32],[-.40,-.38]];
  pontos.forEach(([x,y],i)=>i?perfil.lineTo(x,y):perfil.moveTo(x,y));perfil.closePath();
  const placa=new T.ExtrudeGeometry(perfil,{depth:.84,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.035,bevelThickness:.08});
  placa.center();
  function montar(grupo,geo,mat,x,y,z,w,h,d){
    const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(w,h,d);grupo.add(m);return m;
  }
  const estrutura=(geo,mat,...medidas)=>montar(chassis,geo,mat,...medidas);
  const vestir=(grupo,...medidas)=>montar(grupo,placa,grupo.userData.metal,...medidas);
  const cranio=armadura('modelo'),gola=armadura('canal'),peito=armadura('identidade');
  const nuca=armadura('memoria'),mao=armadura('ferramentas'),punho=armadura('travas');
  const ombros=armadura('testes'),costas=armadura('diario');

  estrutura(cubo,grafite,0,1.48,-.045,.13,.72,.13);
  estrutura(placa,grafite,0,1.10,0,.39,.19,.22);
  estrutura(cubo,eixo,0,1.73,0,.65,.08,.13);
  estrutura(cilindro,eixo,0,1.90,0,.095,.16,.095);
  estrutura(placa,grafite,0,2.055,0,.22,.29,.17);
  // A superfície frontal curva acompanha as têmporas desde a primeira visita.
  const viseira=new T.CylinderGeometry(1,1,1,24,1,true,-1.40,2.80);
  estrutura(viseira,vidro,0,2.075,.004,.151,.113,.146);
  const linha=estrutura(viseira,new T.MeshBasicMaterial({color:0xffbf48}),0,2.07,.006,.153,.008,.148);
  linha.visible=false;
  vestir(cranio,0,2.16,-.003,.283,.081,.233);
  vestir(cranio,0,1.99,.065,.218,.085,.131);
  vestir(nuca,0,2.06,-.099,.267,.215,.13);
  vestir(gola,0,1.88,.018,.286,.098,.242);
  vestir(peito,0,1.635,.060,.585,.30,.236);
  vestir(peito,0,1.375,.048,.32,.19,.19);
  vestir(costas,0,1.58,-.14,.47,.39,.145);
  vestir(costas,0,1.12,-.06,.43,.18,.235);
  for(const lado of [-1,1]){
    const x=lado*.135;
    estrutura(cubo,eixo,lado*.148,1.48,0,.044,.34,.071).rotation.z=-lado*.19;
    estrutura(placa,grafite,x,.82,0,.135,.43,.147);
    estrutura(cilindro,eixo,x,.598,0,.12,.10,.12).rotation.z=Math.PI/2;
    estrutura(placa,grafite,x,.347,-.015,.10,.41,.106);
    estrutura(cilindro,eixo,x+lado*.06,.38,-.028,.03,.33,.03);
    estrutura(placa,grafite,x,.077,.052,.168,.135,.292);
    vestir(peito,x,.838,.04,.197,.417,.176);
    vestir(costas,x,.342,.020,.149,.408,.16);
    vestir(costas,x,.098,.079,.174,.104,.269);
    const braco=lado*.38, pulso=lado*.422;
    estrutura(cilindro,eixo,braco,1.71,0,.137,.12,.137).rotation.z=Math.PI/2;
    estrutura(placa,grafite,braco,1.54,0,.091,.285,.106).rotation.z=lado*.105;
    estrutura(cilindro,eixo,lado*.397,1.393,0,.092,.086,.092).rotation.z=Math.PI/2;
    estrutura(placa,grafite,pulso,1.245,.013,.086,.243,.09);
    estrutura(cubo,grafite,pulso,1.04,.028,.093,.14,.061);
    vestir(ombros,braco,1.727,.005,.212,.178,.238);
    vestir(ombros,braco,1.55,.026,.146,.25,.154).rotation.z=lado*.105;
    vestir(punho,pulso,1.257,.016,.139,.236,.147);
    vestir(punho,pulso,1.123,.020,.119,.065,.132);
    vestir(mao,pulso,1.046,.044,.122,.139,.091);
    for(let i=0;i<4;i++){
      const dx=(i-1.5)*.026;
      estrutura(cubo,eixo,pulso+dx,.943,.036,.017,.084-Math.abs(dx)*.44,.029);
    }
    estrutura(placa,grafite,pulso-lado*.062,1,.047,.033,.086,.046).rotation.z=-lado*.36;
  }
  return {
    atualizar(ids,completo,animar){
      linha.visible=completo;
      for(const [id,g] of pecas){
        const mostrar=ids.includes(id);
        g.userData.tempo=mostrar && !g.visible && animar ? .65 : 0;
        g.visible=mostrar;
      }
      this.quadro(0);
    },
    quadro(dt){
      for(const g of pecas.values()){
        const t=Math.max(0,(g.userData.tempo||0)-dt);
        g.userData.tempo=t;
        const sinal=['memoria','diario'].includes(g.name)?-1:1;
        g.position.z=sinal*.45*(t/.65)**2;
        g.userData.metal.emissive.setHex(0xffc277);
        g.userData.metal.emissiveIntensity=t*.98;
      }
    }
  };
}
