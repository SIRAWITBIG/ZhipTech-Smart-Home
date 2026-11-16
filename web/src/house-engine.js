import * as THREE from '/vendor/three/three.module.js';
import {OrbitControls} from '/vendor/three/OrbitControls.js';
import {createHouseModel} from './house-model.js';
import {icon} from './icons.js';

export function createHouseView({onZone,onDevice}){
  const element=document.createElement('div');element.className='digital-twin';
  element.innerHTML=`<div class="twin-tools"><div class="twin-view-switch" role="group" aria-label="มุมมองบ้าน"><button data-view="cutaway" class="active">เปิดหลังคา</button><button data-view="exterior">ภายนอก</button><button data-view="floor">แปลนพื้น</button></div><div class="twin-display-tools"><button class="twin-tool" data-twin="daynight" aria-label="เปลี่ยนกลางวันกลางคืน" title="กลางวัน / กลางคืน">${icon('moon')}</button><select aria-label="คุณภาพ 3D" class="twin-quality"><option value="low">ต่ำ</option><option value="medium" selected>กลาง</option><option value="high">สูง</option></select><button class="twin-tool" data-twin="fullscreen" aria-label="เต็มจอ" title="เต็มจอ">${icon('monitor')}</button></div></div><div class="twin-stage"><canvas tabindex="0" aria-label="บ้านสามมิติ ลากเพื่อหมุน ใช้ปุ่มลูกศรหมุน ปุ่มบวกลบซูม และ Home คืนมุมมอง"></canvas><div class="twin-hotspots"></div><div class="twin-mood"><i></i><span>DAYLIGHT</span></div><div class="twin-camera-tools"><button data-twin="zoom-in" aria-label="ซูมเข้า">${icon('plus')}</button><button data-twin="zoom-out" aria-label="ซูมออก"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 12h14"/></svg></button><button data-twin="reset" aria-label="คืนมุมมองบ้าน">${icon('refresh')}</button></div><div class="twin-error" role="status" hidden></div></div><div class="twin-footer"><span>${icon('motion')} ลากหมุน · เลื่อนซูม · คลิกขวาลากเพื่อเลื่อน</span><span class="twin-state-label">สถานะบ้านจากระบบ</span></div>`;
  const canvas=element.querySelector('canvas'),stage=element.querySelector('.twin-stage');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,160);
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=9;controls.maxDistance=45;controls.maxPolarAngle=Math.PI*.485;controls.minPolarAngle=.08;controls.target.set(0,.6,0);
  camera.position.set(13,18,17);
  const hemisphere=new THREE.HemisphereLight(0xeaf0ff,0x6e6651,2.1);scene.add(hemisphere);
  const sun=new THREE.DirectionalLight(0xffedce,4.2);sun.position.set(-7,15,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-13;sun.shadow.camera.near=.5;sun.shadow.camera.far=45;sun.shadow.bias=-.0004;sun.shadow.normalBias=.035;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xbfd8e3,1.0);fill.position.set(9,7,-6);scene.add(fill);
  const model=createHouseModel();scene.add(model.group);
  const selectedMat=new THREE.LineBasicMaterial({color:0x7cf1bc,transparent:true,opacity:.95,depthTest:false});
  let outline=new THREE.LineLoop(new THREE.BufferGeometry(),selectedMat);outline.renderOrder=5;scene.add(outline);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const labels=model.rooms.map(room=>{const button=document.createElement('button');button.className='twin-hotspot';button.dataset.room=room.id;button.innerHTML=`<i></i><span>${room.name}</span>`;button.setAttribute('aria-label',`เลือก${room.name}ในบ้าน 3D`);button.addEventListener('click',()=>{selectRoom(room.id,true);onZone?.(room.id);});element.querySelector('.twin-hotspots').append(button);return {room,button};});
  let raf=0,disposed=false,visible=true,tween=null,view='cutaway',night=false,selected='',lastState=null,pointerDown=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function requestRender(){if(!raf&&!disposed&&visible&&!document.hidden&&element.isConnected)raf=requestAnimationFrame(render);}
  function render(time){raf=0;if(disposed||!visible||document.hidden)return;
    if(tween){const t=Math.min(1,(time-tween.start)/tween.duration),ease=1-(1-t)**3;camera.position.lerpVectors(tween.from,tween.to,ease);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,ease);if(t===1)tween=null;}
    controls.update();renderer.render(scene,camera);
    const w=stage.clientWidth,h=stage.clientHeight;
    for(const {room,button} of labels){const p=room.position.clone().project(camera);const show=p.z<1&&p.z>-1&&Math.abs(p.x)<.97&&Math.abs(p.y)<.96&&(w>540||selected===room.id);button.hidden=!show;if(show){button.style.left=`${(p.x*.5+.5)*w}px`;button.style.top=`${(-p.y*.5+.5)*h}px`;}}
    if(tween)requestRender();
  }
  function transition(position,target){if(reduced.matches){camera.position.copy(position);controls.target.copy(target);controls.update();}else tween={from:camera.position.clone(),to:position.clone(),targetFrom:controls.target.clone(),targetTo:target.clone(),start:performance.now(),duration:650};requestRender();}
  function selectRoom(id,focus=false){const room=model.rooms.find(x=>x.id===id);if(!room)return;selected=id;
    for(const x of labels){x.button.classList.toggle('selected',x.room.id===id);x.button.setAttribute('aria-pressed',String(x.room.id===id));}
    const b=room.bounds; if(b){const y=.2;const min=b.min,max=b.max;const points=[new THREE.Vector3(min.x,y,min.z),new THREE.Vector3(max.x,y,min.z),new THREE.Vector3(max.x,y,max.z),new THREE.Vector3(min.x,y,max.z)];outline.geometry.dispose();outline.geometry=new THREE.BufferGeometry().setFromPoints(points);}
    if(focus){const center=room.position.clone();center.y=.5;const offset=camera.position.clone().sub(controls.target).normalize().multiplyScalar(view==='floor'?19:20);transition(center.clone().add(offset),center);}
    requestRender();
  }
  function reset(){transition(new THREE.Vector3(13,18,17),new THREE.Vector3(0,0,0));}
  function zoom(factor){const off=camera.position.clone().sub(controls.target);off.setLength(THREE.MathUtils.clamp(off.length()*factor,controls.minDistance,controls.maxDistance));transition(controls.target.clone().add(off),controls.target);}
  function setView(value){view=value;model.setView(view);element.dataset.view=view;for(const b of element.querySelectorAll('[data-view]')){b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view));}if(view==='floor')transition(new THREE.Vector3(0,27,.05),new THREE.Vector3(0,0,0));else reset();requestRender();}
  function setNight(value){night=value;element.dataset.night=String(night);hemisphere.intensity=night?.75:2.1;sun.intensity=night?.8:4.2;fill.intensity=night?.45:1;renderer.toneMappingExposure=night?1.35:1.15;model.setDayNight(night);element.querySelector('.twin-mood span').textContent=night?'NIGHT VIEW':'DAYLIGHT';element.querySelector('[data-twin="daynight"]').innerHTML=icon(night?'sun':'moon');element.querySelector('[data-twin="daynight"]').setAttribute('aria-pressed',String(night));requestRender();}
  async function fullscreen(){try{if(document.fullscreenElement===element)await document.exitFullscreen();else if(element.requestFullscreen)await element.requestFullscreen();else element.classList.toggle('twin-expanded');resize();}catch{element.classList.toggle('twin-expanded');resize();}}
  element.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;event.stopPropagation();if(button.dataset.view)setView(button.dataset.view);switch(button.dataset.twin){case 'daynight':setNight(!night);break;case 'zoom-in':zoom(.82);break;case 'zoom-out':zoom(1.22);break;case 'reset':reset();break;case 'fullscreen':fullscreen();break;}});
  element.querySelector('.twin-quality').addEventListener('change',event=>{const q=event.target.value;renderer.setPixelRatio(Math.min(devicePixelRatio,q==='low'?1:q==='high'?2:1.5));renderer.shadowMap.enabled=q!=='low';const size=q==='high'?2048:1024;sun.shadow.mapSize.set(size,size);sun.shadow.map?.dispose();sun.shadow.map=null;resize();});
  canvas.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX,y:e.clientY};tween=null;});
  canvas.addEventListener('pointerup',e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)>5)return;pointerDown=null;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(model.pickables,true).find(x=>{let o=x.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});if(hit){let item=hit.object;while(item&&!item.userData.zone)item=item.parent;if(item){selectRoom(item.userData.zone,true);onZone?.(item.userData.zone);if(item.userData.device)onDevice?.(item.userData.device,item.userData.zone);}}});
  canvas.addEventListener('keydown',event=>{if(['+','=','-','Home','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(event.key==='Home')reset();else if(event.key==='+'||event.key==='=')zoom(.85);else if(event.key==='-')zoom(1.15);else{const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);s.theta+=event.key==='ArrowLeft'?.16:event.key==='ArrowRight'?-.16:0;s.phi=THREE.MathUtils.clamp(s.phi+(event.key==='ArrowUp'?-.12:event.key==='ArrowDown'?.12:0),.08,Math.PI*.485);transition(controls.target.clone().add(new THREE.Vector3().setFromSpherical(s)),controls.target);}}});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(raf);raf=0;const box=element.querySelector('.twin-error');box.hidden=false;box.textContent='การแสดงผล 3D หยุดชั่วคราว รีเฟรชหน้าเพื่อเปิดใหม่ — ใช้ปุ่มเลือกห้องและควบคุมอุปกรณ์ต่อได้';});
  controls.addEventListener('change',requestRender);controls.addEventListener('start',()=>{tween=null;});
  function resize(){if(disposed||!element.isConnected)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=Math.min(58,32*Math.max(1,1.45/camera.aspect));camera.updateProjectionMatrix();requestRender();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible)requestRender();else{cancelAnimationFrame(raf);raf=0;}});observer.observe(element);
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else requestRender();}document.addEventListener('visibilitychange',visibility);
  function fullscreenChanged(){resize();}document.addEventListener('fullscreenchange',fullscreenChanged);
  function update(state,zone){if(disposed||!state)return;lastState=state;model.update(state);if(zone!==selected)selectRoom(zone);element.querySelector('.twin-state-label').textContent=state.mode==='simulation'?'ข้อมูลจำลอง':state.connected?'สถานะจาก ESP32':'สถานะล่าสุด · ออฟไลน์';element.dataset.scene=state.scene;element.dataset.parking=String(state.sensors.parking);element.dataset.living=String(state.devices.living.on);element.dataset.rgb=state.devices.rgb.color;element.dataset.alarm=String(state.security.alarm);requestRender();}
  function dispose(){disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('fullscreenchange',fullscreenChanged);controls.dispose();model.dispose();outline.geometry.dispose();selectedMat.dispose();renderer.dispose();renderer.forceContextLoss();element.remove();}
  setView('cutaway');setNight(true);
  return {element,update,resize,dispose};
}
