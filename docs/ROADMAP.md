# Roadmap

## Milestone ล่าสุด: Branding + Interactive 3D

- เปลี่ยนเป็น ZhipTech - Smart Home และใช้ official logo เดิมโดยรักษาต้นฉบับ
- บ้าน Three.js แบบ procedural แยก renderer/model/provider พร้อม state binding; ตรวจผล UI รอบล่าสุดก่อนสรุป acceptance
- แยก Full3D `dist/` กับ ESP32 Lite `data/`; เตรียม Vercel config สำหรับ Simulation โดยไม่มี production deployment
- Firmware ปรับชื่อผลิตภัณฑ์/display/hostname และ compile ใหม่; ไม่เปลี่ยนวงจรหรือเปิด physical I/O
- Cloud backend/database/auth/device client, internet live control และ integration tests เป็น milestone ถัดไป ยังไม่ได้ implement หรือ provision

เป้าหมายผลิตภัณฑ์ **v1.0.0** แยกสิ่งที่พัฒนาได้บน PC ออกจากการยืนยันอุปกรณ์จริง

| Milestone | ผลงาน/เกณฑ์ยอมรับ | สถานะรอบเริ่มต้น |
| --- | --- | --- |
| M1 — Foundation | Workspace, architecture, API, design tokens, GPIO/configuration, PlatformIO | สร้างในรอบนี้; ดูหลักฐาน build/compile ใน QA |
| M2 — Simulation web | 9 หน้า, interactive3Dพร้อมSVG fallback, device/RGB controls, scenes, security, simulation faults, logs/history | พัฒนาแล้ว; อ่านผล QA ของแต่ละ milestone |
| M3 — Firmware foundation | REST canonical state, sensors/devices abstraction, automation, persistence, safe boot, LittleFS | พัฒนาเป็นฐานเริ่มต้น; compile แยกจาก hardware verification |
| M4 — Hardware validation | ยืนยันรุ่น ESP32 และโมดูล, แรงดัน/polarity, ต่อและทดสอบอุปกรณ์ทีละตัว | รออุปกรณ์จริงและข้อมูลผู้ใช้ |
| M5 — Integration | UI ↔ ESP32, command rejection, reconnect, safe sensor failure, override, scenes และ timing | รอการทดสอบบนบอร์ดจริง |
| M6 — Physical model | ยืนยันขนาดอุปกรณ์, ออกแบบฐาน/เคส, พิมพ์และประกอบบ้านจำลอง | ยังไม่สร้างไฟล์พิมพ์3Dจนยืนยันขนาด; โมเดลบนเว็บเป็น visual twin ไม่ใช่ชิ้นงานพิมพ์ |
| M7 — Release | endurance test, คู่มือ wiring ที่ตรวจจริง, วิดีโอสาธิต, Git review, version release | ยังไม่ปล่อยผลิตภัณฑ์จริง |

## การยืนยันที่ต้องได้ก่อนใช้งานจริง

- บอร์ดรุ่นใดและมี GPIO ตาม mapping ครบหรือไม่
- Relay active HIGH/LOW, แรงดัน supply/logic และวงจรขับ
- Photo sensor AO/DO, ทิศทางค่ากับความสว่าง และช่วงแรงดัน output
- IR module ชนิดใด, polarity และความเหมาะสมกับรถจำลอง
- RGB common anode/cathode และตัวต้านทานแต่ละสี
- OLED controller/address และขนาดจริง
- GPIO39 ใช้ external pull-up; input-only pins และ ADC1 ถูกต้อง
- Buzzer กินกระแสเท่าใด ต้องใช้ transistor/driver หรือไม่
- แหล่งจ่ายและสายไฟใช้ DC แรงดันต่ำอย่างเหมาะสม

การ push repository, upload firmware/filesystem และการทดสอบโหลดจริงต้องดำเนินการเมื่อได้รับอนุญาต ไม่มีการ publish cloud ในขอบเขตรอบนี้
