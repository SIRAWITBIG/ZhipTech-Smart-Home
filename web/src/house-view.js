// Lightweight bridge: retained DOM prevents GPU/context churn during status polling.
let current = null, pending = null, generation = 0, target = null, latest = null, selected = 'living', handlers = {};
export function detachHouseView(){current?.element.remove();}
export function updateHouseView(state,zone){latest=state;selected=zone;current?.update(state,zone);}
export function disposeHouseView(){generation++;current?.dispose();current=null;pending=null;target=null;}
export function mountHouseView(container,state,zone,callbacks={}){
  if(!container){disposeHouseView();return;}
  target=container;latest=state;selected=zone;handlers=callbacks;
  if(globalThis.HUB_LITE){container.dataset.renderMode='lite';return;}
  if(current){container.replaceChildren(current.element);current.update(state,zone);current.resize();return;}
  if(pending)return;
  const ticket=generation;
  container.dataset.renderMode='loading';
  const label=document.createElement('p');label.className='twin-loading';label.textContent='กำลังเตรียมบ้านสามมิติ…';container.prepend(label);
  pending=import('./house-engine.js').then(({createHouseView})=>{
    if(ticket!==generation||!target?.isConnected)return;
    const result=createHouseView({onZone:id=>handlers.onZone?.(id),onDevice:(id,zone)=>handlers.onDevice?.(id,zone)});
    current=result;target.replaceChildren(result.element);target.dataset.renderMode='webgl';result.update(latest,selected);result.resize();
  }).catch(error=>{
    if(ticket!==generation||!target)return;
    target.dataset.renderMode='fallback';
    const note=document.createElement('p');note.className='twin-fallback';note.textContent='อุปกรณ์นี้เปิด 3D ไม่ได้ ใช้แผนผัง 2D และควบคุมบ้านต่อได้';
    target.querySelector('.twin-loading')?.remove();target.prepend(note);
    console.warn('3D fallback:',error.message);
  }).finally(()=>{if(ticket===generation)pending=null;});
}
