/** Shared, dependency-free state providers. Live state always belongs to the ESP32. */
export const SCHEMA_VERSION = 1;
export const LIMITS = Object.freeze({ rules: 12, events: 120, history: 180 });
const STORAGE_KEY = 'smart-home-hub.simulation.v1';
const DEVICE_IDS = ['living', 'climate', 'outdoor', 'rgb', 'alarm'];
const SCENE_IDS = ['home', 'away', 'night', 'work'];
const clone = value => JSON.parse(JSON.stringify(value));
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export class ProviderError extends Error {
  constructor(message, code = 'INVALID_INPUT', status = 0) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.status = status;
  }
}
function assert(condition, message, code) {
  if (!condition) throw new ProviderError(message, code);
}
function number(value, min, max, label) {
  assert(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max,
    `${label} ต้องอยู่ระหว่าง ${min}–${max}`);
  return value;
}
function boolean(value, label) {
  assert(typeof value === 'boolean', `${label} ต้องเป็น true หรือ false`);
  return value;
}
function keys(value, allowed) {
  assert(object(value), 'รูปแบบข้อมูลไม่ถูกต้อง');
  assert(Object.keys(value).every(key => allowed.includes(key)), 'มีฟิลด์ที่ไม่รองรับ');
  assert(Object.keys(value).length > 0, 'ไม่มีข้อมูลสำหรับแก้ไข');
}
function devicePatch(id, patch) {
  assert(DEVICE_IDS.includes(id), 'ไม่พบอุปกรณ์', 'NOT_FOUND');
  keys(patch, id === 'rgb' ? ['on', 'mode', 'color', 'brightness'] : ['on', 'mode']);
  if (has(patch, 'on')) boolean(patch.on, 'สถานะ');
  if (has(patch, 'mode')) assert(['manual', 'auto'].includes(patch.mode), 'โหมดอุปกรณ์ไม่ถูกต้อง');
  if (has(patch, 'color')) assert(typeof patch.color === 'string' && /^#[0-9a-f]{6}$/i.test(patch.color), 'สีต้องอยู่ในรูปแบบ #rrggbb');
  if (has(patch, 'brightness')) number(patch.brightness, 0, 100, 'ความสว่าง');
  return clone(patch);
}
function settingsPatch(patch) {
  const ranges = {
    temperatureThreshold: [0, 50], temperatureHysteresis: [0.5, 10],
    lightThreshold: [0, 100], lightHysteresis: [1, 30], motionTimeout: [1, 3600], alarmDuration: [1, 120],
  };
  keys(patch, ['deviceName', ...Object.keys(ranges), 'displayEnabled', 'buzzerEnabled']);
  for (const [key, value] of Object.entries(patch)) {
    if (ranges[key]) {
      number(value, ...ranges[key], key);
      if (['motionTimeout', 'alarmDuration'].includes(key)) assert(Number.isInteger(value), `${key} ต้องเป็นจำนวนเต็มวินาที`);
    }
    else if (key === 'deviceName') assert(typeof value === 'string' && value.trim().length > 0 && value.length <= 40, 'ชื่ออุปกรณ์ต้องมี 1–40 ตัวอักษร');
    else boolean(value, key);
  }
  return clone(patch);
}
function validateSavedScenes(scenes) {
  assert(scenes.length === 4 && new Set(scenes.map(scene => scene?.id)).size === 4, 'Invalid saved scenes');
  for (const scene of scenes) {
    assert(object(scene) && SCENE_IDS.includes(scene.id), 'Invalid saved scene');
    assert(typeof scene.name === 'string' && scene.name.trim().length > 0 && scene.name.length <= 40, 'Invalid saved scene name');
    boolean(scene.securityArmed, 'การเฝ้าระวัง');
    assert(object(scene.devices) && Object.keys(scene.devices).length === 4, 'Invalid saved scene devices');
    for (const id of ['living', 'climate', 'outdoor', 'rgb']) {
      const patch = scene.devices[id];
      devicePatch(id, patch);
      assert(typeof patch.on === 'boolean' && ['auto', 'manual'].includes(patch.mode), 'Incomplete saved scene');
      if (id === 'rgb') assert(has(patch, 'color') && has(patch, 'brightness'), 'Incomplete saved RGB scene');
    }
  }
}
function defaultScenes() {
  const auto = () => ({ on: false, mode: 'auto' });
  const off = () => ({ on: false, mode: 'manual' });
  const rgb = (on, color, brightness) => ({ on, mode: 'manual', color, brightness });
  return [
    { id: 'home', name: 'อยู่บ้าน', devices: { living: auto(), climate: auto(), outdoor: auto(), rgb: rgb(true, '#29d6ab', 65) }, securityArmed: false },
    { id: 'away', name: 'ออกจากบ้าน', devices: { living: off(), climate: off(), outdoor: auto(), rgb: rgb(false, '#29d6ab', 65) }, securityArmed: true },
    { id: 'night', name: 'พักผ่อน', devices: { living: off(), climate: auto(), outdoor: auto(), rgb: rgb(true, '#a78bfa', 20) }, securityArmed: false },
    { id: 'work', name: 'ทำงาน', devices: { living: { on: true, mode: 'manual' }, climate: auto(), outdoor: auto(), rgb: rgb(true, '#ffffff', 80) }, securityArmed: false },
  ];
}
function initialState(now) {
  return {
    schemaVersion: 1, mode: 'simulation', connected: true, uptimeMs: 0, updatedAt: new Date(now).toISOString(), scene: 'home',
    sensors: { temperature: 26.4, humidity: 58, lightRaw: 1433, lightPercent: 35, motion: false, parking: false, potentiometer: 65, error: false },
    devices: { living: { on: false, mode: 'auto' }, climate: { on: false, mode: 'auto' }, outdoor: { on: false, mode: 'auto' }, rgb: { on: true, mode: 'manual', color: '#29d6ab', brightness: 65 }, alarm: { on: false, mode: 'auto' } },
    security: { armed: false, alarm: false, muted: false, acknowledged: true },
    settings: { deviceName: 'ZhipTech - Smart Home', temperatureThreshold: 28, temperatureHysteresis: 2, lightThreshold: 30, lightHysteresis: 5, motionTimeout: 30, alarmDuration: 15, displayEnabled: true, buzzerEnabled: true },
    scenes: defaultScenes(), rules: [], events: [], history: [],
  };
}

/** Reject incompatible responses; never fill missing live data with simulation defaults. */
export function validateStatus(value) {
  assert(object(value) && value.schemaVersion === 1, 'API schema ไม่ตรงกับเวอร์ชันที่รองรับ', 'INVALID_RESPONSE');
  assert(['live', 'simulation'].includes(value.mode) && typeof value.connected === 'boolean', 'API ไม่ได้ระบุโหมดและสถานะการเชื่อมต่อ', 'INVALID_RESPONSE');
  assert(object(value.sensors) && object(value.devices) && object(value.security) && object(value.settings), 'API ส่งสถานะไม่ครบ', 'INVALID_RESPONSE');
  for (const key of ['temperature', 'humidity', 'lightRaw', 'lightPercent', 'potentiometer']) {
    assert(value.sensors[key] === null || (typeof value.sensors[key] === 'number' && Number.isFinite(value.sensors[key])), `API ส่งค่า ${key} ไม่ถูกต้อง`, 'INVALID_RESPONSE');
  }
  for (const key of ['motion', 'parking', 'error']) assert(typeof value.sensors[key] === 'boolean', `API ส่งค่า ${key} ไม่ถูกต้อง`, 'INVALID_RESPONSE');
  for (const id of DEVICE_IDS) {
    const device = value.devices[id];
    assert(object(device) && typeof device.on === 'boolean' && ['auto', 'manual'].includes(device.mode), `API ส่งสถานะ ${id} ไม่ถูกต้อง`, 'INVALID_RESPONSE');
  }
  assert(/^#[0-9a-f]{6}$/i.test(value.devices.rgb.color) && Number.isFinite(value.devices.rgb.brightness) && value.devices.rgb.brightness >= 0 && value.devices.rgb.brightness <= 100, 'API ส่งข้อมูล RGB ไม่ถูกต้อง', 'INVALID_RESPONSE');
  for (const key of ['armed', 'alarm', 'muted', 'acknowledged']) assert(typeof value.security[key] === 'boolean', 'API ส่งสถานะรักษาความปลอดภัยไม่ครบ', 'INVALID_RESPONSE');
  for (const key of ['scenes', 'rules', 'events', 'history']) assert(Array.isArray(value[key]), `API ไม่มีรายการ ${key}`, 'INVALID_RESPONSE');
  assert(Number.isFinite(value.uptimeMs) && value.uptimeMs >= 0 && SCENE_IDS.includes(value.scene), 'API ส่งเวลาหรือ Scene ไม่ถูกต้อง', 'INVALID_RESPONSE');
  assert(value.updatedAt === null || (typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))), 'API ส่งเวลาไม่ถูกต้อง', 'INVALID_RESPONSE');
  for (const event of value.events) {
    assert(object(event) && typeof event.id === 'string' && typeof event.type === 'string' && typeof event.device === 'string' && typeof event.source === 'string' && typeof event.message === 'string' && Number.isFinite(event.uptimeMs), 'API ส่ง Activity Log ไม่ถูกต้อง', 'INVALID_RESPONSE');
    assert(event.timestamp === null || (typeof event.timestamp === 'string' && Number.isFinite(Date.parse(event.timestamp))), 'API ส่งเวลา Activity Log ไม่ถูกต้อง', 'INVALID_RESPONSE');
  }
  for (const sample of value.history) {
    assert(object(sample) && Number.isFinite(sample.uptimeMs) && ['temperature', 'humidity', 'lightPercent'].every(key => sample[key] === null || Number.isFinite(sample[key])), 'API ส่งประวัติเซนเซอร์ไม่ถูกต้อง', 'INVALID_RESPONSE');
    assert(sample.timestamp === null || (typeof sample.timestamp === 'string' && Number.isFinite(Date.parse(sample.timestamp))), 'API ส่งเวลาประวัติเซนเซอร์ไม่ถูกต้อง', 'INVALID_RESPONSE');
  }
  try {
    const settingNames = ['deviceName', 'temperatureThreshold', 'temperatureHysteresis', 'lightThreshold', 'lightHysteresis', 'motionTimeout', 'alarmDuration', 'displayEnabled', 'buzzerEnabled'];
    settingsPatch(Object.fromEntries(settingNames.map(key => [key, value.settings[key]])));
    validateSavedScenes(value.scenes);
    assert(value.rules.length <= LIMITS.rules, 'Too many rules');
    for (const rule of value.rules) { validateRule(rule); assert(typeof rule.id === 'string', 'Missing rule ID'); }
  } catch { throw new ProviderError('API ส่งการตั้งค่า โหมดบ้าน หรือกฎอัตโนมัติไม่ถูกต้อง', 'INVALID_RESPONSE'); }
  return value;
}

function validateRule(rule) {
  keys(rule, ['id', 'name', 'sensor', 'operator', 'threshold', 'device', 'action', 'enabled', 'delaySeconds', 'hysteresis']);
  assert(typeof rule.name === 'string' && rule.name.trim().length > 0 && rule.name.length <= 60, 'ชื่อกฎต้องมี 1–60 ตัวอักษร');
  assert(['temperature', 'lightPercent', 'motion'].includes(rule.sensor), 'เซนเซอร์นี้ยังไม่รองรับในกฎ');
  assert(['gt', 'lt', 'eq'].includes(rule.operator), 'เงื่อนไขไม่ถูกต้อง');
  assert(['living', 'climate', 'outdoor'].includes(rule.device), 'อุปกรณ์นี้ยังไม่รองรับในกฎ');
  boolean(rule.action, 'ผลลัพธ์กฎ');
  boolean(rule.enabled, 'การเปิดใช้กฎ');
  if (rule.sensor === 'motion') {
    assert(rule.operator === 'eq', 'PIR รองรับเงื่อนไขเท่ากับเท่านั้น');
    assert([0, 1, true, false].includes(rule.threshold), 'PIR ใช้ค่า 0 หรือ 1');
  } else number(rule.threshold, rule.sensor === 'temperature' ? 0 : 0, rule.sensor === 'temperature' ? 50 : 100, 'Threshold');
  number(rule.delaySeconds, 0, 3600, 'Delay');
  assert(Number.isInteger(rule.delaySeconds), 'Delay ต้องเป็นจำนวนเต็มวินาที');
  number(rule.hysteresis, 0, rule.sensor === 'temperature' ? 10 : rule.sensor === 'motion' ? 0 : 30, 'Hysteresis');
  if (has(rule, 'id')) assert(typeof rule.id === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(rule.id), 'Rule ID ไม่ถูกต้อง');
  return { ...clone(rule), threshold: Number(rule.threshold) };
}
function predicatesOverlap(a, b) {
  if (a.sensor !== b.sensor) return true; // Independent sensors can both trigger.
  if (a.operator === 'eq') return b.operator === 'eq' ? a.threshold === b.threshold : b.operator === 'gt' ? a.threshold > b.threshold : a.threshold < b.threshold;
  if (b.operator === 'eq') return predicatesOverlap(b, a);
  if (a.operator === b.operator) return true;
  return a.operator === 'gt' ? a.threshold < b.threshold : b.threshold < a.threshold;
}

export function createSimulationProvider(options = {}) {
  const clock = options.now || (() => Date.now());
  let storage = options.storage;
  if (storage === undefined) {
    try { storage = globalThis.localStorage; } catch { storage = null; }
  }
  let start = clock();
  let state = initialState(start);
  let sequence = 0;
  let lastMotionAt = null;
  let alarmUntil = 0;
  let manualAlarmUntil = 0;
  let lastHistoryAt = -Infinity;
  let potTaken = false;
  let previousPot = 65;
  let ruleRuntime = new Map();
  let validSensors = clone(state.sensors);
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.mode === 'simulation') {
      validateStatus(saved);
      settingsPatch(saved.settings);
      assert(saved.rules.length <= LIMITS.rules && saved.events.length <= LIMITS.events && saved.history.length <= LIMITS.history, 'Saved history too large');
      saved.rules.forEach(validateRule);
      assert(saved.rules.every(rule => typeof rule.id === 'string') && new Set(saved.rules.map(rule => rule.id)).size === saved.rules.length, 'Invalid saved rule IDs');
      for (const [id, device] of Object.entries(saved.devices)) devicePatch(id, device);
      validateSavedScenes(saved.scenes);
      state = clone(saved);
      state.connected = true;
      state.security = { armed: saved.security.armed, alarm: false, muted: false, acknowledged: true };
      state.devices.alarm.on = false;
      start -= state.uptimeMs;
      sequence = state.events.reduce((max, event) => Math.max(max, Number(event.id?.split('-').at(-1)) || 0), 0);
      previousPot = state.sensors.potentiometer ?? 65;
      validSensors = { ...initialState(start).sensors, ...Object.fromEntries(Object.entries(state.sensors).filter(([, value]) => value !== null)) };
    }
  } catch { state = initialState(start); }
  function persist() {
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Storage may be full or disabled; simulation remains usable. */ }
  }
  function checkConnection() { assert(state.connected, 'การเชื่อมต่อจำลองขาดหาย ข้อมูลที่แสดงเป็นข้อมูลล่าสุดก่อนขาดการเชื่อมต่อ', 'OFFLINE'); }
  function stamp(now = clock()) {
    state.uptimeMs = Math.max(0, now - start);
    state.updatedAt = new Date(now).toISOString();
  }
  function log(type, device, source, message) {
    state.events.unshift({ id: `event-${++sequence}`, timestamp: state.updatedAt, uptimeMs: state.uptimeMs, type, device, source, message });
    state.events.length = Math.min(state.events.length, LIMITS.events);
  }
  function output(id, on, source = 'automation') {
    if (state.devices[id].on !== on) {
      state.devices[id].on = on;
      log('device', id, source, `${id}: ${on ? 'เปิด' : 'ปิด'}`);
    }
  }
  function triggerAlarm(source) {
    if (state.security.alarm) return;
    state.security.alarm = true;
    state.security.acknowledged = false;
    state.security.muted = false;
    alarmUntil = state.uptimeMs + state.settings.alarmDuration * 1000;
    log('alert', 'alarm', source, 'ตรวจพบการเคลื่อนไหวขณะเฝ้าระวัง');
  }
  function evaluate(now = clock()) {
    if (!state.connected) return;
    stamp(now);
    const { sensors: s, settings: c, devices: d } = state;
    const desired = { living: d.living.on, climate: d.climate.on, outdoor: d.outdoor.on };
    if (s.motion) lastMotionAt = state.uptimeMs;
    if (d.living.mode === 'auto') desired.living = lastMotionAt !== null && state.uptimeMs - lastMotionAt < c.motionTimeout * 1000;
    if (d.climate.mode === 'auto') {
      if (s.error || s.temperature === null) desired.climate = false;
      else if (s.temperature >= c.temperatureThreshold) desired.climate = true;
      else if (s.temperature <= c.temperatureThreshold - c.temperatureHysteresis) desired.climate = false;
    }
    if (d.outdoor.mode === 'auto') {
      if (s.error || s.lightPercent === null) desired.outdoor = false;
      else if (s.lightPercent <= c.lightThreshold) desired.outdoor = true;
      else if (s.lightPercent >= c.lightThreshold + c.lightHysteresis) desired.outdoor = false;
    }
    for (const rule of state.rules) {
      let runtime = ruleRuntime.get(rule.id) || { active: false, since: null };
      const value = s[rule.sensor];
      let condition = false;
      if (rule.enabled && value !== null && !(s.error && rule.sensor !== 'motion')) {
        const numeric = Number(value);
        condition = rule.operator === 'eq' ? numeric === rule.threshold
          : rule.operator === 'gt' ? numeric > rule.threshold - (runtime.active ? rule.hysteresis : 0)
            : numeric < rule.threshold + (runtime.active ? rule.hysteresis : 0);
      }
      runtime.active = condition;
      if (!condition) runtime.since = null;
      else if (runtime.since === null) runtime.since = state.uptimeMs;
      if (condition && state.uptimeMs - runtime.since >= rule.delaySeconds * 1000 && d[rule.device].mode === 'auto') desired[rule.device] = rule.action;
      ruleRuntime.set(rule.id, runtime);
    }
    // Sensor failure has higher priority than rules and manual climate control.
    if (s.error || s.temperature === null) desired.climate = false;
    for (const [id, on] of Object.entries(desired)) output(id, on);
    if (state.security.alarm && state.uptimeMs >= alarmUntil) {
      state.security.alarm = false;
      log('security', 'alarm', 'system', 'สิ้นสุดระยะเวลาส่งเสียงเตือน');
    }
    if (manualAlarmUntil && state.uptimeMs >= manualAlarmUntil) manualAlarmUntil = 0;
    const alarmOutput = state.security.alarm ? !state.security.muted : manualAlarmUntil > state.uptimeMs;
    output('alarm', alarmOutput && c.buzzerEnabled, 'system');
    if (state.uptimeMs - lastHistoryAt >= 5000) {
      state.history.push({ timestamp: state.updatedAt, uptimeMs: state.uptimeMs, temperature: s.temperature, humidity: s.humidity, lightPercent: s.lightPercent });
      if (state.history.length > LIMITS.history) state.history.splice(0, state.history.length - LIMITS.history);
      lastHistoryAt = state.uptimeMs;
    }
  }
  function result() { persist(); return clone(state); }
  function scenePatch(id, patch) {
    assert(SCENE_IDS.includes(id), 'ไม่พบ Scene', 'NOT_FOUND');
    keys(patch, ['name', 'devices', 'securityArmed']);
    if (has(patch, 'name')) assert(typeof patch.name === 'string' && patch.name.trim().length > 0 && patch.name.length <= 40, 'ชื่อ Scene ต้องมี 1–40 ตัวอักษร');
    if (has(patch, 'securityArmed')) boolean(patch.securityArmed, 'การเฝ้าระวัง');
    if (has(patch, 'devices')) {
      keys(patch.devices, ['living', 'climate', 'outdoor', 'rgb']);
      for (const [device, value] of Object.entries(patch.devices)) devicePatch(device, value);
    }
  }
  evaluate();
  if (!state.events.length) log('system', 'hub', 'simulation', 'เริ่มระบบจำลอง ZhipTech - Smart Home — ข้อมูลทั้งหมดในโหมดนี้เป็นข้อมูลจำลอง');
  return {
    mode: 'simulation',
    async getStatus() { checkConnection(); evaluate(); return result(); },
    async getEvents() { checkConnection(); return clone(state.events); },
    async getHistory() { checkConnection(); return clone(state.history); },
    async patchDevice(id, patch) {
      checkConnection();
      const valid = devicePatch(id, patch);
      stamp();
      // Direct output changes take ownership until Auto or a Scene is explicitly selected.
      if (has(valid, 'on') || has(valid, 'color') || has(valid, 'brightness')) valid.mode ??= 'manual';
      if (id === 'alarm' && has(valid, 'on')) {
        // A buzzer test must not create or dismiss a security incident.
        manualAlarmUntil = valid.on ? state.uptimeMs + state.settings.alarmDuration * 1000 : 0;
      }
      Object.assign(state.devices[id], valid);
      if (id === 'rgb' && (has(valid, 'brightness') || has(valid, 'color'))) potTaken = false;
      log('device', id, 'manual', `ปรับ ${id} (${state.devices[id].mode === 'auto' ? 'อัตโนมัติ' : 'ควบคุมเอง'})`);
      evaluate();
      return result();
    },
    async activateScene(id) {
      checkConnection();
      const scene = state.scenes.find(item => item.id === id);
      assert(scene, 'ไม่พบ Scene', 'NOT_FOUND');
      stamp();
      // A latched alert must be dealt with explicitly before a scene may disarm it.
      assert((!state.security.alarm && state.security.acknowledged) || scene.securityArmed, 'มีการแจ้งเตือนที่ยังไม่รับทราบ โปรดรับทราบหรือปิดเฝ้าระวังก่อนเปลี่ยน Scene', 'ACTIVE_ALARM');
      for (const [device, patch] of Object.entries(scene.devices)) Object.assign(state.devices[device], clone(patch));
      state.scene = id;
      state.security.armed = scene.securityArmed;
      if (!scene.securityArmed) { state.security.muted = false; state.security.alarm = false; }
      potTaken = false;
      ruleRuntime.clear();
      log('scene', 'hub', 'manual', `ใช้ Scene: ${scene.name}`);
      // Arming with PIR already active must not miss an intrusion.
      if (state.security.armed && state.sensors.motion) triggerAlarm('automation');
      evaluate();
      return result();
    },
    async updateScene(id, patch) {
      checkConnection(); scenePatch(id, patch); stamp();
      const scene = state.scenes.find(item => item.id === id);
      if (has(patch, 'name')) scene.name = patch.name.trim();
      if (has(patch, 'securityArmed')) scene.securityArmed = patch.securityArmed;
      for (const [device, value] of Object.entries(patch.devices || {})) Object.assign(scene.devices[device], clone(value));
      log('scene', 'hub', 'manual', `บันทึก Scene: ${scene.name} (ยังไม่ได้เปิดใช้)`);
      return result();
    },
    async saveRule(input) {
      checkConnection();
      const rule = validateRule({ delaySeconds: 0, hysteresis: 0, ...input });
      const existing = rule.id ? state.rules.find(item => item.id === rule.id) : null;
      if (rule.id) assert(existing, 'ไม่พบกฎ', 'NOT_FOUND');
      else assert(state.rules.length < LIMITS.rules, `เพิ่มกฎได้สูงสุด ${LIMITS.rules} ข้อ`, 'RULE_LIMIT');
      const conflict = state.rules.find(other => other.id !== rule.id && other.enabled && rule.enabled && other.device === rule.device && other.action !== rule.action && predicatesOverlap(other, rule));
      assert(!conflict, `กฎขัดแย้งกับ “${conflict?.name}” ที่สั่งอุปกรณ์เดียวกัน`, 'RULE_CONFLICT');
      stamp();
      if (existing) Object.assign(existing, rule);
      else { rule.id = `rule-${++sequence}`; state.rules.push(rule); }
      ruleRuntime.delete(rule.id);
      log('automation', rule.device, 'manual', `บันทึกกฎ: ${rule.name}`);
      evaluate();
      return result();
    },
    async deleteRule(id) {
      checkConnection();
      const index = state.rules.findIndex(item => item.id === id);
      assert(index >= 0, 'ไม่พบกฎ', 'NOT_FOUND');
      stamp();
      const [rule] = state.rules.splice(index, 1);
      ruleRuntime.delete(id);
      log('automation', rule.device, 'manual', `ลบกฎ: ${rule.name}`);
      evaluate();
      return result();
    },
    async securityAction(action) {
      checkConnection();
      assert(['arm', 'disarm', 'mute', 'acknowledge'].includes(action), 'คำสั่งระบบเฝ้าระวังไม่ถูกต้อง');
      stamp();
      if (action === 'arm') {
        state.security.armed = true;
        if (state.sensors.motion) triggerAlarm('automation');
      } else if (action === 'disarm') {
        state.security.armed = false; state.security.alarm = false; state.security.muted = false; state.security.acknowledged = true;
        manualAlarmUntil = 0;
      } else if (action === 'mute') state.security.muted = true;
      else { state.security.acknowledged = true; state.security.alarm = false; manualAlarmUntil = 0; }
      log('security', 'alarm', 'manual', { arm: 'เปิดการเฝ้าระวัง', disarm: 'ปิดการเฝ้าระวัง', mute: 'ปิดเสียงเตือน', acknowledge: 'รับทราบการแจ้งเตือน' }[action]);
      evaluate();
      return result();
    },
    async updateSettings(patch) {
      checkConnection(); const valid = settingsPatch(patch); stamp();
      Object.assign(state.settings, valid);
      log('settings', 'hub', 'manual', 'บันทึกการตั้งค่าระบบจำลอง');
      evaluate();
      return result();
    },
    async inject(patch) {
      checkConnection();
      keys(patch, ['temperature', 'humidity', 'lightPercent', 'lightRaw', 'motion', 'parking', 'doorbell', 'potentiometer', 'error']);
      for (const [key, value] of Object.entries(patch)) {
        if (['motion', 'parking', 'doorbell', 'error'].includes(key)) boolean(value, key);
        else number(value, key === 'temperature' ? 0 : 0, key === 'temperature' ? 50 : key === 'lightRaw' ? 4095 : 100, key);
      }
      stamp();
      const old = clone(state.sensors);
      if (has(patch, 'error')) {
        if (patch.error) {
          state.sensors.error = true;
          state.sensors.temperature = null; state.sensors.humidity = null; state.sensors.lightPercent = null; state.sensors.lightRaw = null;
        } else {
          Object.assign(state.sensors, validSensors, { error: false, motion: old.motion, parking: old.parking });
        }
        if (patch.error !== old.error) log('sensor', 'environment', 'simulation', patch.error ? 'จำลอง Sensor Error — ปิดระบบปรับอากาศเพื่อความปลอดภัย' : 'เซนเซอร์จำลองกลับมาทำงาน');
      }
      for (const key of ['temperature', 'humidity', 'lightPercent', 'lightRaw']) {
        if (has(patch, key)) { validSensors[key] = patch[key]; if (!state.sensors.error) state.sensors[key] = patch[key]; }
      }
      if (has(patch, 'lightPercent') && !has(patch, 'lightRaw')) {
        validSensors.lightRaw = Math.round(patch.lightPercent * 4095 / 100);
        if (!state.sensors.error) state.sensors.lightRaw = validSensors.lightRaw;
      }
      for (const key of ['motion', 'parking']) {
        if (has(patch, key) && patch[key] !== old[key]) {
          state.sensors[key] = patch[key];
          log(key, key === 'motion' ? 'pir' : 'garage', 'simulation', key === 'motion' ? (patch[key] ? 'PIR ตรวจพบการเคลื่อนไหว' : 'PIR ไม่พบการเคลื่อนไหว') : (patch[key] ? 'รถเข้าโรงจอด' : 'รถออกจากโรงจอด'));
          if (key === 'motion' && patch[key] && state.security.armed) triggerAlarm('automation');
        }
      }
      if (patch.doorbell) log('doorbell', 'entrance', 'simulation', 'มีผู้กดกริ่งหน้าบ้าน (เสียงกริ่งมีลำดับความสำคัญเหนือเสียงโรงจอดรถ)');
      if (has(patch, 'potentiometer')) {
        const next = patch.potentiometer;
        const target = state.devices.rgb.brightness;
        state.sensors.potentiometer = next;
        if (Math.abs(next - target) <= 3 || (previousPot - target) * (next - target) <= 0) potTaken = true;
        if (potTaken && Math.abs(next - state.devices.rgb.brightness) >= 2) {
          state.devices.rgb.brightness = next;
          log('device', 'rgb', 'simulation', `ปรับความสว่างด้วย Potentiometer: ${next}%`);
        }
        previousPot = next;
      }
      evaluate();
      return result();
    },
    async tick(now) { checkConnection(); evaluate(now ?? clock()); return result(); },
    async setConnection(connected) {
      boolean(connected, 'การเชื่อมต่อ');
      const changed = state.connected !== connected;
      state.connected = connected;
      if (connected) { stamp(); if (changed) log('network', 'hub', 'simulation', 'เชื่อมต่อระบบจำลองอีกครั้ง'); evaluate(); }
      return result();
    },
    async reset() {
      checkConnection();
      start = clock(); state = initialState(start); sequence = 0; lastMotionAt = null; alarmUntil = 0; manualAlarmUntil = 0; lastHistoryAt = -Infinity;
      potTaken = false; previousPot = 65; ruleRuntime = new Map(); validSensors = clone(state.sensors);
      evaluate(); log('system', 'hub', 'simulation', 'คืนค่าเริ่มต้นระบบจำลอง');
      return result();
    },
  };
}

export function createLiveProvider({ baseUrl = '', apiKey = '', fetchImpl = globalThis.fetch, timeoutMs = 5000 } = {}) {
  assert(typeof fetchImpl === 'function', 'Browser นี้ไม่รองรับ Fetch API');
  assert(typeof baseUrl === 'string', 'API Base URL ไม่ถูกต้อง');
  const base = baseUrl.replace(/\/+$/, '');
  if (base) {
    let parsed;
    try { parsed = new URL(base); } catch { throw new ProviderError('API Base URL ต้องเป็น URL เต็ม เช่น http://192.168.1.20'); }
    assert(['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password && !parsed.search && !parsed.hash, 'API Base URL ต้องใช้ HTTP/HTTPS และไม่มีรหัสผ่านหรือ Query');
  }
  async function request(path, method = 'GET', body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers = { Accept: 'application/json' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (apiKey) headers['X-API-Key'] = apiKey;
      const response = await fetchImpl(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal, cache: 'no-store', credentials: 'same-origin' });
      let data;
      try { data = await response.json(); } catch { throw new ProviderError('ESP32 ส่งข้อมูลที่ไม่ใช่ JSON', 'INVALID_RESPONSE', response.status); }
      if (!response.ok) {
        const detail = typeof data.error === 'string' ? data.error : data.error?.message || data.message;
        throw new ProviderError(detail || `ESP32 ตอบกลับ HTTP ${response.status}`, typeof data.code === 'string' ? data.code : 'API_ERROR', response.status);
      }
      return data;
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(error?.name === 'AbortError' ? 'ESP32 ไม่ตอบกลับภายในเวลาที่กำหนด' : 'เชื่อมต่อ ESP32 ไม่สำเร็จ ตรวจสอบ Wi-Fi, URL และสิทธิ์ CORS', error?.name === 'AbortError' ? 'TIMEOUT' : 'OFFLINE');
    } finally { clearTimeout(timer); }
  }
  async function getStatus() {
    const state = validateStatus(await request('/api/status'));
    assert(state.mode === 'live', 'Live Mode ได้รับข้อมูลที่ไม่ได้มาจากอุปกรณ์จริง', 'INVALID_RESPONSE');
    return state;
  }
  async function mutate(path, method, body) {
    const response = await request(path, method, body);
    if (response?.schemaVersion === 1) {
      validateStatus(response);
      assert(response.mode === 'live', 'คำสั่ง Live ได้รับข้อมูลจำลอง', 'INVALID_RESPONSE');
      return response;
    }
    return getStatus();
  }
  return {
    mode: 'live', getStatus,
    async getEvents() { const data = await request('/api/events'); const list = Array.isArray(data) ? data : data.events; assert(Array.isArray(list), 'รูปแบบ Activity Log ไม่ถูกต้อง', 'INVALID_RESPONSE'); return list; },
    async getHistory() { const data = await request('/api/history'); const list = Array.isArray(data) ? data : data.history; assert(Array.isArray(list), 'รูปแบบประวัติเซนเซอร์ไม่ถูกต้อง', 'INVALID_RESPONSE'); return list; },
    async patchDevice(id, patch) { return mutate(`/api/devices/${encodeURIComponent(id)}`, 'PATCH', devicePatch(id, patch)); },
    async activateScene(id) { assert(SCENE_IDS.includes(id), 'ไม่พบ Scene', 'NOT_FOUND'); return mutate('/api/scenes/activate', 'POST', { id }); },
    async updateScene(id, patch) { assert(SCENE_IDS.includes(id), 'ไม่พบ Scene', 'NOT_FOUND'); return mutate(`/api/scenes/${encodeURIComponent(id)}`, 'PATCH', patch); },
    async saveRule(rule) { const valid = validateRule({ delaySeconds: 0, hysteresis: 0, ...rule }); const { id, ...body } = valid; return mutate(id ? `/api/automation/${encodeURIComponent(id)}` : '/api/automation', id ? 'PATCH' : 'POST', body); },
    async deleteRule(id) { assert(typeof id === 'string' && id.length > 0, 'Rule ID ไม่ถูกต้อง'); return mutate(`/api/automation/${encodeURIComponent(id)}`, 'DELETE'); },
    async securityAction(action) { assert(['arm', 'disarm', 'mute', 'acknowledge'].includes(action), 'คำสั่งระบบเฝ้าระวังไม่ถูกต้อง'); return mutate(`/api/security/${action}`, 'POST', {}); },
    async updateSettings(patch) { return mutate('/api/settings', 'PATCH', settingsPatch(patch)); },
    async reset() { return mutate('/api/settings/reset', 'POST', { confirm: true }); },
  };
}
