import * as THREE from '/vendor/three/three.module.js';

/** A measured, procedural model. Visual state comes only from the data provider. */
export function createHouseModel() {
  const group = new THREE.Group();
  group.name = 'ZhipTech Smart Home · procedural digital twin';
  const pickables = [], materials = new Set(), geometries = new Set(), textures = new Set();
  const roof = new THREE.Group(), facade = new THREE.Group(), highWalls = new THREE.Group();
  const lowWalls = new THREE.Group();
  group.add(roof, facade, highWalls, lowWalls);
  let night = false, currentState = null;
  let seed = 39421;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const mat = (color, options = {}) => { const value = new THREE.MeshStandardMaterial({color,roughness:.78,...options});materials.add(value);return value; };
  const geo = value => {geometries.add(value);return value;};
  const boxGeometry = geo(new THREE.BoxGeometry(1,1,1));
  const sphereGeometry = geo(new THREE.SphereGeometry(1,12,8));
  const cylinderGeometry = geo(new THREE.CylinderGeometry(1,1,1,20));
  const leafGeometry = geo(new THREE.SphereGeometry(1,8,6));
  const roundShape = new THREE.Shape();
  const half=.5,rad=.11;
  roundShape.moveTo(-half+rad,-half);roundShape.lineTo(half-rad,-half);roundShape.quadraticCurveTo(half,-half,half,-half+rad);
  roundShape.lineTo(half,half-rad);roundShape.quadraticCurveTo(half,half,half-rad,half);
  roundShape.lineTo(-half+rad,half);roundShape.quadraticCurveTo(-half,half,-half,half-rad);
  roundShape.lineTo(-half,-half+rad);roundShape.quadraticCurveTo(-half,-half,-half+rad,-half);
  const roundedGeometry=geo(new THREE.ExtrudeGeometry(roundShape,{depth:.84,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.055,bevelThickness:.08,curveSegments:5}));
  roundedGeometry.translate(0,0,-.42);roundedGeometry.computeVertexNormals();

  function canvasTexture(draw,w=512,h=512){
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.anisotropy=4;textures.add(texture);return texture;
  }
  const oakTexture=canvasTexture((ctx,w,h)=>{
    ctx.fillStyle='#af8d62';ctx.fillRect(0,0,w,h);
    for(let row=0;row<8;row++){
      const y=row*64,tone=149+Math.floor(random()*34);ctx.fillStyle=`rgb(${tone+28},${tone+4},${tone-30})`;ctx.fillRect(0,y,w,63);
      ctx.fillStyle='#6b523733';ctx.fillRect(0,y,w,1);
      for(let j=0;j<42;j++){const yy=y+random()*62;ctx.strokeStyle=`rgba(78,48,21,${.03+random()*.075})`;ctx.lineWidth=.4+random()*.5;ctx.beginPath();ctx.moveTo(0,yy);ctx.bezierCurveTo(170,yy+random()*6,340,yy-random()*6,w,yy+random()*3);ctx.stroke();}
      const seam=(row%3)*170+75;ctx.fillStyle='#53473144';ctx.fillRect(seam,y,1,64);
    }
  });oakTexture.repeat.set(2,2);
  const grassTexture=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#596148';ctx.fillRect(0,0,w,h);for(let i=0;i<18000;i++){const v=50+random()*45;ctx.strokeStyle=`rgba(${v},${v+23},${v-13},.55)`;const x=random()*w,y=random()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*2,y-2-random()*5);ctx.stroke();}});grassTexture.repeat.set(3,3);
  const rugTexture=canvasTexture((ctx,w,h)=>{ctx.fillStyle='#c6c2b7';ctx.fillRect(0,0,w,h);for(let i=0;i<180;i++){ctx.strokeStyle=i%3?'#ded9cf44':'#6f756c22';ctx.beginPath();ctx.moveTo(0,i*3);ctx.lineTo(w,i*3);ctx.stroke();}ctx.strokeStyle='#7f817655';ctx.lineWidth=8;ctx.strokeRect(14,14,w-28,h-28);});
  const concrete=mat('#a5a398'), plaster=mat('#e1d9c9'), trim=mat('#f1ecdf');
  const dark=mat('#262c2a',{roughness:.5}), wood=mat('#aa8053',{map:oakTexture}), floorWood=mat('#ffffff',{map:oakTexture});
  const linen=mat('#ddd7c9'), linenLight=mat('#f5eee2'), taupe=mat('#a49e8d'), bronze=mat('#6d5942',{metalness:.65,roughness:.35});
  const green=mat('#536b3e'), plantGreen=mat('#48613b'), olive=mat('#7b8052'), grass=mat('#ffffff',{map:grassTexture});
  const black=mat('#171b1a',{roughness:.45}), white=mat('#d9dfdb',{roughness:.35}), slate=mat('#626966');
  const glass=mat('#90b5ab',{transparent:true,opacity:.2,metalness:.15,roughness:.12,depthWrite:false});
  const screen=mat('#182822',{roughness:.25,emissive:'#30564e',emissiveIntensity:.22});
  const rug=mat('#ffffff',{map:rugTexture});
  function mesh(geometry,material,x,y,z,sx=1,sy=1,sz=1,parent=group,zone=null,device=null){
    const result=new THREE.Mesh(geometry,material);result.position.set(x,y,z);result.scale.set(sx,sy,sz);result.castShadow=true;result.receiveShadow=true;parent.add(result);
    if(zone){result.userData.zone=zone;if(device)result.userData.device=device;pickables.push(result);}return result;
  }
  const box=(x,y,z,w,h,d,m,parent=group,zone=null,device=null)=>mesh(boxGeometry,m,x,y,z,w,h,d,parent,zone,device);
  const round=(x,y,z,w,h,d,m,parent=group,zone=null,device=null)=>mesh(roundedGeometry,m,x,y,z,w,h,d,parent,zone,device);
  const cylinder=(x,y,z,r,h,m,parent=group,zone=null,device=null)=>mesh(cylinderGeometry,m,x,y,z,r,h,r,parent,zone,device);
  const sphere=(x,y,z,rx,ry,rz,m,parent=group)=>mesh(sphereGeometry,m,x,y,z,rx,ry,rz,parent);
  const rooms=[
    {id:'living',name:'ห้องนั่งเล่น',position:new THREE.Vector3(-3.8,.12,2.15),bounds:new THREE.Box3(new THREE.Vector3(-6.65,.05,.05),new THREE.Vector3(-1,.12,4.4))},
    {id:'bedroom',name:'ห้องนอน',position:new THREE.Vector3(-4,.12,-2.3),bounds:new THREE.Box3(new THREE.Vector3(-6.65,.05,-4.6),new THREE.Vector3(-1,.12,-.15))},
    {id:'garage',name:'โรงรถ',position:new THREE.Vector3(4.1,.12,-2.1),bounds:new THREE.Box3(new THREE.Vector3(2.6,.05,-4.6),new THREE.Vector3(6.5,.12,.5))},
    {id:'garden',name:'สวนและทางเดิน',position:new THREE.Vector3(4.7,.12,3.8),bounds:new THREE.Box3(new THREE.Vector3(2.4,.05,.7),new THREE.Vector3(7.3,.12,5.7))},
    {id:'entrance',name:'ทางเข้า',position:new THREE.Vector3(.7,.12,2.75),bounds:new THREE.Box3(new THREE.Vector3(-.85,.05,.3),new THREE.Vector3(2.3,.12,4.4))},
    {id:'control',name:'ศูนย์ควบคุม',position:new THREE.Vector3(.7,.12,-2.1),bounds:new THREE.Box3(new THREE.Vector3(-.85,.05,-4.6),new THREE.Vector3(2.4,.12,.1))},
  ];
  // A raised presentation plinth, open front steps, and separately selectable floors.
  box(0,-.38,.35,15.4,.65,12.4,mat('#555a50'));
  box(0,-.025,.35,15.2,.1,12.2,concrete);
  box(4.85,.04,3.5,5,.12,5.1,grass,group,'garden');
  box(-4,.04,5.2,6,.12,1.4,grass,group,'garden');
  for(const room of rooms){if(room.id==='garden')continue;const b=room.bounds,center=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3());box(center.x,.075,center.z,size.x,.15,size.z,room.id==='garage'?slate:room.id==='entrance'?concrete:floorWood,group,room.id);}
  for(let i=0;i<4;i++)box(.65,-.13-i*.08,4.65+i*.3,3.25,.15,0.31,trim);
  for(let i=0;i<5;i++)box(3.35,.12,1.05+i*.9,1.05,.08,.52,trim,group,'garden');
  for(let i=0;i<6;i++)box(-1.7+i*.57,.07,5.5,.54,.05,.75,concrete);
  const wallPieces=[], interiorLintels=[];
  function wall(x,z,w,d,h=2.8,m=plaster,cutawayHeight=h){
    const piece=box(x,.15+h/2,z,w,h,d,m,highWalls);
    piece.userData.fullHeight=h;piece.userData.cutawayHeight=cutawayHeight;wallPieces.push(piece);
    box(x,.3,z,w,.3,d,m,lowWalls);
    box(x,.22,z,w+.025,.14,d+.025,taupe,highWalls);
    return piece;
  }
  wall(-.1,-4.65,13.5,.22);wall(-6.72,-.15,.22,9.15);
  wall(-1.03,-3.1,.19,3.1,2.8,plaster,1.05);wall(-1.03,-.35,.19,.65,2.8,plaster,1.05);
  // Internal bedroom partition with an open doorway at the circulation spine.
  wall(-4.4,-.1,4.45,.18,2.8,plaster,1.05);wall(-1.45,-.1,.65,.18,2.8,plaster,1.05);
  interiorLintels.push(box(-2.25,2.65,-.1,1,.45,.18,plaster,highWalls));
  wall(2.48,-2.1,.2,5.2,2.8,plaster,1.15);wall(6.62,-2.1,.2,5.2);
  wall(.05,.12,1.55,.18,2.8,plaster,.95);wall(2.1,.12,.75,.18,2.8,plaster,.95);interiorLintels.push(box(1.15,2.65,.12,1.2,.45,.18,plaster,highWalls));
  // Full-height outside panes belong to Exterior mode; the cutaway stays legible.
  for(let i=0;i<4;i++){
    const x=-6.0+i*1.4;box(x,1.5,4.46,1.36,2.65,.045,glass,facade,'living');
    box(x-.69,1.5,4.46,.045,2.8,.065,dark,facade);box(x,2.86,4.46,1.4,.07,.08,dark,facade);
    // Retain a narrow window sill so cutaway still reads as architecture.
    box(x,.3,4.46,1.4,.28,.09,dark);box(x,.45,4.46,1.4,.04,.11,trim);
  }
  // Tall bedroom glazing on the side wall, curtains and slatted oak feature wall.
  box(-6.59,1.65,-2.5,.045,2.1,2.8,glass,group,'bedroom');
  for(const z of [-3.9,-2.5,-1.1])box(-6.55,1.65,z,.075,2.22,.05,dark);
  box(-6.47,2.79,-2.5,.14,.08,3.1,bronze);
  for(let i=0;i<13;i++){const curtain=cylinder(-6.35,1.66,-4+i*.105,.07,2.12,linenLight);curtain.scale.x=.55;}
  for(let i=0;i<9;i++)box(-5.85+i*.18,1.45,-4.49,.065,2.5,.12,wood);
  // Front entry: real door and frame, with no motor or lock implied.
  wall(-.88,3.45,.18,1.8,2.8,plaster,.9);wall(2.39,3.45,.18,1.8,2.8,plaster,.9);
  box(.72,2.72,4.42,3.45,.3,.23,trim,facade);
  box(.7,1.38,4.34,1.2,2.48,.08,wood,facade,'entrance');
  box(1.12,1.4,4.4,.045,.35,.055,bronze,facade);
  box(-.75,1.24,4.35,.22,2.18,.25,plaster);
  box(-.75,1.45,4.52,.09,.18,.09,dark,group,'entrance','doorbell');
  // Garage dark segmented door and cream lintel.
  box(4.55,1.4,-4.49,3.65,2.5,.08,dark,group,'garage');
  for(let i=0;i<11;i++)box(4.55,.3+i*.205,-4.43,3.58,.025,.035,slate);
  // Roof masses create an architectural exterior, not a detached floating lid.
  box(-3.85,3.05,.1,5.95,.28,9.5,trim,roof);box(.78,3.2,-2.2,3.6,.28,5.05,trim,roof);box(4.6,3.01,-2.1,4.25,.27,5.5,concrete,roof);
  box(-3.85,3.22,.1,5.5,.07,9.0,mat('#7b8078'),roof);
  for(let i=0;i<14;i++)box(-.75+i*.23,3.05,2.7,.08,.12,3.85,wood,roof);
  box(-.7,1.55,4.6,.12,3,.12,dark,facade);box(2.3,1.55,4.6,.12,3,.12,dark,facade);

  // Living room: upholstered sectional, separated seat/back cushions and throws.
  round(-5.35,.46,2.5,1.3,.55,2.9,taupe,group,'living');
  round(-5.85,.93,2.5,.38,.78,3.05,linen,group,'living');
  for(let i=0;i<3;i++){round(-5.18,.78,1.48+i*.98,1.15,.22,.91,linenLight,group,'living');const cushion=round(-5.62,1.12,1.5+i*.98,.3,.66,.78,linen);cushion.rotation.z=-.14;}
  round(-4.22,.5,3.66,2.9,.52,1.1,taupe,group,'living');
  for(let i=0;i<2;i++)round(-4.65+i*1.05,.8,3.65,.98,.25,1.02,linenLight,group,'living');
  round(-4.2,1.06,4.02,2.65,.62,.28,linen,group,'living');
  const pillow1=round(-5.4,1.1,1.15,.4,.55,.55,mat('#bd9a68'));pillow1.rotation.x=.3;pillow1.rotation.z=.2;
  const pillow2=round(-3.25,1.1,3.83,.59,.58,.24,mat('#6f806f'));pillow2.rotation.z=-.2;
  box(-3.65,.17,2.05,3.1,.04,2.5,rug,group,'living');
  round(-3.6,.62,2.05,1.55,.14,1.0,wood,group,'living');
  for(const [x,z] of [[-4.2,1.7],[-3,1.7],[-4.2,2.4],[-3,2.4]])cylinder(x,.38,z,.045,.46,bronze);
  box(-3.36,.73,2.07,.48,.06,.34,mat('#8b7561'));box(-3.4,.78,2.08,.46,.04,.3,linenLight);
  cylinder(-3.95,.8,1.9,.14,.22,white);cylinder(-3.95,.92,1.9,.08,.02,dark);
  box(-1.37,.44,1.95,.42,.54,2.85,wood,group,'living');
  box(-1.36,1.53,1.95,.08,1.15,2.1,black,group,'living');
  box(-1.31,1.53,1.95,.015,1.04,1.96,screen,group,'living');
  for(let i=0;i<4;i++)box(-1.13,.4,.92+i*.62,.04,.34,.56,taupe);
  // Subtle wall art, shelves and a thermostat-shaped climate indicator.
  const artwork=new THREE.Group();artwork.position.set(-6.56,1.85,2.6);artwork.rotation.y=Math.PI/2;group.add(artwork);
  box(0,0,0,1.35,.92,.055,bronze,artwork);box(0,0,.035,1.24,.8,.02,mat('#acaa95'),artwork);
  const art=cylinder(0,0,.075,.29,.018,mat('#d9d1b4'),artwork);art.rotation.x=Math.PI/2;
  const climateMaterial=mat('#76847c',{emissive:'#78e4ab',emissiveIntensity:0});
  const climateUnit=new THREE.Group();climateUnit.position.set(-6.5,2.45,1);climateUnit.rotation.y=Math.PI/2;group.add(climateUnit);
  box(0,0,0,1.32,.34,.22,linenLight,climateUnit,'living','climate');
  for(let i=0;i<5;i++)box(0,-.13+i*.025,.12,1.16,.009,.03,slate,climateUnit);
  box(.5,-.01,.13,.04,.035,.025,climateMaterial,climateUnit,'living','climate');

  // Bedroom: bed on low oak plinth, quilted linen and luminous cove strip.
  round(-4.1,.42,-2.35,2.7,.42,3.45,wood,group,'bedroom');
  round(-4.1,.71,-2.25,2.55,.36,3.2,linenLight,group,'bedroom');
  round(-4.1,.93,-1.75,2.62,.16,2.25,mat('#d5c6ad'),group,'bedroom');
  round(-4.1,1.03,-3.27,2.55,.6,.21,taupe,group,'bedroom');
  for(const x of [-4.76,-3.46]){const pillow=round(x,.98,-3.15,1.08,.23,.72,linenLight);pillow.rotation.x=-.1;}
  box(-4.1,1.4,-3.98,2.9,1.68,.18,wood,group,'bedroom');
  for(const x of [-6.0,-2.2]){box(x,.52,-3.45,.8,.75,.77,wood);box(x,.8,-3.06,.68,.035,.02,bronze);}
  box(-1.35,1.49,-2.45,.48,2.65,2.55,taupe,group,'bedroom');
  for(let i=0;i<3;i++){box(-1.08,1.49,-3.25+i*.85,.02,2.55,.8,linen);box(-1.052,1.47,-3.05+i*.85,.025,.34,.025,bronze);}
  round(-4.1,.16,-.53,3.15,.025,.55,rug);

  // Control centre: dual monitors, keyboard and chair on a radial five-star base.
  box(.65,.98,-3.48,2.45,.12,.94,wood,group,'control');
  for(const x of [-.38,1.67])box(x,.57,-3.48,.08,.8,.7,dark);
  for(const x of [.05,1.12]){box(x,1.38,-3.7,.07,.62,.06,bronze);box(x,1.63,-3.72,.98,.65,.065,black,group,'control');box(x,1.63,-3.675,.88,.54,.01,screen);box(x,1.1,-3.55,.3,.025,.25,dark);}
  box(.62,1.062,-3.16,.9,.03,.24,slate);for(let i=0;i<9;i++)box(.24+i*.09,1.085,-3.16,.055,.008,.14,taupe);
  round(1.3,1.07,-3.12,.15,.045,.22,black);
  round(.7,.74,-2.16,.88,.16,.83,slate);round(.7,1.2,-1.86,.9,.85,.15,dark);cylinder(.7,.41,-2.16,.07,.6,bronze);
  for(let i=0;i<5;i++){const leg=box(.7,.2,-2.16,.7,.045,.06,bronze);leg.rotation.y=i*Math.PI*2/5;}
  box(1.95,.61,-3.4,.38,.94,.76,dark,group,'control');
  const oled=box(-.65,1.28,-3.42,.23,.19,.08,screen,group,'control');oled.rotation.y=.28;
  box(.6,.6,-.23,2.3,.9,.44,wood);for(let i=0;i<6;i++)box(-.25+i*.3,.75,-.005,.12,.49,.05,mat(['#788779','#b3a38c','#bcb6a4'][i%3]));

  const lampMaterials={living:mat('#ded4b5',{emissive:'#ffbf71',emissiveIntensity:0}),rgb:mat('#d7d0bf',{emissive:'#29d6ab',emissiveIntensity:0}),outdoor:mat('#e0d9c0',{emissive:'#ffd58c',emissiveIntensity:0})};
  const lights={living:[],rgb:[],outdoor:[]};
  function lamp(x,z,kind,height=1.8){
    cylinder(x,.2,z,.17,.08,bronze);cylinder(x,height/2+.15,z,.025,height-.2,bronze);
    const shade=mesh(geo(new THREE.CylinderGeometry(.22,.34,.42,24,1,true)),linenLight,x,height,z,1,1,1,group,kind==='rgb'?'bedroom':kind==='outdoor'?'garden':'living',kind==='rgb'?'rgb':kind==='outdoor'?'outdoor':'living');
    cylinder(x,height-.12,z,.19,.06,lampMaterials[kind],group,kind==='rgb'?'bedroom':'living',kind==='rgb'?'rgb':'living');
    const light=new THREE.PointLight(kind==='rgb'?'#29d6ab':'#ffd69a',0,5.5,2);light.position.set(x,height-.1,z);group.add(light);lights[kind].push(light);return shade;
  }
  lamp(-5.9,.6,'living',2.05);lamp(-2.15,3.9,'living',1.65);lamp(-6,-3.45,'rgb',1.2);lamp(-2.2,-3.45,'rgb',1.2);
  box(-4.1,1.73,-3.87,2.6,.035,.025,lampMaterials.rgb,group,'bedroom','rgb');
  const lampPositions=[[-6.65,5.4],[-2.2,5.2],[2.5,5.4],[4.55,4.75],[6.7,2.2],[6.85,-.3]];
  for(const [x,z] of lampPositions){cylinder(x,.42,z,.105,.66,dark);cylinder(x,.76,z,.14,.16,lampMaterials.outdoor,group,'garden','outdoor');cylinder(x,.87,z,.17,.07,dark);}
  for(const [x,z] of [[2.7,4.5],[6.35,1.9]]){const light=new THREE.PointLight('#ffd58c',0,6,2);light.position.set(x,.85,z);group.add(light);lights.outdoor.push(light);}
  // Lamps in the entry are part of the outdoor-light circuit.
  for(const x of [-.75,2.39]){const y=x<0?1.91:.66;box(x,y,4.35,.14,.38,.12,dark);box(x,y-.01,4.43,.09,.27,.035,lampMaterials.outdoor,group,'entrance','outdoor');}

  // Landscape: individual broad leaves are instanced in one draw call.
  const leaves=[];
  function plant(x,z,size=1,indoor=false){
    if(indoor){const pot=mesh(geo(new THREE.CylinderGeometry(.24,.17,.4,18)),mat('#b7b3a2'),x,.35,z,size,size,size);cylinder(x,.56*size,z,.18*size,.025,dark);}
    const height=(indoor?.62:.7)*size;
    cylinder(x,height/2+.17,z,.045*size,height,bronze);
    for(let i=0;i<9;i++){const a=i*2.399,reach=(.2+random()*.25)*size;leaves.push({position:new THREE.Vector3(x+Math.sin(a)*reach,.4+height*.5+random()*height*.65,z+Math.cos(a)*reach),scale:new THREE.Vector3(.12*size,.32*size,.06*size),rotation:new THREE.Euler(Math.sin(a)*.7,a,Math.cos(a)*.7)});}
  }
  plant(-6.1,.3,1.2,true);plant(-1.65,3.9,.9,true);plant(1.8,-.65,.9,true);plant(.1,-3.65,.45,true);plant(-6.1,-.7,.75,true);
  function tree(x,z,size=1){
    cylinder(x,.85*size,z,.075*size,1.7*size,wood);
    for(let i=0;i<16;i++){const a=random()*Math.PI*2,r=random()*.6*size;leaves.push({position:new THREE.Vector3(x+Math.cos(a)*r,1.7*size+random()*.85*size,z+Math.sin(a)*r),scale:new THREE.Vector3((.3+random()*.25)*size,(.35+random()*.4)*size,(.3+random()*.25)*size),rotation:new THREE.Euler(0,a,.3)});}
  }
  tree(6.7,4.8,1.1);tree(6.9,.85,.85);tree(-7.05,-3.4,1.15);tree(-6.9,4.9,.8);
  for(let i=0;i<9;i++){const x=3.9+i*.37;plant(x,5.55,.55);}
  for(let i=0;i<10;i++)plant(7.0,-4.1+i*.7,.55);
  for(let i=0;i<8;i++)plant(-6.15+i*.53,5.55,.45);
  for(const [x,z,s] of [[4.6,1.3,.6],[5.8,2.7,.9],[4.6,4.3,.6],[5.8,5.2,.6]]){
    sphere(x,.35,z,.5*s,.3*s,.45*s,green);sphere(x+.32,.4,z+.2,.4*s,.4*s,.4*s,olive);
    for(let i=0;i<3;i++)sphere(x-.3+random()*.7,.16,z-.35-random()*.25,.17,.1,.13,concrete);
  }
  const foliage=new THREE.InstancedMesh(leafGeometry,plantGreen,leaves.length);foliage.castShadow=true;foliage.receiveShadow=true;const dummy=new THREE.Object3D();
  leaves.forEach((leaf,i)=>{dummy.position.copy(leaf.position);dummy.scale.copy(leaf.scale);dummy.rotation.copy(leaf.rotation);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);foliage.setColorAt(i,new THREE.Color().setHSL(.22+random()*.06,.22+random()*.2,.2+random()*.15));});foliage.instanceMatrix.needsUpdate=true;foliage.computeBoundingSphere();group.add(foliage);

  // Compact car is a real geometric asset, shown only when the IR reports parking.
  const car=new THREE.Group();car.position.set(4.45,.2,-1.65);group.add(car);car.name='IR-reported vehicle';
  round(0,.55,0,1.85,.55,3.45,white,car,'garage');round(0,.95,-.1,1.6,.65,1.9,white,car,'garage');
  const windshield=box(0,1.12,.88,1.42,.54,.045,mat('#3c5552',{metalness:.35,roughness:.15}),car);windshield.rotation.x=-.35;
  const rearGlass=box(0,1.12,-1.05,1.4,.45,.045,glass,car);rearGlass.rotation.x=.3;
  for(const x of [-.82,.82]){box(x,1.1,-.12,.035,.42,1.54,glass,car);box(x,1.1,-.15,.04,.45,.055,dark,car);box(x,.78,.17,.025,.045,.25,bronze,car);}
  for(const x of [-.91,.91])for(const z of [-1.12,1.12]){const tire=cylinder(x,.37,z,.34,.17,black,car);tire.rotation.z=Math.PI/2;const rim=cylinder(x*1.05,.37,z,.22,.18,slate,car);rim.rotation.z=Math.PI/2;}
  for(const x of [-.63,.63]){box(x,.66,1.71,.4,.13,.035,linenLight,car);box(x,.67,-1.71,.43,.08,.025,mat('#9d342e'),car);}
  box(0,.46,1.735,.83,.14,.035,dark,car);box(0,.61,1.76,.33,.1,.02,linenLight,car);
  box(0,.56,-1.74,.34,.12,.025,linenLight,car);
  // Motion and security indicators are minimal device overlays, never fake sensors.
  const motionMaterial=mat('#78e4ab',{emissive:'#78e4ab',emissiveIntensity:1.2,transparent:true,opacity:.6});
  const motion=mesh(geo(new THREE.TorusGeometry(.34,.025,8,28)),motionMaterial,-3.6,.22,1.2);motion.rotation.x=-Math.PI/2;motion.visible=false;
  const alarmMaterial=mat('#f08d8d',{emissive:'#ff4b45',emissiveIntensity:0});
  box(.65,2.38,-4.48,.16,.22,.12,alarmMaterial,group,'control','alarm');
  const livingSpot=sphere(-6.56,2.65,.3,.09,.09,.07,mat('#dfe9dc'));livingSpot.userData.zone='living';pickables.push(livingSpot);

  function update(state){
    currentState=state;
    const devices=state?.devices||{},sensors=state?.sensors||{};
    const living=Boolean(devices.living?.on),outdoor=Boolean(devices.outdoor?.on),rgbOn=Boolean(devices.rgb?.on);
    const brightness=Math.max(0,Math.min(1,Number(devices.rgb?.brightness??0)/100));
    const rgbColor=/^#[0-9a-f]{6}$/i.test(devices.rgb?.color||'')?devices.rgb.color:'#78e4ab';
    lampMaterials.living.emissiveIntensity=living?2.4:0;lampMaterials.outdoor.emissiveIntensity=outdoor?3:0;
    lampMaterials.rgb.emissive.set(rgbColor);lampMaterials.rgb.emissiveIntensity=rgbOn?brightness*2.4:0;
    lights.living.forEach(light=>light.intensity=living?(night?7:5):0);
    lights.outdoor.forEach(light=>light.intensity=outdoor?(night?5:3):0);
    lights.rgb.forEach(light=>{light.color.set(rgbColor);light.intensity=rgbOn?brightness*(night?7:5):0;});
    car.visible=Boolean(sensors.parking);motion.visible=Boolean(sensors.motion);
    climateMaterial.emissiveIntensity=devices.climate?.on?2:0;
    alarmMaterial.emissiveIntensity=devices.alarm?.on?2.5:0;
    group.userData.deviceState={living, rgb:rgbOn, brightness, color:rgbColor, outdoor, parking:car.visible,motion:motion.visible,climate:Boolean(devices.climate?.on),alarm:Boolean(devices.alarm?.on)};
  }
  function setView(view){
    const exterior=view==='exterior',floor=view==='floor';roof.visible=exterior;facade.visible=exterior;highWalls.visible=!floor;lowWalls.visible=floor;
    for(const piece of wallPieces){const h=view==='cutaway'?piece.userData.cutawayHeight:piece.userData.fullHeight;piece.scale.y=h;piece.position.y=.15+h/2;}
    for(const lintel of interiorLintels)lintel.visible=exterior;
    group.userData.view=view;
  }
  function setDayNight(value){night=Boolean(value);if(currentState)update(currentState);}
  function dispose(){group.traverse(object=>{if(object.isInstancedMesh)object.dispose();});geometries.forEach(value=>value.dispose());materials.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());group.clear();pickables.length=0;}
  setView('cutaway');update({devices:{},sensors:{}});
  group.updateMatrixWorld(true);
  return {group,rooms,pickables,update,setView,setDayNight,dispose};
}
