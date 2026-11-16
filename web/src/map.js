import { icon } from './icons.js';
export const zones = [
  {id:'living',name:'ห้องนั่งเล่น',en:'Living Room',icon:'home',x:25,y:190,w:300,h:235},
  {id:'bedroom',name:'ห้องนอน',en:'Bedroom',icon:'bed',x:25,y:25,w:300,h:150},
  {id:'garage',name:'โรงรถ',en:'Garage',icon:'car',x:340,y:25,w:250,h:210},
  {id:'garden',name:'สวน',en:'Garden',icon:'garden',x:20,y:445,w:590,h:75},
  {id:'entrance',name:'ทางเข้า',en:'Entrance',icon:'door',x:500,y:250,w:90,h:175},
  {id:'control',name:'ศูนย์ควบคุม',en:'Control Center',icon:'chip',x:340,y:250,w:145,h:175},
];
const p=(x,y,z=0)=>[440+x*.78-y*.68,66+x*.31+y*.43-z];
const points=(a)=>a.map(v=>p(...v).join(',')).join(' ');
const polygon=(a,fill,stroke='none',extra='')=>`<polygon points="${points(a)}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const rect=(x,y,w,h,fill,stroke='none',extra='')=>polygon([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill,stroke,extra);
const box=(x,y,w,h,z,fill,side='#504c43')=>polygon([[x,y,0],[x+w,y,0],[x+w,y,z],[x,y,z]],side)+polygon([[x+w,y,0],[x+w,y+h,0],[x+w,y+h,z],[x+w,y,z]],side)+polygon([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],fill);
const wall=(x,y,w,h)=>box(x,y,w,h,32,'#a7a294','#77796d');
const tree=(x,y,r=17)=>{const [cx,cy]=p(x,y);return `<path d="M${cx} ${cy}v-20" stroke="#807c60" stroke-width="4"/><circle cx="${cx}" cy="${cy-27}" r="${r}" fill="#496548"/><circle cx="${cx-5}" cy="${cy-32}" r="${r*.65}" fill="#668360"/>`;};
export function homeMap(state,selected='living',large=false) {
  const d=state.devices,s=state.sensors;
  const floor=zones.map(z=>rect(z.x,z.y,z.w,z.h,z.id==='garden'?'#46513c':z.id===selected?'#5d7662':z.id==='garage'?'#64675e':'#827d6f','#ada897','stroke-width="1"')).join('');
  const boards=Array.from({length:23},(_,i)=>{const [x1,y1]=p(27,35+i*17),[x2,y2]=p(325,35+i*17);return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#aaa18a" stroke-width=".6" opacity=".35"/>`;}).join('');
  const furniture=box(48,215,43,155,19,'#bbb3a2')+box(53,220,32,65,30,'#d3cbb9')+box(53,292,32,70,30,'#d3cbb9')+box(92,375,125,37,27,'#d3cbb9')+box(128,266,85,73,13,'#b3a38a')+rect(140,280,58,46,'#8f826e')+box(285,233,13,143,32,'#414b43')+box(280,250,15,100,58,'#272d29')+box(70,54,148,103,18,'#b3a38c')+box(75,58,137,92,26,'#e4dcc5')+rect(82,65,35,72,'#c5c0aa')+rect(125,65,76,72,'#abb4a2')+box(260,52,42,40,25,'#a7997e')+box(356,271,110,40,23,'#b4a285')+box(382,275,55,8,58,'#26372f')+rect(388,274,43,4,'#78e4ab')+box(390,338,50,40,22,'#445047')+box(370,371,25,38,23,'#242e28')+box(410,371,25,38,23,'#242e28');
  const car=box(408,67,118,133,23,s.parking?'#adc6b6':'#66695f')+box(421,90,92,64,43,s.parking?'#c8d4c8':'#74786e')+rect(425,93,83,25,'#41594e')+rect(425,132,83,20,'#41594e');
  const walls=wall(18,17,580,8)+wall(18,17,8,412)+wall(328,17,8,158)+wall(18,179,240,8)+wall(328,245,8,180)+wall(340,237,250,8)+wall(489,248,8,177)+wall(594,17,8,412)+wall(18,429,215,8)+wall(290,429,310,8);
  const light=(x,y,on,color='#a6efba')=>{const [cx,cy]=p(x,y,22);return `<circle cx="${cx}" cy="${cy}" r="10" fill="${on?color:'#7b8379'}" opacity=".15"/><circle cx="${cx}" cy="${cy}" r="4" fill="${on?color:'#7b8379'}" stroke="#e0e6d7" stroke-width="1.5"/>`;};
  const labels=zones.map(z=>{const [cx,cy]=p(z.x+z.w*.53,z.y+z.h*.58,8);return `<g class="map-zone ${selected===z.id?'selected':''}" role="button" tabindex="0" aria-label="เลือก${z.name}" data-zone="${z.id}"><polygon points="${points([[z.x,z.y],[z.x+z.w,z.y],[z.x+z.w,z.y+z.h],[z.x,z.y+z.h]])}" fill="transparent" stroke="${selected===z.id?'#90f0b8':'transparent'}" stroke-width="2.5"/><rect x="${cx-55}" y="${cy-12}" width="110" height="38" rx="8" class="map-label-bg"/><text x="${cx}" y="${cy+3}" text-anchor="middle" class="map-label">${z.name}</text><text x="${cx}" y="${cy+17}" text-anchor="middle" class="map-sublabel">${z.en}</text></g>`;}).join('');
  return `<div class="house-map ${large?'large':''}"><svg viewBox="0 0 1000 555" role="group" aria-label="แผนผังบ้านจำลอง 6 โซน คลิกห้องเพื่อควบคุม"><defs><radialGradient id="mapAura"><stop stop-color="#78e4ab" stop-opacity=".08"/><stop offset="1" stop-color="#78e4ab" stop-opacity="0"/></radialGradient></defs><ellipse cx="505" cy="350" rx="450" ry="210" fill="url(#mapAura)"/>${rect(-4,5,630,540,'#121713')}${box(5,10,610,520,10,'#626b59','#3d443a')}${floor}${boards}${rect(505,438,65,82,'#a7a292')}${Array.from({length:5},(_,i)=>rect(505,449+i*13,65,2,'#d1c8b1')).join('')}${furniture}${car}${walls}${tree(38,467,16)}${tree(113,486,14)}${tree(200,484,18)}${tree(280,487,14)}${tree(373,484,16)}${tree(575,482,17)}${tree(560,266,14)}${tree(41,200,15)}${light(248,360,d.living.on)}${light(255,100,d.rgb.on,d.rgb.color)}${light(440,213,s.parking)}${light(560,462,d.outdoor.on)}${light(415,290,state.connected)}${labels}</svg><div class="map-legend"><span><i class="dot"></i> อุปกรณ์ทำงาน</span><span>คลิกห้องเพื่อควบคุม ${icon('arrow')}</span></div></div>`;
}
