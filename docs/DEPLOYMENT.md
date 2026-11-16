# Deployment preparation — ZhipTech - Smart Home

สถานะนี้เตรียม **เว็บ 3D Simulation** สำหรับ hosting เท่านั้น ไม่มี Cloud API, database, authentication หรือ ESP32 outbound HTTPS client ที่พร้อมควบคุมบ้านผ่าน Internet และยังไม่ได้ deploy หรือ push

## แยก Full และ Lite

`npm run build` สร้าง `dist/` รวม Three.js, OrbitControls, procedural house, offline font และ official logo Browser รับภาระ WebGL ทั้งหมด ส่วน `npm run build:lite` สร้าง `data/` ใช้ SVG fallback โดยไม่รวม Three.js/house engine/model และใส่ `window.HUB_LITE=true` ก่อนโหลด app

รัน `npm run preview` เพื่อตรวจ production assets บน loopback ได้หลังหยุด dev server ที่พอร์ตเดียวกัน Hash routes เช่น `/#map` ทำงานโดยไม่ต้อง rewrite `/api/*` ไปหน้า HTML

## GitHub → Vercel หลังได้รับอนุญาต

โฟลเดอร์นี้ยังไม่มี `.git` ขั้นเตรียมก่อนเผยแพร่จริงคือ review ไฟล์, secrets และขอบเขต repository จากนั้นจึง init/commit/push ภายใต้การอนุญาตของผู้ใช้ ห้ามนำ `.tools`, `.pio`, `data`, `dist`, `outputs`, `tmp`, config ส่วนตัว หรือ credentials ขึ้น GitHub

| Vercel setting | Value |
| --- | --- |
| Framework preset | Other (`framework: null`) |
| Root directory | ราก repository นี้ |
| Install command | `npm ci --ignore-scripts` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 หรือใหม่กว่าที่ Vercel รองรับและผ่าน build |
| Environment variables | ไม่มีที่จำเป็นสำหรับ Simulation |

`vercel.json` เก็บค่าข้างต้นและ headers พื้นฐานไว้แล้ว ไม่มี catch-all rewrite จึงไม่กลืน API errors เป็น HTML Assets ใช้ absolute root paths; ให้ hosting ที่ domain root ไม่ใช่ subdirectory

หลังอนุญาต deployment: เชื่อม repository กับ Vercel → ตรวจ Preview Deployment ก่อน → ตรวจโลโก้ ฟอนต์ 3D/2D fallback และทั้ง9 routes → ตรวจ Console/Network ไม่พบ404 → ทดสอบ browser มือถือ → อนุมัติ Production โดยผู้ใช้ ไม่มี live house credentials ใน public demo

ราคา/แผน: ยังไม่ได้สร้างบริการหรือก่อค่าใช้จ่าย Vercel Hobby ระบุการใช้ส่วนตัวที่ไม่ใช่เชิงพาณิชย์ จึงต้องตรวจว่าโครงการ/การจำหน่ายชุด kit เหมาะกับแผนใดก่อนเผยแพร่จริง และตรวจ quota/ราคาล่าสุดที่ [Hobby plan](https://vercel.com/docs/plans/hobby) และ [pricing](https://vercel.com/pricing) ไม่ได้สรุปว่าการใช้แบรนด์เพื่อธุรกิจเข้าเกณฑ์ Hobby โดยอัตโนมัติ

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
