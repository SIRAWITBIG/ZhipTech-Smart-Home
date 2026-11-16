# ZhipTech - Smart Home

เว็บควบคุมบ้านจำลองพร้อม **Interactive 3D Digital Twin** และเฟิร์มแวร์ ESP32 สำหรับชุดสาธิตแรงดันต่ำ ชื่อและโลโก้ใช้ตามข้อกำหนดล่าสุดของผู้ใช้ รุ่นปัจจุบันยังเป็น development milestone ของเป้าหมาย v1.0.0

Workspace: `D:\ZhipTech\Projects\ZhipTech - Smart Home` พัฒนาต่อในโครงการเดิม

Production: **https://zhiptech-smart-home.vercel.app** · [Private GitHub repository](https://github.com/SIRAWITBIG/ZhipTech-Smart-Home) · [Vercel dashboard](https://vercel.com/sirawit-sukhrip/zhiptech-smart-home)

`main` เชื่อมกับ Vercel Production; branch อื่นสร้าง Preview ตาม Git integration เว็บสาธารณะเป็น Simulation และปิดการควบคุม ESP32 จริง ดู [การเผยแพร่และอัปเดต](docs/DEPLOYMENT.md)

## เปิดเว็บ

ใช้ Node.js 24.x และ npm ตัวเว็บใช้ Vanilla JavaScript กับ Three.js **0.187.0** ที่ตรึงเวอร์ชันไว้ การเรนเดอร์บ้านทำบน GPU ของ browser

```powershell
Set-Location -LiteralPath 'D:\ZhipTech\Projects\ZhipTech - Smart Home'
# เครื่องที่มี vendor พร้อมแล้ว เปิดได้ทันที:
npm.cmd run dev
```

เปิด **http://127.0.0.1:5173** แล้วทดลองใน Simulation Mode หลัง clone ใหม่ให้ติดตั้งและสร้าง vendor ในโครงการก่อน:

```powershell
$env:npm_config_cache = Join-Path $PWD 'tmp\npm-cache'
$env:TEMP = Join-Path $PWD 'tmp'
$env:TMP = $env:TEMP
npm.cmd ci --ignore-scripts
npm.cmd run vendor
npm.cmd run dev
```

Three.js, controls, ฟอนต์ไทยและโลโก้โหลดจากไฟล์ในเว็บ ไม่เรียก CDN ขณะใช้งาน ฟอนต์และ engine มีใบอนุญาตรวมไว้กับ assets

## Build และทดสอบ

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run build:lite
```

| Command | Output / purpose |
| --- | --- |
| `npm.cmd run build` | `dist/` เว็บ 3D เต็มสำหรับ browser/hosting |
| `npm.cmd run build:lite` | `data/` รุ่น SVG Lite สำหรับ ESP32 LittleFS; ไม่มี Three.js/โมเดล 3D |
| `npm.cmd run preview` | ตรวจ `dist/` ที่ `http://127.0.0.1:5173` หลังหยุด dev server ที่ใช้พอร์ตเดียวกัน |
| `npm.cmd run check` / `lint` | ตรวจ syntax ด้วย Node.js ไม่ใช่ ESLint/type checker |
| `npm.cmd test` | Provider และ UI contract tests |

Full build ใช้เพดานรวม raw+gzip 12MB ส่วน Lite ใช้ 1,250,000 bytes ต่ำกว่าพื้นที่ LittleFS ที่ตั้งไว้ Build เขียนเฉพาะไฟล์ generated ที่มี manifest และไม่ลบไฟล์ผู้ใช้อื่น ห้ามแก้ `dist/` หรือ `data/` ด้วยมือ

## เว็บและสถานะอุปกรณ์

มี 9 หน้า: Dashboard, Home Map, Devices, Automation, Scenes, Security, Analytics, Activity Logs และ Settings บ้าน 3D ใช้สถานะเดียวกับ controls และ provider; ไม่มี hardware logic แยกใน renderer

- **Simulation:** ทดลองเซนเซอร์, relay/RGB, scenes, rules, alarm และ offline ได้บน PC พร้อมป้ายข้อมูลจำลอง
- **Local Live:** REST API จาก ESP32 ใน LAN; รอ acknowledgement ก่อนแสดงผลสำเร็จ ไม่เติมค่าจำลองเมื่อ offline
- **Cloud Live:** ยังไม่ได้พัฒนา backend/database/authentication/device HTTPS client ใน milestone บ้าน 3D นี้ UI จึงยังไม่เปิดใช้งาน การเตรียม Vercel หมายถึงเว็บ Simulation เท่านั้น

ชื่อโลโก้ต้นฉบับคือ `Logo/ZhipTech - Smart Home - Logo.png` เก็บเดิมโดยไม่แก้ไข ดู [Branding](docs/BRANDING.md) ยังไม่มี App Icon แยกที่อนุมัติ จึงไม่สร้างทดแทน

## Firmware

PlatformIO + Arduino ESP32 Core ตามเวอร์ชันใน [platformio.ini](platformio.ini) ชุดเครื่องมืออยู่บน D ใน `.tools/`:

```powershell
$env:PLATFORMIO_CORE_DIR = Join-Path $PWD '.tools\platformio'
$env:TEMP = Join-Path $PWD '.tools\tmp'
$env:TMP = $env:TEMP
& '.\.tools\python\python.exe' -m platformio run -e esp32dev
& '.\.tools\python\python.exe' -m platformio run -e esp32dev-hardware-compile
# ต้อง build:lite ก่อนสร้าง filesystem image
& '.\.tools\python\python.exe' -m platformio run -e esp32dev -t buildfs
```

ค่าเริ่มต้น `HUB_HARDWARE_ENABLED=0` ปิด GPIO จนกว่าจะตรวจบอร์ด โมดูล แรงดันและวงจรจริง คำสั่งข้างต้น compile/build เท่านั้น ไม่ได้ flash Firmware ไม่ได้ใช้ ESP32 ประมวลผลกราฟิก

หลังผู้ใช้ยืนยันอุปกรณ์และอนุญาตให้ upload แล้วเท่านั้น จึงใช้ `-t upload` และ `-t uploadfs` ตาม [Deployment guide](docs/DEPLOYMENT.md) ก่อนหน้านั้นตรวจ [GPIO](hardware/GPIO_MAP.md) และ [Wiring](hardware/WIRING.md)

## เอกสาร

- [Architecture](docs/ARCHITECTURE.md), [API contract](docs/API.md), [Roadmap](docs/ROADMAP.md)
- [คู่มือใช้งาน](docs/USER_GUIDE.md), [Deployment/Vercel และขอบเขต Cloud](docs/DEPLOYMENT.md)
- [Branding](docs/BRANDING.md), [Design](docs/DESIGN.md)
- [วิธีใช้บ้าน 3D](docs/3D_DASHBOARD.md), [ผลตรวจ 3D ล่าสุด](docs/QA_3D.md), [ข้อกำหนดล่าสุด](docs/MASTER_PROMPT_3D.md)
- [Firmware build results](hardware/BUILD_RESULTS.md), [Toolchain/limitations](hardware/FIRMWARE_NOTES.md)
- [QA รอบเริ่มต้น](docs/QA.md) เป็นประวัติการทดสอบก่อน 3D; ใช้รายงานรอบล่าสุดประกอบ

ยังไม่ได้ทดสอบวงจรหรือคำสั่ง Live บน ESP32 จริง ไม่มีการ flash ฮาร์ดแวร์ Cloud Live/backend ยังไม่พัฒนา โครงการใช้เฉพาะโหลด DC แรงดันต่ำ และการ compile ไม่ยืนยันการทำงานของโหลดทางกายภาพ
