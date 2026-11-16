import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulationProvider, createLiveProvider, LIMITS } from '../src/provider.js';

function simulation(storage = null) {
  let time = Date.parse('2026-11-17T00:00:00Z');
  const provider = createSimulationProvider({ now: () => time, storage });
  return { provider, advance(ms) { time += ms; return provider.tick(); } };
}
const rule = overrides => ({ name: 'ทดสอบอุณหภูมิ', sensor: 'temperature', operator: 'gt', threshold: 30, device: 'living', action: true, enabled: true, delaySeconds: 0, hysteresis: 1, ...overrides });
const reply = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, async json() { return data; } });

test('simulation starts explicitly labeled and readings are not randomized by polling', async () => {
  const { provider, advance } = simulation();
  const first = await provider.getStatus();
  assert.equal(first.mode, 'simulation');
  assert.equal(first.sensors.temperature, 26.4);
  assert.equal(first.history.length, 1);
  const second = await advance(5000);
  assert.equal(second.history.length, 2);
  assert.deepEqual(second.sensors, first.sensors);
  first.devices.rgb.on = false;
  assert.equal((await provider.getStatus()).devices.rgb.on, true, 'callers receive isolated snapshots');
});

test('climate hysteresis and persistent manual override', async () => {
  const { provider } = simulation();
  assert.equal((await provider.inject({ temperature: 29 })).devices.climate.on, true);
  assert.equal((await provider.inject({ temperature: 27 })).devices.climate.on, true);
  assert.equal((await provider.inject({ temperature: 26 })).devices.climate.on, false);
  await provider.patchDevice('climate', { on: true });
  const manual = await provider.inject({ temperature: 20 });
  assert.equal(manual.devices.climate.mode, 'manual');
  assert.equal(manual.devices.climate.on, true);
  assert.equal((await provider.patchDevice('climate', { mode: 'auto' })).devices.climate.on, false);
});

test('outdoor threshold uses hysteresis and reports relative light, not lux', async () => {
  const { provider } = simulation();
  assert.equal((await provider.inject({ lightPercent: 25 })).devices.outdoor.on, true);
  assert.equal((await provider.inject({ lightPercent: 32 })).devices.outdoor.on, true);
  const status = await provider.inject({ lightPercent: 36 });
  assert.equal(status.devices.outdoor.on, false);
  assert.equal(status.sensors.lightRaw, 1474);
  assert.equal(status.sensors.lux, undefined);
});

test('PIR lighting timeout starts from the last active sample', async () => {
  const { provider, advance } = simulation();
  assert.equal((await provider.inject({ motion: true })).devices.living.on, true);
  await advance(5000);
  await provider.inject({ motion: false });
  assert.equal((await advance(29999)).devices.living.on, true);
  assert.equal((await advance(1)).devices.living.on, false);
});

test('security detects arming while motion active and prevents accidental scene disarm', async () => {
  const { provider, advance } = simulation();
  await provider.inject({ motion: true });
  const armed = await provider.activateScene('away');
  assert.equal(armed.security.alarm, true);
  assert.equal(armed.devices.alarm.on, true);
  await assert.rejects(provider.activateScene('home'), { code: 'ACTIVE_ALARM' });
  assert.equal((await provider.securityAction('mute')).devices.alarm.on, false);
  const expired = await advance(15001);
  assert.equal(expired.security.alarm, false);
  assert.equal(expired.security.acknowledged, false);
  assert.equal(expired.events.filter(event => event.type === 'alert').length, 1, 'stationary HIGH must not retrigger every poll');
  await assert.rejects(provider.activateScene('home'), { code: 'ACTIVE_ALARM' }, 'an expired audible alarm still needs acknowledgement');
  await provider.securityAction('acknowledge');
  await provider.inject({ motion: false });
  assert.equal((await provider.inject({ motion: true })).security.alarm, true);
});

test('sensor failure nulls readings and overrides manual climate or custom rules safely', async () => {
  const { provider } = simulation();
  await provider.inject({ temperature: 31, humidity: 64, lightPercent: 50 });
  await provider.patchDevice('climate', { on: true });
  const failed = await provider.inject({ error: true });
  assert.equal(failed.sensors.temperature, null);
  assert.equal(failed.sensors.humidity, null);
  assert.equal(failed.sensors.lightPercent, null);
  assert.equal(failed.devices.climate.on, false);
  const recovered = await provider.inject({ error: false });
  assert.equal(recovered.sensors.temperature, 31);
  assert.equal(recovered.sensors.humidity, 64);
  assert.equal(recovered.sensors.error, false);
});

test('manual buzzer test is bounded and cannot create or dismiss a security incident', async () => {
  const { provider, advance } = simulation();
  const manual = await provider.patchDevice('alarm', { on: true });
  assert.equal(manual.devices.alarm.on, true);
  assert.equal(manual.security.alarm, false);
  assert.equal(manual.security.acknowledged, true);
  assert.equal((await advance(15000)).devices.alarm.on, false);
  await provider.securityAction('arm');
  await provider.inject({ motion: true });
  const protectedAlarm = await provider.patchDevice('alarm', { on: false });
  assert.equal(protectedAlarm.devices.alarm.on, true);
  assert.equal(protectedAlarm.security.alarm, true);
  assert.equal(protectedAlarm.security.acknowledged, false);
});

test('potentiometer soft takeover waits until the physical value crosses the web brightness', async () => {
  const { provider } = simulation();
  await provider.patchDevice('rgb', { brightness: 20 });
  assert.equal((await provider.inject({ potentiometer: 80 })).devices.rgb.brightness, 20);
  assert.equal((await provider.inject({ potentiometer: 40 })).devices.rgb.brightness, 20);
  assert.equal((await provider.inject({ potentiometer: 19 })).devices.rgb.brightness, 20, 'deadband avoids tiny writes');
  assert.equal((await provider.inject({ potentiometer: 10 })).devices.rgb.brightness, 10);
  await provider.patchDevice('rgb', { brightness: 75 });
  assert.equal((await provider.inject({ potentiometer: 30 })).devices.rgb.brightness, 75, 'new web command releases physical ownership');
});

test('parking and doorbell log real simulation inputs without duplicate parking events', async () => {
  const { provider } = simulation();
  await provider.inject({ parking: true });
  await provider.inject({ parking: true });
  await provider.inject({ doorbell: true });
  await provider.inject({ parking: false });
  const events = await provider.getEvents();
  assert.equal(events.filter(event => event.type === 'parking').length, 2);
  assert.equal(events.filter(event => event.type === 'doorbell').length, 1);
});

test('rules use continuous delay, hysteresis, and respect manual override', async () => {
  const { provider, advance } = simulation();
  await provider.saveRule(rule({ delaySeconds: 2 }));
  assert.equal((await provider.inject({ temperature: 31 })).devices.living.on, false);
  assert.equal((await advance(1999)).devices.living.on, false);
  assert.equal((await advance(1)).devices.living.on, true);
  assert.equal((await provider.inject({ temperature: 29.5 })).devices.living.on, true);
  assert.equal((await provider.inject({ temperature: 28 })).devices.living.on, false);
  await provider.inject({ temperature: 31 });
  await provider.patchDevice('living', { on: false });
  assert.equal((await advance(3000)).devices.living.on, false);
});

test('rule conflicts, limits, invalid values, and deletion are checked', async () => {
  const { provider } = simulation();
  const first = await provider.saveRule(rule());
  const id = first.rules[0].id;
  await assert.rejects(provider.saveRule(rule({ name: 'ขัดแย้ง', action: false, threshold: 29 })), { code: 'RULE_CONFLICT' });
  await assert.rejects(provider.patchDevice('rgb', { brightness: 101 }));
  await assert.rejects(provider.patchDevice('unknown', { on: true }), { code: 'NOT_FOUND' });
  await assert.rejects(provider.updateSettings({ wifiPassword: 'never-accepted-here' }));
  await provider.saveRule(rule({ id, enabled: false }));
  assert.equal((await provider.getStatus()).rules[0].enabled, false);
  await provider.deleteRule(id);
  for (let i = 0; i < LIMITS.rules; i++) await provider.saveRule(rule({ name: `กฎ ${i}`, enabled: false }));
  await assert.rejects(provider.saveRule(rule({ enabled: false })), { code: 'RULE_LIMIT' });
});

test('scene edits are previews until activation and defaults match specified behavior', async () => {
  const { provider } = simulation();
  await provider.updateScene('night', { devices: { rgb: { brightness: 15 } } });
  assert.equal((await provider.getStatus()).devices.rgb.brightness, 65);
  const night = await provider.activateScene('night');
  assert.equal(night.devices.rgb.color, '#a78bfa');
  assert.equal(night.devices.rgb.brightness, 15);
  assert.equal(night.devices.living.on, false);
  const work = await provider.activateScene('work');
  assert.equal(work.devices.living.on, true);
  assert.equal(work.devices.rgb.color, '#ffffff');
  assert.equal(work.security.armed, false);
});

test('offline simulation rejects writes and keeps last sample until reconnection', async () => {
  const { provider, advance } = simulation();
  const before = await provider.getStatus();
  const disconnected = await provider.setConnection(false);
  assert.equal(disconnected.updatedAt, before.updatedAt);
  await assert.rejects(provider.patchDevice('living', { on: true }), { code: 'OFFLINE' });
  await assert.rejects(advance(5000), { code: 'OFFLINE' });
  const reconnect = await provider.setConnection(true);
  assert.equal(reconnect.uptimeMs, 5000);
  assert.equal(reconnect.devices.living.on, false);
});

test('bounded persistence restores simulation and tolerates broken or unavailable storage', async () => {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
  const { provider, advance } = simulation(storage);
  await provider.patchDevice('rgb', { color: '#abcdef', brightness: 32 });
  for (let i = 0; i < 200; i++) {
    await provider.inject({ parking: i % 2 === 0 });
    await advance(5000);
  }
  const saved = await provider.getStatus();
  assert.equal(saved.events.length, LIMITS.events);
  assert.equal(saved.history.length, LIMITS.history);
  const restored = await simulation(storage).provider.getStatus();
  assert.equal(restored.devices.rgb.color, '#abcdef');
  assert.equal(restored.devices.rgb.brightness, 32);
  memory.set('smart-home-hub.simulation.v1', '{broken');
  assert.equal((await simulation(storage).provider.getStatus()).scene, 'home');
  const corrupt = { ...saved, scenes: [{ id: 'home' }, { id: 'home' }, { id: 'home' }, { id: 'home' }] };
  memory.set('smart-home-hub.simulation.v1', JSON.stringify(corrupt));
  assert.equal((await simulation(storage).provider.getStatus()).devices.rgb.color, '#29d6ab', 'structurally corrupt saved state must not leak into the UI');
  const brokenStorage = { getItem() { throw Error('Disabled'); }, setItem() { throw Error('Full'); } };
  assert.equal((await simulation(brokenStorage).provider.getStatus()).mode, 'simulation');
});

test('Live mode accepts null readings and never substitutes simulation data', async () => {
  const simulated = await simulation().provider.getStatus();
  const live = { ...simulated, mode: 'live', updatedAt: null, sensors: { ...simulated.sensors, temperature: null, humidity: null, lightRaw: null, lightPercent: null, potentiometer: null, error: true } };
  const provider = createLiveProvider({ fetchImpl: async () => reply(live) });
  assert.equal((await provider.getStatus()).sensors.temperature, null);
  const fake = createLiveProvider({ fetchImpl: async () => reply(simulated) });
  await assert.rejects(fake.getStatus(), { code: 'INVALID_RESPONSE' });
  const malformed = createLiveProvider({ fetchImpl: async () => reply({ schemaVersion: 1, mode: 'live' }) });
  await assert.rejects(malformed.getStatus(), { code: 'INVALID_RESPONSE' });
});

test('Live mutations await device acknowledgement and preserve errors without optimistic success', async () => {
  const base = { ...await simulation().provider.getStatus(), mode: 'live' };
  let release;
  const calls = [];
  const provider = createLiveProvider({ baseUrl: 'http://192.168.1.20/', apiKey: 'local-test', fetchImpl: async (url, init) => {
    calls.push({ url, init });
    await new Promise(resolve => { release = resolve; });
    return reply(base);
  } });
  let completed = false;
  const pending = provider.patchDevice('living', { on: true }).then(value => { completed = true; return value; });
  await Promise.resolve();
  assert.equal(completed, false);
  assert.equal(calls[0].url, 'http://192.168.1.20/api/devices/living');
  assert.equal(calls[0].init.headers['X-API-Key'], 'local-test');
  release();
  assert.equal((await pending).devices.living.on, false, 'actual acknowledged state wins over requested state');
  const failing = createLiveProvider({ fetchImpl: async () => reply({ error: 'วงจรยังไม่พร้อม', code: 'HARDWARE_DISABLED' }, 409) });
  await assert.rejects(failing.patchDevice('living', { on: true }), { code: 'HARDWARE_DISABLED', status: 409 });
});

test('Live reports timeout, JSON failure, network failure, and unsafe URL', async () => {
  const timeout = createLiveProvider({ timeoutMs: 5, fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))) });
  await assert.rejects(timeout.getStatus(), { code: 'TIMEOUT' });
  const invalidJson = createLiveProvider({ fetchImpl: async () => ({ ok: true, status: 200, json() { throw new SyntaxError(); } }) });
  await assert.rejects(invalidJson.getStatus(), { code: 'INVALID_RESPONSE' });
  const network = createLiveProvider({ fetchImpl: async () => { throw new TypeError('Failed to fetch'); } });
  await assert.rejects(network.getStatus(), { code: 'OFFLINE' });
  assert.throws(() => createLiveProvider({ baseUrl: 'javascript:alert(1)' }));
  assert.throws(() => createLiveProvider({ baseUrl: 'http://user:password@host/' }));
});

test('Live rule PATCH excludes immutable ID and timing limits match firmware', async () => {
  const live = { ...await simulation().provider.getStatus(), mode: 'live' };
  const requests = [];
  const provider = createLiveProvider({ fetchImpl: async (url, init) => { requests.push({ url, body: JSON.parse(init.body) }); return reply(live); } });
  await provider.saveRule(rule({ id: 'rule-1' }));
  assert.equal(requests[0].url, '/api/automation/rule-1');
  assert.equal(requests[0].body.id, undefined);
  assert.equal(requests[0].body.sensor, 'temperature');
  await assert.rejects(provider.updateSettings({ alarmDuration: 121 }));
  await assert.rejects(provider.updateSettings({ motionTimeout: 1.5 }));
  await assert.rejects(provider.saveRule(rule({ delaySeconds: 0.5 })));
});

test('malformed Live rules and scenes are rejected before reaching HTML', async () => {
  const live = { ...await simulation().provider.getStatus(), mode: 'live' };
  const injected = { ...live, rules: [rule({ id: 'rule-1" onclick="bad' })] };
  await assert.rejects(createLiveProvider({ fetchImpl: async () => reply(injected) }).getStatus(), { code: 'INVALID_RESPONSE' });
  await assert.rejects(createLiveProvider({ fetchImpl: async () => reply({ ...live, scenes: [{ id: 'home' }] }) }).getStatus(), { code: 'INVALID_RESPONSE' });
});
