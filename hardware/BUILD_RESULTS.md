# ZhipTech - Smart Home — Build results, 2026-11-17

ดำเนินการใน workspace บน Drive D โดยใช้ portable Python/PlatformIO ใน `.tools/` ไม่มีคำสั่ง upload/flash และไม่ได้เชื่อมทดสอบวงจรจริง

| Check | Actual result |
|---|---|
| `python -m platformio run -e esp32dev` | PASS — hardware disabled by default |
| `python -m platformio run -e esp32dev-hardware-compile` | PASS — enabled driver compile only |
| `npm run check` | PASS — syntax check of 17 JavaScript files; not ESLint/type checking |
| `npm test` | PASS — 25/25 provider, rendering and connection-policy tests |
| `npm run build` | PASS — full 3D web in `dist/`, 36 files |
| `npm run build:lite` | PASS — ESP32 SVG Lite in `data/`, 25 files |
| Output/source and gzip verification | Both manifests cover every output file; every raw asset matches current source; gzip content matches raw. Lite index has the expected flag insertion |
| `python -m platformio run -e esp32dev -t buildfs` | PASS — final Lite frontend, official logo and offline Thai font |
| LittleFS unpack and SHA-256 comparison | All 25 files match `data/` byte-for-byte |
| Production preview HTTP smoke | PASS — index, engine, Three modules, logo, font; `/api/status` is 503 JSON and unknown path is 404, not HTML |

| Artifact / memory | Value |
|---|---:|
| Default app flash usage | 882,153 / 1,310,720 bytes (67.3%) |
| Default static RAM | 47,024 / 327,680 bytes (14.4%) |
| Enabled driver app flash usage | 907,761 / 1,310,720 bytes (69.3%) |
| Enabled driver static RAM | 47,424 / 327,680 bytes (14.5%) |
| Default `firmware.bin` file | 888,736 bytes |
| Enabled driver `firmware.bin` file | 914,336 bytes |
| Full web assets (36 files, raw + gzip) | 3,184,265 / 12,000,000 byte build budget |
| Lite frontend assets (25 files, raw + gzip) | 532,704 / 1,250,000 byte build budget |
| `littlefs.bin` image | 1,441,792 bytes (partition size) |

Static RAM report does not include runtime heap: the central JSON document allocates 65,536 bytes; API buffers, Wi-Fi, drivers and garbage collection also consume heap. Peak memory and runtime reliability remain untested on hardware.

SHA-256:

```text
.pio/build/esp32dev/firmware.bin
E4838CD688A32A22676F582CCB126717E9372043F0B463CFF0671C9E8D95FC7F

.pio/build/esp32dev-hardware-compile/firmware.bin
910883A3E44929DC0FE52AEA7288EE75C2EA0F8791B278C0A37239E5819D19DA

.pio/build/esp32dev/littlefs.bin
DA594A398299061090C95E3C14A837CE573F1CBE615C7FE0200A3C644267AA1A
```

Node 24.20.0 / npm 11.19.0 / Three.js 0.187.0 / Git 2.56.0.windows.4. `git rev-parse` confirms this project has no repository, so there is no commit, remote, push or deployment to report.

PlatformIO Core 6.1.18 / Espressif32 6.12.0 / Arduino ESP32 2.0.17 / toolchain Xtensa 8.4.0+2021r2-patch5. Current compile logs are local in `.tools/tmp/firmware-branding-build.log` and `.tools/tmp/littlefs-branding-build.log`; packaging/hash evidence is `.tools/tmp/littlefs-branding-verification.json`. The unpacker required a relative destination path on this Windows toolchain; the successful retry used the same project-local output folder.

Three.js and OrbitControls are pinned and vendored with the MIT license, with no runtime CDN requests. Full and Lite use separate guarded manifests. Lite explicitly excludes the Three.js vendor directory and `house-engine.js`/`house-model.js`, retains the `house-view.js` bootstrap and sets `window.HUB_LITE=true` before app initialization. The full production bundle is not copied into LittleFS.

The image check proves packaging consistency only. It does not prove real ESP32 Flash size, LittleFS mount, GPIO behavior, wiring, electrical safety, Wi-Fi recovery, live HTTP/API behavior, sensor accuracy or physical model fit. Those checks require the actual board/modules and explicit upload authorization.
