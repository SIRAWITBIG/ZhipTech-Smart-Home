# คู่มือเริ่มต้น

รุ่น Full Web มีบ้านสามมิติที่หมุนและเลือกห้องได้ อ่านวิธีใช้ที่ [คู่มือ 3D](3D_DASHBOARD.md) รุ่น ESP32 Lite ใช้แผนผัง 2D เพื่อประหยัดพื้นที่

## ใช้ Simulation บนเครื่อง

1. เปิด PowerShell ในโฟลเดอร์โปรเจกต์บน D แล้วรัน `npm.cmd run dev`
2. เปิด **http://127.0.0.1:5173** ตรวจว่าเป็น **ข้อมูลจำลอง / Simulation**
3. เริ่มจากภาพรวม เลือกโหมด Home/Away/Night/Work แล้วดูสถานะอุปกรณ์ที่เปลี่ยน
4. เปิดแผนผังบ้าน กดโซนที่ต้องการเพื่อเลือกอุปกรณ์ กดสวิตช์หรือปรับ RGB จากตัวควบคุม
5. ทดลองสถานการณ์ เช่น motion, รถเข้า/ออก, กริ่ง, อุณหภูมิ, แสง และ potentiometer จากแผงจำลอง
6. ทดลอง Away แล้วฉีด motion เพื่อดู alarm; ใช้ Mute, Acknowledge และ Disarm ตามหน้าความปลอดภัย
7. ทดลอง offline/sensor error แล้วคืนสถานะ ดูผลในหน้า logs และ analytics

Manual override จะอยู่จนเลือก Auto หรือ activate scene ใหม่ กฎ automation สั่งงานเฉพาะอุปกรณ์ใน Auto; hysteresis ป้องกัน relay สลับถี่ และ motion timeout ไม่ได้หมายความว่า PIR นับคนหรือยืนยันว่าห้องว่างได้

หากมี security alert ที่ยังไม่ acknowledge ระบบจะป้องกันการเลือก scene ที่ปิดเฝ้าระวัง ใช้ Acknowledge หรือ Disarm อย่างชัดเจนก่อน หากต้องการเลิกเฝ้าระวัง

ค่าระดับแสงเป็นเปอร์เซ็นต์สัมพัทธ์และ ADC raw ไม่ใช่ Lux ที่สอบเทียบ ส่วน IR แสดงว่าตรวจพบ/ไม่พบ ไม่ใช่ระยะทาง

## ตั้งค่าและข้อมูลในเครื่อง

Theme เลือกสว่าง, มืด หรือตามระบบ ข้อมูลจำลองอยู่ใน browser เดียวกันและอาจถูกล้างเมื่อเคลียร์ site data ใช้ Export CSV เพื่อเก็บ event ที่มีอยู่ ไม่ควรใช้เป็นที่เก็บประวัติระยะยาว

Reset ต้องยืนยันก่อน และใช้สำหรับข้อมูล/การตั้งค่าที่ UI ระบุ อ่านข้อความใน dialog ก่อนกด ข้อมูล Live เป็นสถานะบอร์ดจริง ไม่ถูกนำมาปะปนกับ simulation

## เตรียม ESP32 ก่อน Live

1. ตรวจรุ่นบอร์ดและอุปกรณ์ตาม `hardware/BOM.md`, `GPIO_MAP.md` และ `WIRING.md`
2. ยืนยัน supply, polarity และ signal output ทุกโมดูล ไม่สมมติว่าโมดูล 5V ต่อ GPIO 3.3V โดยตรงได้
3. เตรียม external pull-up สำหรับ GPIO39, resistors แยกช่อง RGB และ driver สำหรับ buzzer หากกระแสต้องการ
4. ตั้งค่าเฉพาะเครื่องใน `include/config_local.h` ตาม `include/config.h`; ห้าม commit รหัส Wi-Fi/API key
5. Build frontend และ compile firmware ตาม README; ตรวจผลก่อนขออนุญาต upload จริง
6. หลังวงจรผ่านการตรวจและได้รับอนุญาต จึง upload firmware กับ LittleFS และตรวจ IP จาก Serial/OLED
7. สำหรับใช้งานจริง เปิดเว็บจาก IP ของ ESP32 ใน LAN เดียวกัน เพื่อใช้ API แบบ same-origin โดยไม่ต้องตั้ง CORS

**ยังไม่มีการ flash บอร์ดในรอบเริ่มต้น** ค่า hardware access เริ่มต้นถูกปิดไว้จนยืนยัน configuration จึงอาจเห็น sensor unavailable แม้ network ทำงานได้

## เปลี่ยนเป็น Live

ใช้หน้าตั้งค่าเลือก Live และ API Base URL ของ ESP32 ที่เข้าถึงได้ ปล่อยว่างเพื่อใช้ same-origin เมื่อเว็บถูกเสิร์ฟจากบอร์ด API key อยู่ใน session/configuration ที่ UI รองรับ ไม่ควรใช้ Wi-Fi password แทน API key

หากเปิดจาก PC แล้วเรียก API ข้าม origin บอร์ดต้องอนุญาต origin ที่กำหนดไว้ มิฉะนั้น browser จะปิดกั้นการเชื่อมต่อ แนะนำ same-origin บนบอร์ดสำหรับรอบจริง HTTP บน LAN ไม่เทียบเท่า HTTPS และไม่ควรเปิด ESP32 เข้าจาก Internet โดยตรง

Live จะสำเร็จต่อเมื่อบอร์ดตอบรับ คำสั่งล้มเหลวต้องแสดง error และเมื่อ offline จะไม่เติมข้อมูลเซนเซอร์ปลอม ตรวจเวลาอัปเดตล่าสุดก่อนเชื่อข้อมูล

## เมื่อพบปัญหา

| อาการ | ตรวจสอบ |
| --- | --- |
| เปิดเว็บไม่ได้ | dev server ยังรันหรือไม่, port 5173 ถูกใช้หรือไม่, URL เป็น `127.0.0.1` |
| Live offline บน dev server | dev server ไม่มี ESP32 backend; ใช้ simulation หรือ IP ของบอร์ดจริง |
| ค่าสภาพแวดล้อมว่าง/error | hardware access ถูกปิดหรือไม่, DHT11 wiring/power/interval และชนิดโมดูล |
| Relay ตรรกะกลับด้าน | ตรวจ active HIGH/LOW จริงก่อนเปลี่ยน config; ห้ามสลับโดยเดา |
| RGB ถูก pot เขียนทับ | ทดสอบ soft takeover และ deadband กับช่วง ADC จริง |
| ข้อมูลหายหลังรีบูต | RAM history เป็น bounded ชั่วคราว; settings ที่ persist แยกจาก history |

ห้ามเชื่อมโหลด 220V โครงการนี้เป็นชุดสาธิตแรงดันต่ำ และยังต้องทดสอบวงจรและระบบร่วมกันก่อนใช้กับอุปกรณ์จริง
