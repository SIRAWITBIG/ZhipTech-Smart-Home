import {createSimulationProvider,createLiveProvider} from './provider.js';
import {icon} from './icons.js';
import {routes,renderPage,pageHeadings,sceneInfo} from './pages.js';
import {escapeHtml as esc,deviceNames,newestEvents,activity} from './components.js';
import {mountHouseView,updateHouseView,detachHouseView,disposeHouseView} from './house-view.js';
import {isLocalHost} from './connection-policy.js';

const app=document.querySelector('#app'),modal=document.querySelector('#modal');
const readStorage=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
const saveStorage=(key,value)=>{try{localStorage.setItem(key,value);}catch{/* Runtime remains usable without storage. */}};
const localLiveAllowed=isLocalHost(location.hostname);
let mode=readStorage('hub.mode','simulation');
if(!['live','simulation'].includes(mode))mode='simulation';
if(!localLiveAllowed){mode='simulation';saveStorage('hub.mode','simulation');}
let storedBaseUrl=readStorage('hub.baseUrl',''),provider;
try{provider=mode==='live'?createLiveProvider({baseUrl:storedBaseUrl}):createSimulationProvider();}
catch{storedBaseUrl='';provider=mode==='live'&&localLiveAllowed?createLiveProvider():createSimulationProvider();saveStorage('hub.baseUrl','');}
let state=null,busy=false,online=false,error='',initial=true,polling=null,epoch=0,renderPending=false;
const storedTheme=readStorage('hub.theme','dark');
const context={zone:'living',chartKey:'temperature',historyRange:'all',search:'',logFilter:'all',theme:['dark','light','system'].includes(storedTheme)?storedTheme:'dark',baseUrl:storedBaseUrl,apiKey:'',localLiveAllowed};
const drafts=new Map();
function captureDraft(form){
 if(!form||!['settings-form','connection-form','simulation-form'].includes(form.id))return;
 drafts.set(form.id,[...form.elements].filter(el=>el.name).map(el=>({name:el.name,value:el.value,checked:el.checked,type:el.type})));
}
function restoreDrafts(){for(const [id,values] of drafts){const form=document.getElementById(id);if(!form)continue;for(const saved of values){const el=form.elements.namedItem(saved.name);if(!el)continue;if(saved.type==='checkbox')el.checked=saved.checked;else el.value=saved.value;}}}
function mayRender(){const active=document.activeElement;return !modal.open&&![...drafts.keys()].some(id=>document.getElementById(id))&&(!active||active===document.body||active===document.documentElement||active.id==='main');}
function renderWhenIdle(force=false){if(force||mayRender())render();else renderPending=true;}
function current(ticket,source){return ticket===epoch&&source===provider;}
function connectionError(err){if(['OFFLINE','TIMEOUT','INVALID_RESPONSE'].includes(err.code)){online=false;error=err.message;}}
const route=()=>routes.some(r=>r[0]===location.hash.slice(1))?location.hash.slice(1):'dashboard';
function theme(){document.documentElement.dataset.theme=context.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):context.theme;}
theme(); matchMedia('(prefers-color-scheme: dark)').addEventListener('change',theme);
function toast(message,isError=false){const el=document.querySelector('#toast');el.textContent=message;el.classList.toggle('error',isError);el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),4000);}
const connectionForm=()=>`<form id="connection-form" class="connection-recovery"><label class="field">แหล่งข้อมูล<select name="mode"><option value="simulation">Simulation · ข้อมูลจำลอง</option><option value="live" ${!localLiveAllowed?'disabled':''} ${mode==='live'?'selected':''}>Local Live · อุปกรณ์จริง</option><option value="cloud" disabled>Cloud Live · ยังไม่ได้ตั้งค่า Backend</option></select>${!localLiveAllowed?'<small>Local Live ใช้ได้เฉพาะเว็บที่เปิดจากเครือข่ายภายใน</small>':''}</label><label class="field">API Base URL<input name="baseUrl" type="url" placeholder="ว่างไว้เพื่อใช้ same-origin" value="${esc(context.baseUrl)}"></label><label class="field">API Key<input name="apiKey" type="password" autocomplete="off" placeholder="ใช้เฉพาะรอบการทำงานนี้"></label><button class="button primary">ใช้การเชื่อมต่อนี้</button></form>`;
function render(){
 renderPending=false;
 const r=route(),title=routes.find(x=>x[0]===r)?.[1],head=pageHeadings[r];
 document.title=`${title} · ZhipTech - Smart Home`;
 const status=initial?'กำลังเชื่อมต่อ':online?(mode==='simulation'?'ข้อมูลจำลอง':'ESP32 เชื่อมต่อแล้ว'):'ออฟไลน์';
 if(['dashboard','map'].includes(r)&&state)detachHouseView();else disposeHouseView();
 app.innerHTML=`<div class="app-shell"><aside class="sidebar" id="sidebar"><a class="brand" href="#dashboard" aria-label="ZhipTech - Smart Home"><img src="/brand/zhiptech-smart-home.png" alt="ZhipTech - Smart Home" width="648" height="216"></a><span class="nav-caption">พื้นที่ของคุณ</span><nav aria-label="เมนูหลัก">${routes.map(([id,name,i])=>`<a href="#${id}" class="nav-item ${r===id?'active':''}" ${r===id?'aria-current="page"':''}>${icon(i)}<span>${name}</span>${r===id?'<i></i>':''}</a>`).join('')}</nav><div class="sidebar-bottom"><div class="hub-device">${icon('chip')}<div><strong>ESP32 Dev Module</strong><span>${mode==='simulation'?'โหมดจำลองอุปกรณ์':online?'เชื่อมต่อภายในเครือข่าย':'รอการเชื่อมต่อ'}</span></div><i class="dot ${online?'':'muted'}"></i></div><div class="sidebar-footer"><small>ZhipTech - Smart Home · 1.0.0-dev</small></div></div></aside><button class="nav-backdrop" aria-label="ปิดเมนู" data-action="menu"></button><div class="workspace"><header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-menu" data-action="menu" aria-label="เปิดเมนู">${icon('grid')}</button><span>บ้านของฉัน</span>${icon('chevron')}<strong>${title}</strong></div><div class="topbar-actions"><button class="icon-button notifications-toggle" data-action="notifications" aria-label="ศูนย์การแจ้งเตือน">${icon('bell')}${state?.security.acknowledged===false?'<i class="notification-dot"></i>':''}</button><span class="today">${new Date().toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'})}</span><span class="connection-badge ${online?'':'offline'}"><i class="dot ${online?'':'muted'}"></i>${status}</span><button class="icon-button theme-toggle" aria-label="เปลี่ยนธีม" data-action="theme">${icon(document.documentElement.dataset.theme==='dark'?'moon':'sun')}</button></div></header><main id="main" tabindex="-1"><div class="page-heading"><div><h1>${head[0]}</h1><p>${head[1]}</p></div>${mode==='simulation'?`<button class="button primary" data-action="simulate">${icon('automation')} ทดลองสถานการณ์</button>`:`<button class="button" data-action="retry">${icon('refresh')} รีเฟรช</button>`}</div>${mode==='simulation'?'<div class="simulation-notice"><i class="dot"></i><span>Simulation Mode <span class="notice-divider">/</span> ข้อมูลและการควบคุมทั้งหมดเป็นการจำลอง</span></div>':''}${error?`<div class="alert-banner" role="alert">${icon('wifi')}<div><strong>ไม่สามารถรับสถานะล่าสุดได้</strong><span>${esc(error)}${state?' · ข้อมูลด้านล่างเป็นสถานะเก่าล่าสุด':''}</span></div><button class="button" data-action="retry">ลองใหม่</button></div>`:''}${state?.sensors.error?`<div class="alert-banner warning">${icon('chip')}<div><strong>Sensor Error</strong><span>อ่านข้อมูลสภาพแวดล้อมไม่ได้ ระบบปรับอากาศอัตโนมัติใช้สถานะปลอดภัย</span></div></div>`:''}${state?.mode==='live'&&state.capabilities?.hardwareEnabled===false?'<div class="alert-banner warning"><strong>ปิดเอาต์พุตฮาร์ดแวร์ — ยังไม่ยืนยันวงจร</strong><span>สถานะคำสั่งในเฟิร์มแวร์ยังไม่ได้ขับ GPIO จริง</span></div>':''}${(state?.security.alarm||state?.security.acknowledged===false)?`<div class="alert-banner danger" role="alert">${icon('bell')}<div><strong>${state.security.alarm?'ตรวจพบการเคลื่อนไหวขณะเฝ้าระวัง':'มีเหตุการณ์ที่ยังไม่ได้รับทราบ'}</strong><span>${!state.security.alarm?'เสียงเตือนสิ้นสุดแล้ว โปรดตรวจสอบและรับทราบเหตุการณ์':state.security.muted?'เสียงเตือนถูกปิดแล้ว':'ตรวจสอบเหตุการณ์และกดรับทราบ'}</span></div><button class="button" data-security="acknowledge" ${!online?'disabled':''}>รับทราบ</button></div>`:''}<div id="page-content" ${busy?'aria-busy="true"':''}>${state?renderPage(r,state,{...context,online,busy}):`<section class="panel no-data"><span class="no-data-icon">${icon(initial?'wifi':'chip')}</span><h2>${initial?'กำลังเชื่อมต่อกับบ้านของคุณ…':'ยังไม่มีข้อมูลจาก ESP32'}</h2><p>${initial?'รอสถานะจากแหล่งข้อมูล':'ตรวจสอบ Wi-Fi และ API URL หรือเลือก Simulation เพื่อทดลองใช้งาน ไม่มีการใช้ข้อมูลจำลองแทน Live'}</p>${!initial?connectionForm():''}</section>`}</div><footer class="page-footer"><span>${icon('home')} ทุกพื้นที่ อยู่ในการดูแล</span><span>${state?`อัปเดต ${state.updatedAt?new Date(state.updatedAt).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):`uptime ${Math.floor(state.uptimeMs/1000)} วินาที`}`:'กำลังรอข้อมูล'}${busy?' · กำลังส่งคำสั่ง…':''}</span></footer></main></div></div>`;
 restoreDrafts();
 const viewport=app.querySelector('[data-house-viewport]');
 if(viewport&&state)mountHouseView(viewport,{...state,connected:online},context.zone,{onZone:id=>{context.zone=id;render();},onDevice:id=>{context.zone=({living:'living',climate:'living',rgb:'bedroom',outdoor:'garden',alarm:'entrance',doorbell:'entrance',parking:'garage'})[id]||context.zone;render();}});
}
async function refresh(force=false){
 if(polling||busy)return;
 const source=provider,ticket=epoch,owner=Symbol('poll');polling=owner;
 try{const latest=await source.getStatus();if(!current(ticket,source))return;state=latest;online=latest.connected;error='';updateHouseView({...state,connected:online},context.zone);}
 catch(err){if(!current(ticket,source))return;online=false;error=err.message;if(state)updateHouseView({...state,connected:false},context.zone);}
 finally{if(polling===owner)polling=null;if(current(ticket,source)){initial=false;renderWhenIdle(force);}}
}
async function command(action,message='บันทึกแล้ว',onSuccess){
 if(busy)return false;
 const source=provider,ticket=++epoch;polling=null;busy=true;render();
 try{
  const result=await action();if(!current(ticket,source))return false;
  const latest=result?.schemaVersion?result:await source.getStatus();if(!current(ticket,source))return false;
  state=latest;online=state.connected;error=online?'':'ระบบจำลองถูกตัดการเชื่อมต่อ';onSuccess?.();toast(message);return true;
 }catch(err){if(current(ticket,source)){toast(err.message,true);connectionError(err);}return false;}
 finally{if(current(ticket,source)){busy=false;render();}}
}
function showDialog(title,content,onSubmit){
 modal.innerHTML=`<form id="dialog-form"><div class="dialog-header"><h2 id="modal-title">${title}</h2><button class="icon-button" type="button" data-action="close-modal" aria-label="ปิด">${icon('close')}</button></div>${content}<div id="dialog-error" role="alert"></div><div class="dialog-actions"><button class="button" type="button" data-action="close-modal">ยกเลิก</button><button class="button primary" type="submit">บันทึก</button></div></form>`;
 modal.showModal();const form=modal.querySelector('#dialog-form'),errorNode=modal.querySelector('#dialog-error');configureRuleFields(form);
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;const source=provider,ticket=++epoch,button=e.submitter||form.querySelector('[type="submit"]');busy=true;button.disabled=true;
  try{const next=await onSubmit(new FormData(form));if(!current(ticket,source))return;state=next?.schemaVersion?next:await source.getStatus();if(!current(ticket,source))return;online=state.connected;error='';if(form.isConnected&&modal.open)modal.close();toast('บันทึกแล้ว');}
  catch(err){if(current(ticket,source)){connectionError(err);if(errorNode.isConnected)errorNode.textContent=err.message;else toast(err.message,true);}}
  finally{if(current(ticket,source)){busy=false;button.disabled=false;if(!modal.open)render();}}
 });
}
function simulate(){
 if(!state||mode!=='simulation')return;
 modal.innerHTML=`<div class="dialog-header"><div><h2 id="modal-title">ทดลองสถานการณ์</h2><p>ส่งค่าเข้าเซนเซอร์จำลอง แล้วดูบ้านตอบสนอง</p></div><button class="icon-button" data-action="close-modal" aria-label="ปิด">${icon('close')}</button></div><div class="simulation-grid">${[['motion','motion','การเคลื่อนไหว',state.sensors.motion],['parking','car','รถในโรงจอด',state.sensors.parking],['doorbell','bell','กดกริ่งหน้าบ้าน',false],['error','chip','เซนเซอร์ผิดพลาด',state.sensors.error]].map(([id,i,t,v])=>`<button class="simulation-tile ${v?'selected':''}" data-inject="${id}" ${!online?'disabled':''}>${icon(i)}<strong>${t}</strong><span>${id==='doorbell'?'กดเพื่อส่งเหตุการณ์':v?'กำลังเกิดเหตุการณ์ · คลิกเพื่อหยุด':'คลิกเพื่อจำลอง'}</span></button>`).join('')}</div><form id="simulation-form"><div class="form-grid"><label class="field">อุณหภูมิ (°C)<input name="temperature" type="number" min="0" max="50" step="0.1" required value="${state.sensors.temperature??26.4}"></label><label class="field">ความชื้น (%)<input name="humidity" type="number" min="0" max="100" required value="${state.sensors.humidity??58}"></label><label class="field">ระดับแสงสัมพัทธ์ (%)<input name="lightPercent" type="number" min="0" max="100" required value="${state.sensors.lightPercent??35}"></label><label class="field">Potentiometer (%)<input name="potentiometer" type="number" min="0" max="100" required value="${state.sensors.potentiometer??65}"></label></div><p class="note">Potentiometer ใช้ Soft takeover: หมุนเข้าใกล้ค่าความสว่างปัจจุบันก่อน จึงจะรับการควบคุมต่อจากเว็บ</p><div id="simulation-error" role="alert"></div><button class="button primary full" ${!online?'disabled':''}>ส่งค่าเซนเซอร์จำลอง</button></form><hr><button class="button full" data-action="sim-connection">${icon('wifi')} ${online?'จำลองการเชื่อมต่อหลุด':'เชื่อมต่อระบบจำลองอีกครั้ง'}</button><p class="note">ข้อมูลทั้งหมดในหน้านี้เป็นข้อมูลจำลอง ไม่ส่งคำสั่งไปยังฮาร์ดแวร์</p>`;
 restoreDrafts();if(!modal.open)modal.showModal();
 document.querySelector('#simulation-form').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;const data=Object.fromEntries([...new FormData(e.target)].map(([k,v])=>[k,Number(v)]));const saved=await command(()=>provider.inject(data),'อัปเดตเซนเซอร์จำลองแล้ว',()=>drafts.delete('simulation-form'));if(saved){modal.close();render();}});
}
function notifications(){
 const events=(state?.events||[]).filter(event=>/doorbell|parking|motion|security|alarm|alert/.test(event.type+' '+event.device));
 modal.innerHTML=`<div class="dialog-header"><div><h2 id="modal-title">ศูนย์การแจ้งเตือน</h2><p>เหตุการณ์จากแหล่งข้อมูลที่กำลังใช้งาน</p></div><button class="icon-button" data-action="close-modal" aria-label="ปิด">${icon('close')}</button></div>${activity(events,20)}<div class="dialog-actions"><button class="button" data-action="notification-logs">ดูบันทึกกิจกรรม ${icon('arrow')}</button></div>`;
 if(!modal.open)modal.showModal();
}
function configureRuleFields(form,changed=false){
 const sensor=form.elements.namedItem('sensor');if(!sensor)return;
 const motion=sensor.value==='motion',temperature=sensor.value==='temperature';
 const operator=form.elements.namedItem('operator'),threshold=form.elements.namedItem('threshold'),hysteresis=form.elements.namedItem('hysteresis');
 for(const option of operator.options)option.disabled=motion&&option.value!=='eq';
 if(motion){operator.value='eq';if(changed)threshold.value='1';hysteresis.value='0';}
 threshold.max=motion?'1':temperature?'50':'100';threshold.step=motion?'1':'0.1';
 hysteresis.max=motion?'0':temperature?'10':'30';hysteresis.readOnly=motion;
 if(!motion&&Number(hysteresis.value)>Number(hysteresis.max))hysteresis.value=hysteresis.max;
}
function ruleEditor(id){const existing=state.rules.find(r=>r.id===id),r=existing||{name:'กฎใหม่',sensor:'temperature',operator:'gt',threshold:30,device:'climate',action:true,enabled:true,delaySeconds:0,hysteresis:1};showDialog(existing?'แก้ไขกฎอัตโนมัติ':'สร้างกฎอัตโนมัติ',`<label class="field">ชื่อกฎ<input name="name" value="${esc(r.name)}" maxlength="40" required></label><div class="form-grid"><label class="field">IF · เซนเซอร์<select name="sensor">${[['temperature','อุณหภูมิ'],['lightPercent','ระดับแสง'],['motion','การเคลื่อนไหว (0/1)']].map(([v,t])=>`<option value="${v}" ${r.sensor===v?'selected':''}>${t}</option>`).join('')}</select></label><label class="field">เงื่อนไข<select name="operator">${[['gt','มากกว่า'],['lt','น้อยกว่า'],['eq','เท่ากับ']].map(([v,t])=>`<option value="${v}" ${r.operator===v?'selected':''}>${t}</option>`).join('')}</select></label><label class="field">Threshold<input name="threshold" type="number" min="0" max="100" step="0.1" value="${r.threshold}" required></label><label class="field">THEN · อุปกรณ์<select name="device">${['living','climate','outdoor'].map(v=>`<option value="${v}" ${r.device===v?'selected':''}>${deviceNames[v]}</option>`).join('')}</select></label><label class="field">การทำงาน<select name="action"><option value="true" ${r.action?'selected':''}>เปิด</option><option value="false" ${!r.action?'selected':''}>ปิด</option></select></label><label class="field">หน่วงก่อนทำงาน (วินาที)<input type="number" name="delaySeconds" min="0" max="3600" value="${r.delaySeconds}" required></label><label class="field">Hysteresis<input type="number" name="hysteresis" min="0" max="30" step="0.1" value="${r.hysteresis}" required></label><label class="check-label"><input name="enabled" type="checkbox" ${r.enabled?'checked':''}> เปิดใช้กฎ</label></div><p class="note">อุปกรณ์ต้องอยู่โหมดอัตโนมัติ · ตรวจสอบความขัดแย้งก่อนบันทึก · Motion ใช้เงื่อนไขเท่ากับ 0 หรือ 1 และ Hysteresis 0</p>`,fd=>provider.saveRule({...existing,name:String(fd.get('name')),sensor:String(fd.get('sensor')),operator:String(fd.get('operator')),threshold:Number(fd.get('threshold')),device:String(fd.get('device')),action:fd.get('action')==='true',enabled:fd.has('enabled'),delaySeconds:Number(fd.get('delaySeconds')),hysteresis:Number(fd.get('hysteresis'))}));}
function sceneEditor(id){const s=state.scenes.find(x=>x.id===id);showDialog(`แก้ไข ${sceneInfo[id].name}`,`<label class="field">ชื่อโหมด<input name="name" value="${esc(s.name)}" maxlength="40" required></label><div class="form-grid">${['living','climate','outdoor','rgb'].map(d=>`<label class="field">${deviceNames[d]}<select name="${d}">${d!=='rgb'?`<option value="auto" ${s.devices[d].mode==='auto'?'selected':''}>อัตโนมัติ</option>`:''}<option value="on" ${s.devices[d].mode==='manual'&&s.devices[d].on?'selected':''}>เปิด</option><option value="off" ${s.devices[d].mode==='manual'&&!s.devices[d].on?'selected':''}>ปิด</option></select></label>`).join('')}<label class="field">สี RGB<input name="color" type="color" value="${s.devices.rgb.color}"></label><label class="field">ความสว่าง RGB (%)<input name="brightness" type="number" min="0" max="100" value="${s.devices.rgb.brightness}" required></label></div><label class="check-label"><input type="checkbox" name="securityArmed" ${s.securityArmed?'checked':''}> เปิดการเฝ้าระวังเมื่อใช้โหมดนี้</label><p class="note">บันทึกเป็นตัวอย่างก่อน ยังไม่เปิดใช้โหมด</p>`,fd=>{const devices={};for(const d of ['living','climate','outdoor','rgb']){const value=fd.get(d);devices[d]={on:value==='on',mode:value==='auto'?'auto':'manual'};}Object.assign(devices.rgb,{color:fd.get('color'),brightness:Number(fd.get('brightness'))});return provider.updateScene(id,{name:fd.get('name'),devices,securityArmed:fd.has('securityArmed')});});}
function confirmAction(title,description,callback){showDialog(title,`<p class="confirm-copy">${description}</p>`,callback);modal.querySelector('button[type="submit"]').textContent='ยืนยัน';}
function exportCsv(){const rows=newestEvents(state.events).filter(e=>(context.logFilter==='all'||e.source===context.logFilter)&&`${e.message} ${e.device} ${e.type}`.toLowerCase().includes(context.search.toLowerCase()));const cell=v=>`"${String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')}"`;const csv='\ufeff'+[['timestamp','uptimeMs','type','device','source','message'],...rows.map(e=>[e.timestamp,e.uptimeMs,e.type,e.device,e.source,e.message])].map(r=>r.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='smart-home-hub-events.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(`ส่งออก ${rows.length} เหตุการณ์แล้ว`);}
document.addEventListener('click',async e=>{
 const el=e.target.closest('button,a,[data-zone]');if(!el||el.disabled)return;
 if(busy&&!['close-modal','menu'].includes(el.dataset.action))return;
 if(el.dataset.zone){context.zone=el.dataset.zone;render();return;}
 if(el.dataset.scene){await command(()=>provider.activateScene(el.dataset.scene),`ใช้โหมด ${sceneInfo[el.dataset.scene].name} แล้ว`);return;}
 if(el.dataset.toggle){const id=el.dataset.toggle;if(id.startsWith('rule:')){const r=state.rules.find(x=>x.id===id.slice(5));await command(()=>provider.saveRule({...r,enabled:!r.enabled}));}else await command(()=>provider.patchDevice(id,{on:!state.devices[id].on,mode:'manual'}),'ส่งคำสั่งอุปกรณ์แล้ว');return;}
 if(el.dataset.color){await command(()=>provider.patchDevice('rgb',{color:el.dataset.color,mode:'manual'}),'เปลี่ยนสีไฟแล้ว');return;}
 if(el.dataset.security){await command(()=>provider.securityAction(el.dataset.security),'อัปเดตระบบเฝ้าระวังแล้ว');return;}
 if(el.dataset.editRule){ruleEditor(el.dataset.editRule);return;}
 if(el.dataset.deleteRule){confirmAction('ลบกฎอัตโนมัติ','ลบกฎนี้ออกจากระบบหรือไม่?',()=>provider.deleteRule(el.dataset.deleteRule));return;}
 if(el.dataset.editScene){sceneEditor(el.dataset.editScene);return;}
 if(el.dataset.inject){const id=el.dataset.inject;const saved=await command(()=>provider.inject({[id]:id==='doorbell'?true:!state.sensors[id]}),'ส่งเหตุการณ์จำลองแล้ว');if(saved&&modal.open)simulate();return;}
 switch(el.dataset.action){
  case 'menu':document.body.classList.toggle('menu-open');break;
  case 'theme':context.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';saveStorage('hub.theme',context.theme);theme();render();break;
  case 'simulate':simulate();break;
  case 'notifications':notifications();break;
  case 'notification-logs':modal.close();location.hash='logs';break;
  case 'close-modal':modal.close();render();break;
  case 'sim-connection':if(await command(()=>provider.setConnection(!online),'อัปเดตการเชื่อมต่อจำลองแล้ว'))simulate();break;
  case 'retry':await refresh(true);break;
  case 'new-rule':ruleEditor();break;
  case 'export':exportCsv();break;
  case 'reset':confirmAction('รีเซ็ตข้อมูลจำลอง','ข้อมูลเซนเซอร์ กฎ โหมดบ้าน การตั้งค่า และประวัติจำลองจะกลับเป็นค่าเริ่มต้น',()=>provider.reset());break;
 }
});
document.addEventListener('keydown',e=>{if(e.target.matches('[data-zone]')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
document.addEventListener('input',e=>{captureDraft(e.target.form);if(e.target.matches('[data-brightness]'))document.querySelector('#brightness-value').textContent=e.target.value+'%';if(e.target.matches('[data-log-search]')){context.search=e.target.value;const pos=e.target.selectionStart;render();const input=document.querySelector('[data-log-search]');input.focus();input.setSelectionRange(pos,pos);}});
document.addEventListener('change',async e=>{const el=e.target;
 captureDraft(el.form);
 if(el.name==='sensor'&&el.form?.id==='dialog-form')configureRuleFields(el.form,true);
 if(el.dataset.deviceMode)await command(()=>provider.patchDevice(el.dataset.deviceMode,{mode:el.value}),'เปลี่ยนโหมดควบคุมแล้ว');
 if(el.matches('[data-brightness]'))await command(()=>provider.patchDevice('rgb',{brightness:Number(el.value),mode:'manual'}),'ปรับความสว่างแล้ว');
 if(el.matches('[data-rgb-color]'))await command(()=>provider.patchDevice('rgb',{color:el.value,mode:'manual'}),'เปลี่ยนสีไฟแล้ว');
 if(el.matches('[data-chart-key]')){context.chartKey=el.value;render();}
 if(el.matches('[data-history-range]')){context.historyRange=el.value;render();}
 if(el.matches('[data-log-filter]')){context.logFilter=el.value;render();}
 if(el.id==='theme-setting'){context.theme=el.value;saveStorage('hub.theme',el.value);theme();render();}
});
document.addEventListener('submit',async e=>{
 if(e.target.id==='settings-form'){e.preventDefault();const fd=new FormData(e.target),data=Object.fromEntries([...fd].filter(([k])=>!['buzzerEnabled','displayEnabled'].includes(k)).map(([k,v])=>[k,k==='deviceName'?String(v):Number(v)]));data.buzzerEnabled=fd.has('buzzerEnabled');data.displayEnabled=fd.has('displayEnabled');await command(()=>provider.updateSettings(data),'บันทึกแล้ว',()=>drafts.delete('settings-form'));}
 if(e.target.id==='connection-form'){e.preventDefault();if(busy)return;const fd=new FormData(e.target),nextMode=fd.get('mode'),baseUrl=String(fd.get('baseUrl')).trim(),apiKey=String(fd.get('apiKey'));try{if(!['simulation','live'].includes(nextMode))throw new Error('โหมดการเชื่อมต่อไม่ถูกต้อง');if(nextMode==='live'&&!localLiveAllowed)throw new Error('เว็บไซต์สาธารณะใช้ได้เฉพาะ Simulation กรุณาเปิดเว็บในเครือข่ายภายในเพื่อใช้ Local Live');const next=nextMode==='live'?createLiveProvider({baseUrl,apiKey}):createSimulationProvider();++epoch;polling=null;provider=next;mode=nextMode;context.baseUrl=baseUrl;context.apiKey=apiKey;saveStorage('hub.mode',mode);saveStorage('hub.baseUrl',baseUrl);drafts.delete('connection-form');state=null;online=false;initial=true;error='';render();await refresh(true);}catch(err){toast(err.message,true);}}
});
window.addEventListener('hashchange',()=>{document.body.classList.remove('menu-open');render();window.scrollTo(0,0);});
modal.addEventListener('click',e=>{if(e.target===modal){const b=modal.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom){modal.close();render();}}});
modal.addEventListener('close',()=>{drafts.delete('simulation-form');if(!busy)renderWhenIdle();});
document.addEventListener('focusout',()=>setTimeout(()=>{if(renderPending&&!busy&&!polling)renderWhenIdle();},0));
render();await refresh(true);setInterval(()=>refresh(),2000);
