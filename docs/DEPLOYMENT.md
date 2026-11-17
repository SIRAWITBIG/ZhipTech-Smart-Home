# Production deployment — ZhipTech - Smart Home

เผยแพร่ **เว็บ 3D Simulation** ที่ https://zhiptech-smart-home.vercel.app แล้ว โดยใช้ [GitHub Repository](https://github.com/SIRAWITBIG/ZhipTech-Smart-Home) และ [Vercel Project](https://vercel.com/sirawit-sukhrip/zhiptech-smart-home) ไม่มี Cloud API, database, authentication หรือ ESP32 outbound HTTPS client ที่พร้อมควบคุมบ้านผ่าน Internet

## แยก Full และ Lite

`npm run build` สร้าง `dist/` รวม Three.js, OrbitControls, procedural house, offline font และ official logo Browser รับภาระ WebGL ทั้งหมด ส่วน `npm run build:lite` สร้าง `data/` ใช้ SVG fallback โดยไม่รวม Three.js/house engine/model และใส่ `window.HUB_LITE=true` ก่อนโหลด app

รัน `npm run preview` เพื่อตรวจ production assets บน loopback ได้หลังหยุด dev server ที่พอร์ตเดียวกัน Hash routes เช่น `/#map` ทำงานโดยไม่ต้อง rewrite `/api/*` ไปหน้า HTML

## GitHub → Vercel

Repository `SIRAWITBIG/ZhipTech-Smart-Home` ใช้ default/production branch `main` และเชื่อมกับ Vercel Git integration แล้ว การเผยแพร่ source เป็น Public Showcase ยังคงสงวนลิขสิทธิ์ตาม README และไม่เพิ่ม open-source license `.gitignore` ป้องกัน `.tools`, `.pio`, `data`, `dist`, `outputs`, `tmp`, `.vercel`, `.env` และ config ส่วนตัว สคริปต์ `npm run audit:release` ตรวจ index, historical blobs ที่ดึงมา และ dist ด้วยรูปแบบ credentials โดยไม่พิมพ์ค่าที่ตรวจพบ

| Vercel setting | Value |
| --- | --- |
| Framework preset | Other (`framework: null`) |
| Root directory | ราก repository นี้ |
| Install command | `npm ci --ignore-scripts` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 24.x ตาม package.json และ project settings |
| Environment variables | ไม่มีที่จำเป็นสำหรับ Simulation |

`vercel.json` เก็บค่าข้างต้นและ headers พื้นฐานไว้แล้ว ไม่มี catch-all rewrite จึงไม่กลืน API errors เป็น HTML Assets ใช้ absolute root paths; ให้ hosting ที่ domain root ไม่ใช่ subdirectory

Root Directory ใช้ราก repository เพราะ `package.json`, lockfile และ `scripts/build.mjs` อยู่ที่ราก; สคริปต์คัดลอกจาก `web/` ไป `dist/` ห้ามเปลี่ยนเป็น `web/` โดยไม่ปรับ architecture `.vercelignore` ตัด firmware/documents/cache จาก CLI upload แต่เก็บ `web/src/` ทั้งหมดไว้ ไม่ใช้ pattern `src/` ที่อาจตัด nested web source

Push `main` สร้าง Production อัตโนมัติ ส่วน development/feature branches สร้าง Preview; deployment URL ของ Preview อาจมี Vercel Authentication ตาม project protection แต่ production domain เปิดเข้าชมได้โดยไม่ Login

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run check
npm.cmd test
npm.cmd run build
git add .
npm.cmd run audit:release
git commit -m "Describe the update"
git push origin main
```

ตรวจสถานะ build ใน GitHub Actions และ Vercel Dashboard แล้วเปิด Production URL ตรวจ flow ที่แก้ไข ไม่ต้อง deploy CLI ซ้ำเมื่อ Git integration ทำงานตามปกติ ถ้าต้องพัฒนาแยก ใช้ `git switch -c feature/ชื่อเรื่อง` แล้ว push branch เพื่อรับ Preview ก่อน merge เข้า `main`

ใช้ทีม Vercel เดิมในแผน Hobby สำหรับ demo นี้ ไม่ได้เพิ่มแผนเสียเงินหรือสร้าง database/backend เพิ่ม ตรวจเงื่อนไขและ quota ที่ [Hobby plan](https://vercel.com/docs/plans/hobby) ก่อนขยายไปใช้เชิงพาณิชย์

การตั้งค่า build อ้างอิง [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json) ตรวจเอกสารในรอบพัฒนานี้

## Local ESP32

1. ยืนยันรุ่น ESP32/Flash, GPIO, polarity, supply และวงจรตาม hardware docs
2. คัดลอก `include/config_local.example.h` เป็น `include/config_local.h` (ignored) ตั้ง Wi-Fi/API key และ exact allowed origin หากจำเป็น ห้ามส่งรหัสผ่านใน log หรือ commit
3. รัน `npm run build:lite`, compile firmware และ `buildfs` ตรวจขนาด/ผลลัพธ์
4. หลังผู้ใช้อนุญาตแล้วจึง upload โดยคำสั่งด้านล่างเป็นคู่มือ ไม่ได้รันในรอบนี้:

```powershell
$env:PLATFORMIO_CORE_DIR = Join-Path $PWD '.tools\platformio'
$env:TEMP = Join-Path $PWD '.tools\tmp'
$env:TMP = $env:TEMP
& '.\.tools\python\python.exe' -m platformio run -e esp32dev -t upload
& '.\.tools\python\python.exe' -m platformio run -e esp32dev -t uploadfs
& '.\.tools\python\python.exe' -m platformio device monitor -b 115200
```

5. เปิด IP จาก Serial/OLED ใน LAN เดียวกัน เรียก `/api/health` และ `/api/status` ด้วย API key ที่ตั้ง แล้วใช้ Local Live แบบ same-origin

Full 3D dashboard ใช้ PC local server เชื่อม ESP32 REST ผ่าน exact allowed origin ได้เมื่อเครือข่าย/วงจรพร้อม เว็บ HTTPS สาธารณะไม่ควรเรียก private IP ของ ESP32 โดยตรงและไม่ใช้ port forwarding

## Cloud milestone ที่ยังต้องพัฒนา

แนวทางที่จะประเมิน: Vercel host frontend/API + persistent database/authentication หนึ่งบริการ เช่น Supabase โดยต้องตรวจแผนบริการ/ค่าใช้จ่ายและ ownership ก่อนสร้าง resource; ไม่ใช้ RAM ใน serverless เป็นฐานข้อมูล

ต้องมี schema/migrations, RLS/ownership, device auth, validated telemetry, bounded retention และ rate limits; command ID, desired state, expiry, pending/applied/failed/expired และ acknowledgement; ESP32 outbound HTTPS พร้อม certificate validation, retry/backoff และ deduplication; ทดสอบ duplicate/expired/unauthorized/offline commands ก่อนเปิด Cloud Live

`.env.example` ระบุเฉพาะ PORT ที่ local server รองรับ ไม่มี cloud variables ที่ทำให้เข้าใจว่ามี backend แล้ว ห้ามใส่ secret ใน frontend/`VITE_` variables ที่เผยแพร่สู่ browser
