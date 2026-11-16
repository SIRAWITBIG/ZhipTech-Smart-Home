import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulationProvider } from '../src/provider.js';
import { renderPage } from '../src/pages.js';

const context = { zone: 'entrance', chartKey: 'temperature', historyRange: 'all', search: '', logFilter: 'all', theme: 'dark', baseUrl: '', apiKey: '', online: true, busy: false };
const status = () => createSimulationProvider({ storage: null }).getStatus();

test('an expired alarm remains acknowledgeable and scenes display saved names', async () => {
  const state = await status();
  state.security.alarm = false;
  state.security.acknowledged = false;
  const html = renderPage('security', state, context);
  assert.match(html, /มีเหตุการณ์ที่ยังไม่รับทราบ/);
  assert.match(html, /data-security="acknowledge"\s*>/);
  state.scenes[0].name = 'บ้าน <script>ไม่ใช่ HTML</script>';
  const scenes = renderPage('scenes', state, context);
  assert.match(scenes, /บ้าน &lt;script&gt;/);
  assert.doesNotMatch(scenes, /บ้าน <script>/);
});

test('unsupported capabilities and offline entrance controls are disabled', async () => {
  const state = await status();
  state.capabilities = { automation: false, sceneEditing: false, maxEvents: 48, maxHistory: 60 };
  assert.match(renderPage('automation', state, context), /data-action="new-rule" disabled/);
  assert.match(renderPage('scenes', state, context), /data-edit-scene="home"[^>]*disabled/);
  assert.match(renderPage('map', state, { ...context, online: false }), /data-inject="doorbell" disabled/);
  assert.match(renderPage('logs', state, context), /สูงสุด 48 เหตุการณ์/);
  assert.match(renderPage('analytics', state, context), /สูงสุด 60 จุด/);
});

test('analytics filters uptime samples without NTP and counts actual event types', async () => {
  const state = await status();
  state.uptimeMs = 600000;
  state.history = [
    { timestamp: null, uptimeMs: 10000, temperature: 20, humidity: 50, lightPercent: 30 },
    { timestamp: null, uptimeMs: 500000, temperature: 24, humidity: 50, lightPercent: 30 },
  ];
  state.events = [
    { id: '1', timestamp: null, uptimeMs: 500000, type: 'motion', device: 'pir', source: 'simulation', message: 'motion' },
    { id: '2', timestamp: null, uptimeMs: 500001, type: 'parking', device: 'garage', source: 'simulation', message: 'parking' },
  ];
  const html = renderPage('analytics', state, { ...context, historyRange: '5' });
  assert.match(html, /1 จุดข้อมูล/);
  assert.match(html, /การเคลื่อนไหว<\/span><strong>1<\/strong>/);
  assert.match(html, /รถเข้า–ออก<\/span><strong>1<\/strong>/);
  assert.doesNotMatch(html, /2 จุดข้อมูล/);
});
