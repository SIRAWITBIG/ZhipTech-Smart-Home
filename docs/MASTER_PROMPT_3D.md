# ZhipTech - Smart Home | Development, Branding, 3D Dashboard, ESP32 & Vercel Integration

ให้คุณทำหน้าที่เป็น Senior Full-Stack Developer, Embedded Systems Engineer, IoT Architect, 3D Web Developer, UI/UX Designer และ Software QA Engineer

ดำเนินการพัฒนาต่อจากโปรเจกต์ปัจจุบันภายใน VS Code โดยอ้างอิงข้อกำหนดเดิมทั้งหมดร่วมกับข้อกำหนดล่าสุดในข้อความนี้ หากข้อกำหนดขัดแย้งกัน ให้ใช้ข้อความล่าสุดเป็นหลัก

## 1. ตรวจสอบโปรเจกต์ปัจจุบัน

ก่อนแก้ไขให้ตรวจสอบ Workspace, Git Status, Source Code, Dependencies, Firmware, API, Documentation และความคืบหน้าทั้งหมด

โปรเจกต์ปัจจุบันชื่อ ZhipTech - Smart Home

จากโครงสร้าง Workspace ปัจจุบัน มีรายการดังนี้

- .pio/
- .tools/
- data/
- docs/
- hardware/
- include/
- Logo/
- outputs/
- scripts/
- src/
- test/
- tmp/
- web/
- .gitignore
- package.json
- platformio.ini
- README.md

ให้พัฒนาต่อจากไฟล์เดิม ห้ามสร้างโปรเจกต์ซ้ำ ห้ามลบระบบที่ทำงานได้โดยไม่จำเป็น

ตรวจสอบเครื่องมือและ Skills ด้าน UI/UX, Browser Testing, Playwright, Chrome DevTools และเครื่องมือพัฒนาที่ติดตั้งอยู่แล้วก่อนเริ่มทำงาน

ทำงานภายใน Drive D ตามข้อกำหนดเดิม ห้ามแก้ไขไฟล์หรือโปรเจกต์อื่น และห้ามจัดการ Drive C โดยพลการ

## 2. Official Branding Update

ชื่อโปรเจกต์อย่างเป็นทางการคือ

**ZhipTech - Smart Home**

ฉันได้นำไฟล์โลโก้ที่ออกแบบและอนุมัติเรียบร้อยแล้วมาใส่ไว้ภายในโปรเจกต์ที่ตำแหน่ง

`Logo/ZhipTech - Smart Home - Logo.png`

ให้ตรวจสอบไฟล์ภาพนี้และนำไปใช้งานจริงบนเว็บไซต์

ข้อกำหนดสำคัญ:

- ใช้โลโก้ที่ฉันแนบมาเท่านั้น
- ห้ามสร้างโลโก้ใหม่
- ห้ามใช้ AI วาดโลโก้ทดแทน
- ห้ามเปลี่ยนรูปทรง สี สัดส่วน หรือตัวอักษร
- ห้ามเปลี่ยนรายละเอียดตัว h ในคำว่า Tech
- ห้ามเพิ่มสีเขียว Mint ลงในตัวโลโก้
- ห้ามเพิ่มคำขวัญหรือข้อความที่ไม่มีในโลโก้
- อนุญาตให้ปรับขนาดโดยรักษาสัดส่วนเดิม
- เก็บไฟล์ต้นฉบับไว้โดยไม่แก้ไข
- สามารถสร้าง Web Asset ที่ปรับขนาดและบีบอัดสำหรับเว็บไซต์ได้ โดยไม่เปลี่ยนเนื้อหาโลโก้
- หากยังไม่มี App Icon แยก ให้แจ้งฉัน ไม่ต้องสร้างไอคอนใหม่เอง

นำโลโก้ไปใช้ในส่วนที่เหมาะสม ได้แก่ Sidebar, Header, Loading Screen และหน้าเข้าสู่ระบบหากมี

สำหรับ Dark Mode ให้เลือกพื้นหลังหรือพื้นที่วางโลโก้ที่เหมาะสมกับภาพต้นฉบับ โดยไม่เปลี่ยนสีโลโก้

ตรวจสอบและเปลี่ยนชื่อ Smart Home Hub เดิมให้เป็น ZhipTech - Smart Home ใน Website Title, Metadata, README, Documentation, Firmware และส่วนแสดงผลที่เกี่ยวข้อง

## 3. UI/UX Redesign

ฉันจะแนบภาพ Reference หน้าเว็บไซต์ที่ต้องการให้ใช้เป็นแนวทางหลัก

ให้ปรับปรุงเว็บไซต์ให้ใกล้เคียงภาพ Reference ทั้งด้าน Layout, Typography, Spacing, Sidebar, Device Controls, Sensor Cards และโมเดลบ้าน 3D

Design Direction:

- Premium Smart Home Dashboard
- Modern Minimal
- Professional Technology Product
- Clean and Mature
- Dark Mode สีดำและเทาเข้มแบบ Notion
- Light Mode สีขาวสะอาด
- System Theme
- ใช้สีเขียว Mint เป็น Accent ของ UI ได้ แต่ไม่เปลี่ยนสีโลโก้
- ไม่ใช้ Neon Glow, Gradient หรือ Glassmorphism มากเกินความจำเป็น
- ใช้พื้นที่อย่างสมดุล
- ใช้ภาษาไทยเป็นหลัก
- ใช้ไอคอนที่สอดคล้องกันทั้งระบบ
- Responsive บน Desktop, Tablet และ Mobile

หน้า Dashboard ต้องประกอบด้วย:

- Sidebar Navigation พร้อมโลโก้จริง
- Top Bar
- สถานะการเชื่อมต่อ ESP32
- Simulation / Live Mode Indicator
- Home Scenes
- Temperature
- Humidity
- Light Level
- Security Status
- Interactive 3D House
- Room Selection
- Device Control Panel
- RGB Color Picker
- Brightness Slider
- Environment History Chart
- Recent Activity
- Notification Center

ให้โมเดลบ้าน 3D เป็นองค์ประกอบที่โดดเด่นที่สุดของหน้า Dashboard

ไม่ต้องเพิ่มฟังก์ชันกล้องวงจรปิด เซนเซอร์ควัน ระบบเปิดประตูอัตโนมัติ หรือระบบตรวจจับหน้าต่าง หากไม่มีฮาร์ดแวร์รองรับ

## 4. Interactive 3D Digital Twin

พัฒนาบ้าน 3D ให้มีคุณภาพใกล้เคียงภาพ Reference โดยต้องเป็นโมเดลสามมิติจริง ไม่ใช่ภาพนิ่งหรือภาพพื้นหลัง

ใช้ Three.js และ WebGL หรือรักษา 3D Engine เดิมหากมีระบบที่เหมาะสมอยู่แล้ว

ความสามารถหลัก:

- หมุนบ้านได้ 360 องศา
- Zoom In / Zoom Out
- Pan Camera
- Reset Camera
- คลิกเลือกห้อง
- คลิกอุปกรณ์
- Interactive Hotspots
- Smooth Camera Transition
- Highlight Selected Room
- Exterior View
- Cutaway View
- Floor View
- Day/Night View
- Fullscreen Mode

ออกแบบบ้าน Modern Minimal ให้สมจริง มีเฟอร์นิเจอร์ วัสดุ แสง เงา กระจก พื้นไม้ ต้นไม้ และองค์ประกอบภายในบ้านที่เหมาะสม

บ้านประกอบด้วย 6 โซนหลัก:

1. Living Room — ห้องนั่งเล่น
2. Bedroom — ห้องนอน
3. Garage — โรงจอดรถ
4. Garden & Pathway — สวนและทางเดิน
5. Main Entrance — ทางเข้า
6. Home Control Center — ศูนย์ควบคุม

หากยังไม่มีโมเดล GLB คุณภาพสูง ให้พัฒนาโมเดล Procedural 3D ที่มีรายละเอียดเพียงพอก่อน และเตรียมระบบรองรับโมเดลจาก Blender ภายหลัง

แยกการ Render โมเดลออกจาก Hardware Logic

โมเดล 3D ต้องใช้ Device State เดียวกับ Dashboard, API และ Firmware

ตัวอย่างการทำงาน:

- เปิด Relay CH1 แล้วไฟในห้องนั่งเล่นบนโมเดล 3D เปิดตาม
- ปิด Relay CH1 แล้วไฟในโมเดลดับ
- เปลี่ยนสี RGB LED แล้วแสงในห้องนอนเปลี่ยนตาม
- ปรับ Potentiometer แล้ว Brightness บนเว็บเปลี่ยนตาม
- IR ตรวจพบรถแล้วแสดงรถในโรงจอด
- PIR ตรวจพบการเคลื่อนไหวแล้วแสดง Motion Indicator
- Photo Sensor ตรวจพบความมืดแล้วแสดงไฟสวนเปิด
- กด Push Button แล้วแสดง Doorbell Notification
- Active Buzzer ทำงานแล้วแสดง Security Alert
- Relay CH2 ทำงานแล้วแสดง Climate Active โดยระบุว่าเป็นระบบปรับอากาศจำลอง

เป้าหมายคือ Digital Twin ที่สะท้อนสถานะของบ้านจำลองจริง

## 5. Hardware Inventory & GPIO

โครงงานนี้เป็นโครงการสาธิต Smart Home ที่ต้องใช้อุปกรณ์ทั้งหมด 16 รายการ

| No. | Hardware | GPIO ที่วางแผน | หน้าที่ |
|---|---|---|---|
| 1 | ESP32 Dev Module | — | Main Controller |
| 2 | Relay Module 2CH | 25, 26 | ไฟห้องนั่งเล่นและ Climate จำลอง |
| 3 | DHT11 | 4 | อุณหภูมิและความชื้น |
| 4 | PIR Module | 32 | ตรวจจับการเคลื่อนไหว |
| 5 | IR Module | 33 | ตรวจจับรถ |
| 6 | Photo Sensor | 34 | ตรวจวัดแสง |
| 7 | OLED I2C 128x64 | SDA 21, SCL 22 | แสดงสถานะ |
| 8 | Breadboard | — | ประกอบวงจร |
| 9 | LED 5mm | 23 และ Relay Load | ไฟสวนและไฟจำลอง |
| 10 | Resistors | — | จำกัดกระแสและปรับระดับสัญญาณ |
| 11 | Potentiometer | 35 | ปรับความสว่าง RGB |
| 12 | Push Button | 39 | กริ่งหน้าบ้าน |
| 13 | Active Buzzer | 18 | เสียงแจ้งเตือนภัย |
| 14 | Passive Buzzer | 19 | เสียงกริ่งและ Parking |
| 15 | Jumper Wires | — | เชื่อมต่อวงจร |
| 16 | RGB LED | R13, G14, B27 | Ambient Lighting |

GPIO Mapping นี้เป็นแผนเบื้องต้นสำหรับ ESP32 รุ่นดั้งเดิม ให้ตรวจสอบกับบอร์ดจริงก่อนใช้งาน

ข้อกำหนด:

- รวม GPIO Configuration ไว้ในไฟล์กลาง
- GPIO34, 35 และ 39 เป็น Input-only
- GPIO39 ต้องใช้ External Pull-up หากใช้กับปุ่มตามแผนนี้
- ใช้ ADC1 สำหรับ Analog Sensor ขณะเปิด Wi-Fi
- ตรวจสอบชนิด Photo Sensor และ IR Module
- ตรวจสอบว่า RGB เป็น Common Anode หรือ Common Cathode
- แยกตัวต้านทานจำกัดกระแสแต่ละสี RGB
- ตรวจสอบ Active HIGH/LOW ของโมดูล
- ตรวจสอบแรงดันและกระแสของอุปกรณ์ทุกตัว
- ตรวจสอบความจำเป็นของ Transistor Driver หรือ Logic Level Shifter
- ตรวจสอบ OLED Controller และ I2C Address
- ห้ามใช้ไฟบ้าน 220V
- ใช้โหลด DC แรงดันต่ำเท่านั้น
- ห้ามจ่ายไฟให้โหลดที่เกินพิกัดของ GPIO
- จัดทำ Wiring Diagram หลังยืนยันรุ่นฮาร์ดแวร์จริง

## 6. ESP32 Firmware Development

เขียน Firmware ESP32 ด้วย PlatformIO + Arduino Framework + C++ โดยตรวจสอบเวอร์ชัน Framework และ Library ที่มีอยู่จริง

ต้องพัฒนาระบบให้ครบทั้ง 8 Subsystems

1. Smart Lighting — PIR + Relay CH1
2. RGB Ambient Lighting — RGB PWM + Potentiometer
3. Smart Climate — DHT11 + Relay CH2
4. Smart Parking — IR + Passive Buzzer
5. Smart Outdoor Lighting — Photo Sensor + LED
6. Smart Security — PIR + Active Buzzer
7. Smart Doorbell — Push Button + Passive Buzzer
8. Home Control Center — OLED I2C

แยกโค้ดเป็น Modular Components เช่น

- Sensor Manager
- Device Controller
- RGB Controller
- Relay Controller
- Buzzer Manager
- Display Manager
- Automation Engine
- Security Manager
- Scene Manager
- Wi-Fi Manager
- Local Web Server
- Cloud Client
- Configuration Manager
- Event Logger

Firmware Requirements:

- Non-blocking Loop
- millis() หรือ Scheduler
- Sensor Filtering
- Button Debounce
- Hysteresis
- Relay Minimum Switching Interval
- PWM Brightness Control
- Safe Boot State
- Wi-Fi Auto Reconnect
- Sensor Error Handling
- Command Validation
- Configuration Persistence
- Preferences / NVS
- Bounded Event Buffer
- Watchdog ตามความเหมาะสม
- Serial Debug Logging
- NTP Time Synchronization
- Firmware Version Reporting
- Local Automation เมื่อ Internet หลุด

ห้ามใช้ delay() แบบยาวที่ทำให้ระบบไม่ตอบสนอง

OLED ต้องแสดงข้อมูลที่เหมาะสมกับหน้าจอ 128x64 ได้แก่ Temperature, Humidity, Home Scene, Wi-Fi, IP Address และสถานะ Cloud Connection

ให้แยกสถานะของ Hardware Output, Desired State และ Reported State อย่างชัดเจน

## 7. Web Application Pages

รักษาและพัฒนาหน้าเว็บไซต์ทั้ง 9 หน้าให้ใช้งานได้จริง

1. Dashboard — ภาพรวมและ Digital Twin
2. Home Map — บ้าน 3D และการเลือกห้อง
3. Devices — ควบคุมอุปกรณ์
4. Automation — ตั้งเงื่อนไข IF–THEN
5. Scenes — Home, Away, Night, Work
6. Security — ระบบเฝ้าระวังและแจ้งเตือน
7. Analytics — กราฟข้อมูลย้อนหลัง
8. Activity Logs — ประวัติคำสั่งและเหตุการณ์
9. Settings — ตั้งค่าระบบ เครือข่ายและอุปกรณ์

ทุกหน้าต้องใช้ Design System และ State Management เดียวกัน

ห้ามสร้างปุ่มหรือเมนูที่ไม่มีการทำงานจริงโดยไม่ระบุสถานะ

## 8. Home Scenes & Automation

รองรับ Home, Away, Night และ Work

| System | Home | Away | Night | Work |
|---|---|---|---|---|
| Living Room | Auto | Off | Off | On |
| Outdoor Light | Auto | Auto | Auto | Auto |
| Climate | Auto | Off | Auto | Auto |
| RGB | Custom | Off | Purple 20% | White |
| Security | Disarmed | Armed | Disarmed | Disarmed |
| Parking | Enabled | Enabled | Enabled | Enabled |
| Doorbell | Enabled | Enabled | Enabled | Enabled |

สร้าง Automation Engine บน ESP32 เพื่อให้ทำงานได้แม้ไม่มีเว็บเปิดอยู่

ตัวอย่างกฎ:

- ตรวจพบการเคลื่อนไหว → เปิดไฟตามเงื่อนไข
- ไม่มีการเคลื่อนไหวตามเวลาที่กำหนด → ปิดไฟ
- อุณหภูมิสูงกว่า Threshold → เปิด Relay CH2
- แสงต่ำกว่า Threshold → เปิดไฟสวน
- Away Mode + Motion Detection → เปิด Alarm
- รถเข้าโรงจอด → แจ้งเตือนและส่งเสียงตอบสนอง
- กดกริ่ง → ส่ง Event ไปยังเว็บ

รองรับ Manual Override และกำหนดลำดับความสำคัญระหว่าง Automation, Scene และ Manual Control

ห้ามให้ Potentiometer เขียนทับ Brightness จากเว็บตลอดเวลา ให้ใช้ Deadband หรือ Soft Takeover

## 9. Simulation, Local Live & Cloud Live

พัฒนาระบบเชื่อมต่อเป็น 3 โหมด โดยใช้ UI และ Data Contract เดียวกัน

### Simulation Mode

- ทดลองระบบได้โดยไม่ต้องเปิด ESP32
- จำลองค่าของ Sensor
- จำลองเหตุการณ์การเคลื่อนไหว
- จำลองรถเข้าออก
- จำลองการกดกริ่ง
- จำลองการปรับ Potentiometer
- ทดสอบ RGB และ Relay
- ทดสอบ Automation
- ทดสอบ Home Scenes
- ทดสอบ Sensor Error และ Offline
- แสดงข้อความว่าข้อมูลเป็นข้อมูลจำลองอย่างชัดเจน

### Local Live Mode

- เชื่อมกับ ESP32 ผ่าน Local Wi-Fi
- อ่านค่า Sensor จริง
- ควบคุม GPIO และอุปกรณ์จริง
- รองรับ Local REST API
- สามารถควบคุมพื้นฐานได้เมื่อ Internet ใช้งานไม่ได้
- พิจารณา Lite Dashboard บน ESP32 ผ่าน LittleFS หากพื้นที่ Flash รองรับ

### Cloud Live Mode

- เว็บไซต์ Hosted บน Vercel
- เชื่อม ESP32 ผ่าน Cloud API และ Persistent Database
- ควบคุมจากภายนอกเครือข่ายได้เมื่อระบบออนไลน์
- ESP32 ส่ง Telemetry และดึงคำสั่งผ่าน HTTPS
- รองรับ Device Authentication
- รองรับ User Authentication สำหรับเจ้าของอุปกรณ์
- มี Online/Offline และ Last Seen
- มี Command Acknowledgement
- ไม่ใช้ข้อมูลจำลองแทนข้อมูลจริงโดยไม่แจ้ง

เมื่ออุปกรณ์ Offline ต้องแสดงข้อมูลล่าสุดพร้อมเวลาที่อัปเดต และไม่กล่าวอ้างว่าคำสั่งถูกดำเนินการสำเร็จ

## 10. Cloud Architecture & Vercel

ปรับ Architecture ให้รองรับการ Deploy บน Vercel อย่างเหมาะสม

โครงสร้างที่ต้องการ:

Physical Devices
↕
ESP32 Firmware
↕
Outbound HTTPS / Wi-Fi
↕
Cloud API & Persistent Database
↕
Vercel Web Application
↕
Desktop / Mobile Browser

ตรวจสอบ Architecture ปัจจุบันก่อนเลือกวิธีเชื่อมต่อ

หากยังไม่มี Cloud Backend ให้พิจารณา Supabase สำหรับ Database, Authentication และ Realtime หรือบริการที่เหมาะสมกับระบบเดิม โดยตรวจสอบข้อจำกัดของ Free Tier และค่าใช้จ่ายก่อนใช้งาน

เสนอเหตุผลที่เลือก Architecture และหลีกเลี่ยงการใช้หลาย Cloud Service โดยไม่จำเป็น

ข้อกำหนด:

- Vercel รับผิดชอบ Hosting หน้าเว็บและ Server-side API ตามความเหมาะสม
- เก็บสถานะถาวรในฐานข้อมูลภายนอก ไม่ใช้ RAM ของ Serverless Function เป็นฐานข้อมูล
- พัฒนาให้ ESP32 เป็นฝ่ายเริ่มการเชื่อมต่อออกไปยัง Cloud ผ่าน HTTPS
- ไม่เปิด Port Forwarding เข้าสู่ ESP32
- ไม่อาศัย Public Website เรียก Private IP ของ ESP32 โดยตรง
- ไม่ปิด Certificate Verification เพื่อให้ HTTPS ทำงาน
- ไม่ Hardcode Credentials หรือ API Keys
- จำกัดความถี่ของ Telemetry และ Polling เพื่อลด Cloud Usage
- รองรับ Retry และ Exponential Backoff
- ตรวจสอบ Timeout และ Rate Limit
- เก็บ Automation หลักบน ESP32
- ไม่ให้ Cloud Failure ทำให้ระบบ Local หยุดทำงาน
- แยก Public Simulation Demo ออกจาก Private Live Control

สำหรับหน้าเว็บสาธารณะ ผู้เข้าชมทั่วไปควรทดลอง Simulation Mode ได้ แต่ไม่สามารถสั่งงานบ้านจริงของฉันได้

## 11. Cloud Database & Device Synchronization

หากยังไม่มีฐานข้อมูล ให้สร้าง Schema และ Migration สำหรับข้อมูลที่จำเป็น เช่น

- users / profiles
- devices
- device_state
- telemetry
- commands
- command_results
- automation_rules
- scenes
- events
- settings

ปรับชื่อและจำนวนตารางตาม Architecture จริงได้

ระบบส่งคำสั่งต้องรองรับ:

- Unique Command ID
- Device ID
- Command Type
- Desired State
- Created Time
- Expiration Time
- Pending
- Applied
- Failed
- Expired
- Acknowledgement

ป้องกันการทำคำสั่งซ้ำด้วย Idempotency หรือ Deduplication

ห้ามนำคำสั่งที่หมดอายุแล้วกลับมาสั่งอุปกรณ์หลังเชื่อมต่อใหม่

เมื่อ ESP32 ได้รับคำสั่ง ให้ตรวจสอบความถูกต้องก่อนควบคุม Hardware แล้วส่ง Reported State และผลการดำเนินการกลับไปยัง Cloud

กรณีผู้ใช้เปลี่ยนสถานะจากอุปกรณ์จริง ต้องอัปเดตข้อมูลในหน้าเว็บและโมเดล 3D ด้วย

ต้องระบุให้ชัดเจนว่า Reported State ของ Relay เป็นสถานะที่ Firmware สั่งงาน ไม่ใช่การยืนยันทางกายภาพว่าโหลดทำงานจริง หากไม่มี Feedback Sensor

## 12. API Development

ตรวจสอบ REST API เดิมและพัฒนาต่อยอด

Endpoint ตัวอย่าง:

GET /api/health

GET /api/status

GET /api/sensors

GET /api/devices

PATCH /api/devices/{id}

GET /api/scenes

POST /api/scenes/activate

GET /api/automation

POST /api/automation

PATCH /api/automation/{id}

DELETE /api/automation/{id}

GET /api/history

GET /api/events

GET /api/settings

PATCH /api/settings

POST /api/security/arm

POST /api/security/disarm

POST /api/security/acknowledge

สำหรับ Cloud Device API ให้เพิ่ม Endpoint ที่เหมาะสม เช่น

POST /api/device/telemetry

POST /api/device/heartbeat

GET /api/device/commands

POST /api/device/commands/ack

ออกแบบ Request/Response Schema ให้ตรงกันทั้ง Frontend, Cloud Backend และ ESP32 Firmware

สามารถปรับ Endpoint ให้เหมาะกับระบบจริงได้ แต่ต้องจัดทำ API Documentation และ Update Data Contract

## 13. Security Requirements

เนื่องจากเว็บไซต์จะเปิดใช้งานผ่าน Internet ต้องให้ความสำคัญกับความปลอดภัย

- HTTPS
- User Authentication
- Device Authentication
- Authorization
- Input Validation
- Rate Limiting
- Device Ownership
- Secure Environment Variables
- Database Access Policies
- Row Level Security หากใช้ Supabase
- ป้องกันการควบคุมอุปกรณ์โดยบุคคลภายนอก
- แยกสิทธิ์ผู้ชม Demo กับเจ้าของอุปกรณ์
- ตรวจสอบคำสั่งก่อนดำเนินการ
- ไม่เปิดเผยรหัสผ่าน Wi-Fi ผ่าน API
- ไม่บันทึก Token หรือ Secret ใน Log
- ไม่ Commit ไฟล์ Credentials
- ไม่ใส่ Service Role Key หรือ Secret Key ใน Frontend Bundle

ระบบนี้เป็นโครงการสาธิต ไม่ใช่ระบบรักษาความปลอดภัยหรือควบคุมไฟฟ้าที่ผ่านการรับรอง

## 14. Prepare for GitHub & Vercel Deployment

เตรียมโปรเจกต์ทั้งหมดให้พร้อม Deploy จาก GitHub ไปยัง Vercel

ตรวจสอบ Framework และ Build System ปัจจุบันก่อนแก้ไข

ดำเนินการดังนี้

- ตรวจสอบ package.json
- ตรวจสอบ Production Build
- ตรวจสอบ Build Command
- ตรวจสอบ Output Directory
- ตรวจสอบ Root Directory
- สร้างหรือปรับ vercel.json เมื่อจำเป็น
- ตรวจสอบ SPA Routing และ API Routing ไม่ให้ Rewrite ทับกัน
- ตรวจสอบ Asset Paths
- ตรวจสอบเส้นทางโหลด GLB, GLTF, Texture และ Logo
- ตรวจสอบ Environment Variables
- สร้าง .env.example
- ตรวจสอบ .gitignore
- แยกไฟล์ Firmware, Cache และ Build Output ที่ไม่จำเป็นต่อการ Deploy
- เตรียม Production Configuration
- เตรียม Preview Deployment Configuration
- ตรวจสอบขนาด Web Bundle
- Optimize 3D Assets
- ตรวจสอบ Error 404 และ Production Routing
- จัดทำคู่มือ Deployment

หากใช้ Vite ให้ตรวจสอบการตั้งค่า Environment Variables ที่มี Prefix VITE_ และห้ามใส่ Secret ในตัวแปรที่ถูกเผยแพร่ไปยัง Browser

ห้าม Push ขึ้น GitHub, สร้าง Cloud Resource ที่มีค่าใช้จ่าย หรือ Deploy Production โดยไม่ได้รับอนุญาตจากฉัน

ให้เตรียมทุกอย่างจนพร้อมสำหรับ Deploy และแจ้งสิ่งที่ฉันต้องตั้งค่าด้วยตนเอง

## 15. Performance Optimization

เว็บไซต์ 3D ต้องทำงานได้ดีทั้งคอมพิวเตอร์และโทรศัพท์

- Lazy Loading
- Code Splitting
- Optimize GLB Models
- Texture Compression เมื่อเหมาะสม
- ลด Draw Calls
- ปรับ Pixel Ratio ตามอุปกรณ์
- Quality Presets
- Low / Medium / High
- ปรับ Shadow Resolution
- ลด Animation เมื่อเปิด Reduced Motion
- Pause Rendering เมื่อไม่จำเป็น
- Dispose Three.js Resources
- รองรับ 2D Floor Plan Fallback
- ป้องกัน Memory Leak
- Responsive Layout

ให้ใช้ Browser และ GPU ประมวลผลกราฟิก ไม่ใช่ ESP32

## 16. Testing & Validation

ให้ทดสอบระบบจริงเท่าที่ Environment รองรับ

Frontend:

- Navigation ทั้ง 9 หน้า
- Desktop / Tablet / Mobile
- Light / Dark / System Theme
- 3D Interaction
- Room Selection
- Device Controls
- RGB Slider
- Home Scenes
- Automation
- Simulation Mode
- Offline State
- Production Build

Firmware:

- PlatformIO Compile
- GPIO Configuration
- Sensor Drivers
- Relay Control
- PWM
- Button Debounce
- Buzzer Scheduling
- OLED
- Wi-Fi Recovery
- Local API
- Cloud Client
- Command Validation
- Safe Boot State

Integration:

- Frontend/API Contract
- Simulation State
- Local State
- Cloud State
- Command Acknowledgement
- Device Offline
- Cloud Failure
- Network Recovery
- Duplicate Commands
- Expired Commands
- Unauthorized Access

ใช้ Playwright และ Browser Screenshot ตรวจสอบ UI เทียบกับภาพ Reference

ตรวจสอบและแก้ไขข้อผิดพลาดที่พบ ไม่ใช่เพียงรายงานปัญหาแล้วหยุดทำงาน

ห้ามรายงานว่าทดสอบฮาร์ดแวร์จริงแล้ว หากยังไม่ได้เชื่อมต่ออุปกรณ์

## 17. Documentation

อัปเดตเอกสารให้ตรงกับระบบล่าสุด

- README.md
- docs/ARCHITECTURE.md
- docs/API.md
- docs/ROADMAP.md
- docs/TEST_PLAN.md
- docs/DEPLOYMENT.md
- docs/USER_GUIDE.md
- docs/BRANDING.md
- hardware/BOM.md
- hardware/GPIO_MAP.md
- hardware/WIRING.md

สามารถปรับชื่อเอกสารตามโครงสร้างเดิมได้

จัดทำคู่มือสำหรับ:

- เปิดเว็บบนเครื่อง
- เปิด Simulation Mode
- ตั้งค่า PlatformIO
- Compile Firmware
- Upload Firmware
- ต่อสายอุปกรณ์
- ตั้งค่า Wi-Fi
- ทดสอบ Local API
- ตั้งค่า Cloud Backend
- ตั้งค่า Authentication
- ตั้งค่า Environment Variables
- Deploy ผ่าน GitHub และ Vercel
- ตรวจสอบและแก้ไขปัญหาการเชื่อมต่อ

## 18. Execution Plan

ให้เริ่มดำเนินการทันทีตามลำดับ

Phase 1 — Audit & Branding

ตรวจสอบโปรเจกต์ปัจจุบัน นำโลโก้จริงไปใช้งาน เปลี่ยนชื่อโปรเจกต์และอัปเดต Branding

Phase 2 — Premium 3D UI

ปรับ Dashboard และหน้าเว็บให้ตรงกับภาพ Reference พัฒนาโมเดลบ้าน 3D และ Device Controls ให้ใช้งานได้จริง

Phase 3 — ESP32 Firmware

เขียนและปรับปรุงโค้ดสำหรับอุปกรณ์ทั้ง 16 รายการ พัฒนาระบบย่อยทั้ง 8 ระบบ และ Compile Firmware

Phase 4 — API & Integration

เชื่อม Firmware, Local API, Simulation Mode และหน้าเว็บผ่าน Data Contract เดียวกัน

Phase 5 — Cloud Integration

พัฒนา Cloud Backend, Database, Authentication, Telemetry, Commands และ Device State Synchronization

Phase 6 — Deployment Preparation

เตรียม GitHub และ Vercel Configuration พร้อม Environment Variables และ Production Build

Phase 7 — Quality Assurance

ทดสอบระบบ แก้ไขข้อผิดพลาด ตรวจสอบ UI ผ่าน Browser และอัปเดต Documentation

## 19. Final Report

เมื่อทำงานแต่ละ Phase ให้สรุปผลเป็นภาษาไทย โดยระบุ

- สิ่งที่พัฒนาสำเร็จจริง
- รายการไฟล์ที่สร้างหรือแก้ไข
- Screenshot ของเว็บไซต์
- ผล Frontend Build
- ผล Firmware Compile
- ผลการทดสอบ
- Architecture ที่เลือกและเหตุผล
- วิธีเปิดเว็บไซต์บนเครื่อง
- วิธี Upload ESP32
- ตาราง GPIO ล่าสุด
- วิธีเชื่อม ESP32 กับเว็บไซต์
- Environment Variables ที่ต้องตั้งค่า
- ขั้นตอน Deploy บน Vercel
- ค่าใช้จ่ายหรือข้อจำกัดของ Cloud Service
- สิ่งที่ฉันยังต้องดำเนินการ
- สิ่งที่ยังไม่ได้ทดสอบจริง

หากพบข้อจำกัด ให้แจ้งอย่างตรงไปตรงมาและทำส่วนที่สามารถดำเนินการต่อได้ก่อน

ยังไม่ต้อง Flash Firmware จนกว่าจะตรวจสอบบอร์ดและการต่อสายจริงร่วมกัน

ห้ามหยุดเพียงแค่การวางแผน ให้ตรวจสอบโปรเจกต์ปัจจุบันและเริ่มลงมือเขียนโค้ดจริง

เป้าหมายสุดท้ายคือ ZhipTech - Smart Home ที่มีเว็บไซต์ 3D คุณภาพสูง เชื่อมต่อกับ ESP32 และอุปกรณ์จริงได้ รองรับการควบคุมภายในและภายนอกเครือข่ายอย่างเหมาะสม พร้อมสำหรับ Deploy ขึ้น Vercel และนำไปสาธิตเป็นโครงงานจริง

เริ่มดำเนินการได้เลย