# ผลตรวจ Smart Home Hub — 17 พฤศจิกายน 2026

เอกสารนี้เป็นผลตรวจรุ่นเริ่มต้นก่อนปรับแบรนด์และเพิ่ม 3D ดูผลล่าสุดที่ [QA_3D.md](QA_3D.md) และ [Build results](../hardware/BUILD_RESULTS.md)

รอบเริ่มต้นตาม [Master Prompt](MASTER_PROMPT.md) สร้างเว็บจำลองและ firmware foundation พร้อม API contract โดยไม่มีการ upload/flash, push GitHub หรือเผยแพร่เว็บสู่ cloud

## Environment และคำสั่งที่รันจริง

- Workspace: `D:\ZhipTech\Projects\ZhipTech - Smart Home` เดิมว่าง ไม่ได้แก้โครงการอื่น
- Node.js 24.20.0, npm 11.19.0, Git 2.56.0.windows.4
- Portable Python/PlatformIO และ cache อยู่ใน `.tools/` บน D; อ่านรายละเอียดใน [Firmware notes](../hardware/FIRMWARE_NOTES.md)
- `npm.cmd run check` และ `npm.cmd run lint`: PASS ตรวจ syntax JavaScript 11 ไฟล์; ไม่ใช่ ESLint/type checker
- `npm.cmd test`: PASS 22/22 กรณี (19 provider tests และ 3 UI contract regressions)
- `npm.cmd run build`: PASS 18 assets, **403,504 bytes** รวม raw + gzip จากงบ 1,250,000 bytes
- Firmware compile: PASS ทั้ง default hardware-disabled และ enabled-driver compile-only; ดู [หลักฐาน build](../hardware/BUILD_RESULTS.md)
- LittleFS build: PASS image 1,441,792 bytes; แตกตรวจ SHA-256 ตรงกับ `data/` ทั้ง 18/18 ไฟล์
- Development server: `http://127.0.0.1:5173` ผูกกับ loopback

การตรวจพื้นที่ว่าง Drive D ผ่าน Get-PSDrive ไม่คืนค่า Free ใน executor นี้ จึงไม่รายงานตัวเลขพื้นที่ว่าง; การเขียนไฟล์และ build ที่กล่าวถึงข้างต้นสำเร็จจริง

## Browser verification

ใช้ Playwright connector เพราะไม่มี Browser plugin/skill ในเซสชันนี้ ตรวจที่ desktop **1568 × 1004** (ขนาดเดียวกับ concept) และ mobile **390 × 844** พร้อม screenshot และอ่านภาพด้วย `view_image` ทั้ง concept, desktop ล่าสุดและ mobile มืด/สว่าง

| Check | Actual result |
| --- | --- |
| Page identity / meaningful content | PASS title, H1 และหน้าจริงครบ 9 routes |
| Blank page / framework overlay | PASS ไม่พบ; ใช้ Vanilla JS ไม่มี framework overlay |
| Console normal operation | PASS 0 errors / 0 warnings หลัง reload รอบสุดท้าย |
| Intentional Live failure | HTTP 503 จาก dev server แสดง Offline/ไม่มีข้อมูล; resource error ใน console ระหว่างทดสอบนี้เป็นผลที่คาดไว้ |
| Desktop / mobile overflow | PASS ทั้ง 9 หน้า ไม่ล้นแนวนอน |
| Light / Dark / System | PASS เปลี่ยนผ่าน UI; System ตาม browser media preference |
| Mobile navigation | PASS เปิด drawer เลือกหน้าแล้วปิดเมนู |
| House map | PASS คลิก zone tabs และเลือกโรงรถด้วย Enter บน SVG focus target; inspector เปลี่ยนตามห้อง |
| Scenes / devices / RGB | PASS Work เปิดไฟตาม scene, เลือกสีและ brightness43%, scene name edit แสดงชื่อที่บันทึก |
| Rule editor | PASS สร้างกฎ, Motion เปลี่ยนเป็น eq/hysteresis0; regression tests ตรวจ validation/capabilities |
| Security | PASS arm + motion -> alert; alarm timeout ยัง acknowledge ได้ -> armed ต่อ; disarm ทำงาน |
| Sensor/network failures | PASS Sensor Error/null environmental data; offline ปิด controls, reconnect กลับได้ |
| Settings / polling | PASS กรอกชื่อไทยและ timeout42, focus Save รอ2.3วินาที ค่ายังอยู่; บันทึกและ reload แล้วยังตรง |
| Provider switch race | PASS หน่วง request Live เก่า2.4วินาที แล้วสลับเป็น Simulation; OLD_PROVIDER_ERROR ไม่เขียนทับแหล่งข้อมูลใหม่ |
| Activity / export | PASS filter ค้นหากฎ, CSV download ชื่อ smart-home-hub-events.csv; เรียงใหม่สุดและป้องกัน formula prefix |
| Live isolation | PASS เมื่อไม่มี ESP32: ไม่มี metrics/switches หรือข้อมูลจำลองปะปน, กลับ Simulation ผ่าน form ได้ |

การทดสอบ Live error/race ใช้ dev server และ Playwright interception ของ error เท่านั้น ไม่ได้เชื่อม ESP32 จริง ส่วน unit tests ใช้ fetch test doubles เพื่อยืนยัน contract และ acknowledgement ไม่ใช่หลักฐาน hardware integration

## Design fidelity ledger

Concept และ prompt brief: [Design specification](DESIGN.md), `outputs/design/dashboard-concept.png` สร้างด้วย built-in ImageGen ภาพต้นฉบับภายใน Codex อยู่บน C ตามข้อจำกัดเครื่องมือ; สำเนาโครงการและ screenshots อยู่บน D ภาพ concept ไม่รวมใน LittleFS

| Comparison point | Concept / render / outcome |
| --- | --- |
| Information architecture | Sidebar 9 หน้า, topbar, scenes/metrics, map+inspector, chart+activity คงโครงสร้างตามแนวทาง |
| Palette | Neutral charcoal + mint, semantic amber/red; ไม่มี blue gradient หรือ glow ครอบ UI |
| Typography | แก้ fallback font ที่อ่านไทยไม่สม่ำเสมอ เป็น Noto Sans Thai ฝังในโครงการ; ตรวจ loaded/computed font และภาพจริง |
| Icons | SVG outline ชุดเดียว stroke1.7 สำหรับ navigation, devices, chevrons และ status; สีตามสถานะ |
| House asset | ปรับ rendered raster miniature เป็น interactive architectural SVG ตามข้อกำหนด lightweight/พื้นที่ ESP32; ไม่อ้างว่าเป็นภาพ 3D แบบเดียวกับ concept |
| Device scope | ตัด door/window/smoke sensors ที่ ImageGen แต่งเพิ่ม; ใช้ PIR/IR/DHT11/photo/buzzer ตาม inventory จริง และย้าย RGB inspector ไปห้องนอน |
| Panel alignment | แก้ map ที่สั้นกว่า right column ให้ stretch เสมอกัน; screenshot ล่าสุดไม่มีช่องว่างจากความสูงผิดแนว |
| Data/copy | Navigation, H1, scene labels คงตาม spec; date, measurements, event timestamps และกราฟใช้สถานะขณะนั้น ไม่มีการสร้างประวัติหลายชั่วโมงตามภาพ concept |
| Responsive | มือถือเป็นคอลัมน์เดียว มี labeled zone tabs แทนตัวอักษรเล็กบนแผนผัง, touch controls และ navigation drawer |

ตรวจ above-the-fold copy ด้วย DOM เทียบรายการใน Design spec แล้ว: ชื่อผลิตภัณฑ์, 9 nav labels, H1 และ Home/Away/Night/Work ถูกต้อง การเพิ่ม Simulation notice, date จริง, บริบทบ้าน/ห้องและ error/capability banners เป็นการปรับเพื่อการใช้งานจริงตาม Master Prompt ไม่ใช้ tagline ภาษาอังกฤษที่ไม่จำเป็น

ตรวจตาม design spec ที่ปรับสำหรับฮาร์ดแวร์จริงแล้วด้วยภาพคู่ concept/render; ความต่างด้าน SVG, copy ตามข้อมูลจริง, ขนาด/spacing และ mobile continuation เป็นการปรับที่บันทึกไว้ ไม่อ้าง pixel-identical fidelity หรือการรับรองจาก design agency

## ข้อจำกัดและงานถัดไป

ยังไม่ได้ทดสอบบน ESP32 จริง: GPIO/แรงดัน/active polarity, DHT accuracy, PIR warmup/ตำแหน่งตรวจจับ, IR/photo calibration, RGB current, buzzer driver, OLED controller/address, safe boot waveform, Wi-Fi recovery, NVS endurance, peak heap, LittleFS mount และ frontend/API ผ่านเครือข่ายจริง ต้องยืนยันรุ่นและวงจรก่อนอนุญาต upload

การตั้งค่า Wi-Fi ผ่านเว็บยัง disabled; ใช้ private config ตามคู่มือ ไม่มี cloud, camera, voice assistant, workspace booking หรือ 3D files เฟิร์มแวร์ default ปิด physical I/O จนกว่าจะ review configuration ระบบเป็นต้นแบบสาธิต ไม่ใช่ security product ที่ผ่านการรับรอง และยังไม่ใช่ release v1.0.0 ที่ผ่าน hardware acceptance

## Screenshots

- [Desktop final full page](../outputs/design/dashboard-desktop.png)
- [Desktop native concept viewport](../outputs/design/dashboard-desktop-viewport.png)
- [Mobile dark final](../outputs/design/dashboard-mobile-dark.png)
- [Mobile light final](../outputs/design/dashboard-mobile-light.png)
- [Generated concept](../outputs/design/dashboard-concept.png)
