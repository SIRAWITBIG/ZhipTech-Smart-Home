import test from 'node:test';
import assert from 'node:assert/strict';
import {isLocalHost} from '../src/connection-policy.js';

test('direct ESP32 controls are permitted on loopback and RFC1918 origins', () => {
  for (const host of ['localhost', 'LOCALHOST', 'localhost.', '127.0.0.1', '127.42.1.8', '::1', '[::1]', '10.0.0.1', '172.16.0.1', '172.31.255.255', '192.168.0.42']) {
    assert.equal(isLocalHost(host), true, host);
  }
});

test('public origins and addresses adjacent to private ranges cannot enable Local Live', () => {
  for (const host of ['example.com', 'preview.vercel.app', 'localhost.example.com', 'esp32.local.example.com', '172.15.255.255', '172.32.0.1', '192.169.0.1', '11.0.0.1', '8.8.8.8', '169.254.1.1', '0.0.0.0', '[2001:db8::1]']) {
    assert.equal(isLocalHost(host), false, host);
  }
});

test('mDNS names are accepted while malformed hosts and suffix spoofing are rejected', () => {
  assert.equal(isLocalHost('zhiptech-home.local'), true);
  assert.equal(isLocalHost('ESP32.local.'), true);
  for (const host of ['', null, undefined, 'local', '.local', 'bad..local', '-bad.local', 'bad-.local', 'a'.repeat(64)+'.local', '192.168.1.256', '192.168.1.01', '127.1', '127.0.0.1:5173', 'http://localhost', ' localhost', 'localhost ']) {
    assert.equal(isLocalHost(host), false, String(host));
  }
});
