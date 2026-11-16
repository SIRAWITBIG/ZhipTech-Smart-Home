# 3D release verification — 17 November 2026

Scope: the latest **ZhipTech - Smart Home** branding and interactive house request. Earlier foundation results remain in [QA.md](QA.md). This is a local development milestone, not a cloud deployment or physical hardware certification.

## Build verification

- Node syntax check: **17 files passed**.
- Node tests: **25/25 passed**, including origin policy, providers and UI contracts.
- Full Web: **36 assets / 3,184,265 bytes** raw plus gzip in `dist/`.
- ESP32 Lite: **25 assets / 532,704 bytes** raw plus gzip in `data/`.
- Both firmware variants compiled after branding updates. No flash/upload.
- LittleFS image: **1,441,792 bytes**; unpacked **25/25 SHA-256 hashes matched** generated Lite assets.
- Source/output and gzip integrity verified. Detailed commands, sizes and firmware hashes: [BUILD_RESULTS.md](../hardware/BUILD_RESULTS.md).

## Rendered browser checks

Used Playwright connector (no Browser plugin available), rendered Chromium with WebGL and inspected saved screenshots. Tests use Simulation; they do not drive actual hardware.

| Check | Observed result |
| --- | --- |
| Real renderer | One WebGL canvas, procedural furniture/house/landscape visible |
| Branding | Approved logo loaded at natural width648; proportional uncropped asset |
| Polling lifecycle | Same canvas retained after2.2s polling; camera retained |
| Camera | Mouse drag and keyboard arrow change projected room positions; zoom changes them; reset returns position within3px |
| View modes | Cutaway, exterior and floor selected successfully; model walls restored across views |
| Day/night | Display state switches without changing provider scene |
| Quality | Low/high/medium selected successfully without console errors |
| Fullscreen | Browser fullscreen entered and exited |
| Room selection | Bedroom hotspot updates inspector; raycast onto bedroom in floor view updates inspector |
| Device sync | Living switch, RGB swatch, parking simulation and scene changes reflected in renderer state |
| Responsive | No horizontal document overflow at390,768,1568px widths; canvas widths354,518,944px |
| Mobile layout | Chart and activity corrected to one column; inspected at390px; selected room label retained |
| WebGL unavailable | Intentionally blocked WebGL; SVG fallback appeared, room selection and RGB control remained available |
| Full build | Served `dist/` on local5184: 3D renders, logo loads, nine routes navigated, exactly one canvas after returning |
| Offline dependencies | Full build made zero requests outside its local origin |
| Lite build | Served `data/` on local5185: `HUB_LITE=true`, one architectural SVG, zero canvases, no vendor requests, controls enabled |
| Public-host guard | Intercepted reserved HTTPS host `smart-home.example` served local assets: stale Live preference forced Simulation; Local/Cloud options disabled; crafted Live submit rejected; zero API requests |
| Production console | Zero warnings, errors or uncaught page errors during Full/Lite smoke checks |

Screenshots: [Desktop](../outputs/design/3d-desktop-final.png), [Tablet](../outputs/design/3d-tablet-final.png), [Mobile](../outputs/design/3d-mobile-final.png). Earlier `3d-desktop.png` and `3d-night.png` are intermediate design captures, not final output.

## Limits

No physical phone/GPU benchmarking or touch-gesture device testing. No claim of measured FPS or photorealistic rendering. Cloud backend, authentication, database and internet ESP32 transport remain unimplemented. Vercel configuration is prepared but has not been deployed. No Git repository was initialized, no push and no hardware flash occurred. A separate approved App Icon was not supplied; the original logo is preserved and no replacement icon was invented.
