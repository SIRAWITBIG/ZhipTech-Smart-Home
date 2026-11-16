# ZhipTech - Smart Home — 3D dashboard

บ้านสามมิติจริงสร้างด้วย Three.js/WebGL ตามภาพอ้างอิงล่าสุด เป็นโมเดลสไตล์ architectural miniature ภายในเว็บ ไม่ใช่ภาพนิ่ง พื้นที่มีห้องนั่งเล่น ห้องนอน ศูนย์ควบคุม โรงรถ ทางเข้า และสวน พร้อมเฟอร์นิเจอร์ รถ ต้นไม้ ทางเดิน และแสงไฟ

## เปิดและควบคุม

รัน `npm.cmd run dev` จากโฟลเดอร์โปรเจกต์ แล้วเปิด http://127.0.0.1:5173 เลือกภาพรวมหรือแผนผังบ้าน

- ลากเมาส์ซ้าย/หนึ่งนิ้วเพื่อหมุน เลื่อนล้อ/บีบนิ้วเพื่อซูม คลิกขวาลาก/สองนิ้วเพื่อเลื่อน
- เลือกป้ายห้องหรือส่วนโมเดลเพื่อเปิดแผงควบคุมห้องนั้น ป้ายในโมเดลจะขยับกล้องเข้าห้อง ปุ่มห้องด้านบนเปลี่ยนตัวควบคุมโดยเก็บมุมกล้องไว้
- เปิดหลังคา: ลดผนังกั้นเพื่อเห็นเฟอร์นิเจอร์ ภายนอก: คืนหลังคาและผนัง แปลนพื้น: มุมบนพร้อมผนังเตี้ย
- ปุ่มดวงอาทิตย์/จันทร์เปลี่ยนแสงของการแสดงผลเท่านั้น ไม่สั่ง Scene หรืออุปกรณ์
- ปุ่มบวก/ลบซูม ปุ่มลูกศรวนคืนมุมเริ่มต้น ปุ่มจอภาพขยายเต็มจอ
- เลือกคุณภาพต่ำ/กลาง/สูงเพื่อปรับเงาและความละเอียด คุณภาพต่ำเหมาะกับเครื่องที่การ์ดจอช้า
- เมื่อ canvas มี focus ใช้ลูกศรเพื่อหมุน `+`/`-` เพื่อซูม และ `Home` เพื่อคืนมุมกล้อง

## สถานะที่เชื่อมกับระบบ

ไฟห้องนั่งเล่น ไฟสวน ไฟ RGB/ความสว่าง ระบบปรับอากาศจำลอง รถในโรงจอด PIR และสัญญาณเตือนใช้สถานะจาก provider เดียวกับแดชบอร์ด ไม่สร้างข้อมูล Live ขึ้นเอง กริ่งเลือกได้จากโมเดลและทดลองผ่านแผงควบคุมทางเข้า การ polling ไม่สร้าง canvas ใหม่ และไม่รีเซ็ตมุมกล้อง ผู้ใช้ยังใช้แผงควบคุมได้หากเปิด WebGL ไม่สำเร็จ ระบบจะแสดงแผนผัง SVG แทน

การแสดงผลนี้เป็นโมเดลจำลองสำหรับสาธิต ไม่ใช่แบบ CAD ของบ้านจริงหรือ photorealistic render การทดสอบทำบน Chromium ในคอมพิวเตอร์และขนาด viewport มือถือ ไม่ได้ทดสอบ GPU/สัมผัสบนโทรศัพท์จริง

## Full Web และ Lite

`npm.cmd run build` สร้าง `dist/` สำหรับคอมพิวเตอร์หรือ Vercel พร้อม Three.js และฟอนต์ที่เก็บในโปรเจกต์ ไม่มี runtime CDN

`npm.cmd run build:lite` สร้าง `data/` สำหรับ ESP32 LittleFS โดยตัด Three.js และโมเดล 3D ใช้แผนผัง SVG พร้อมระบบควบคุมชุดเดิม รายละเอียดที่ [Deployment](DEPLOYMENT.md)

เว็บบน public host เปิดเป็น Simulation และปิด Local Live; Cloud Live ยังไม่พัฒนา จึงยังไม่มีการควบคุม ESP32 ผ่านอินเทอร์เน็ต Local Live เปิดได้บน localhost, loopback, IP ส่วนตัว หรือชื่อ `.local` เท่านั้น แบรนด์ใช้ไฟล์โลโก้จริงตาม [Branding](BRANDING.md)

## โครงสร้าง

| File | Responsibility |
| --- | --- |
| `web/src/house-model.js` | Geometry, materials, rooms, device visuals and disposal |
| `web/src/house-engine.js` | WebGL rendering, camera, picking, shadows, projection and controls |
| `web/src/house-view.js` | Lazy loading, retained canvas lifecycle and SVG fallback |
| `web/src/twin.css` | Responsive 3D surface and brand placement |
| `web/src/connection-policy.js` | Public/local origin policy |

Animation frames are requested only during camera changes, resize or state updates. Rendering pauses when hidden/offscreen. Geometry, materials, observers and WebGL resources are disposed when leaving the house pages. The model uses instanced foliage and bounded shadow quality. No per-frame React/app rerender is involved.

Three.js is pinned in `package-lock.json`; see [official WebGLRenderer documentation](https://threejs.org/docs/#WebGLRenderer) and [OrbitControls](https://threejs.org/docs/#OrbitControls). Rebuild vendor assets with `npm.cmd run vendor` after a deliberate library upgrade.
