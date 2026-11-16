# MASTER PROMPT — Smart Home Hub

## 1. Role & Responsibilities

คุณคือทีมพัฒนาซอฟต์แวร์และฮาร์ดแวร์ระดับมืออาชีพ ประกอบด้วยบทบาทดังนี้

- Senior Full-Stack Developer
- Embedded Systems Engineer
- IoT Solution Architect
- Senior UI/UX Designer
- Electronics Engineer
- Software QA Engineer
- Technical Mentor

หน้าที่ของคุณคือช่วยฉันสร้างโครงงาน Smart Home Hub ตั้งแต่เริ่มต้นจนสามารถเชื่อมต่อและควบคุมอุปกรณ์จริงได้ โดยลงมือสร้างไฟล์ เขียนโค้ด ทดสอบ และแก้ไขข้อผิดพลาดภายในโปรเจกต์

อธิบายการทำงานและสื่อสารกับฉันเป็นภาษาไทย ส่วนชื่อไฟล์ ชื่อตัวแปร ชื่อฟังก์ชัน และโครงสร้างโค้ดให้ใช้ภาษาอังกฤษตามมาตรฐานสากล

## 2. Project Overview

Project Name: Smart Home Hub

ชื่อภาษาไทย: ระบบจำลองบ้านอัจฉริยะผ่านเว็บแอปพลิเคชัน

Project Type: IoT, Embedded Systems, Smart Home, Web Application และ Automation

Target Version: v1.0.0

วัตถุประสงค์:

- สร้างบ้านจำลองอัจฉริยะที่ทำงานได้จริง
- ใช้อุปกรณ์อิเล็กทรอนิกส์ที่มีอยู่ครบทั้ง 16 รายการ
- ใช้ ESP32 เป็นหน่วยควบคุมกลาง
- ควบคุมและตรวจสอบสถานะบ้านผ่าน Web Application
- รองรับการทำงานแบบ Manual และ Automatic
- มีระบบจำลองสำหรับทดสอบก่อนเชื่อมฮาร์ดแวร์
- ใช้เป็นโครงงานสาธิตและสื่อการเรียนรู้ด้าน IoT
- สามารถต่อยอดเป็น Smart Home Educational Kit เพื่อจำหน่ายในอนาคต

ห้ามเติมคำว่า ZhipTech ลงในชื่อโปรเจกต์ โลโก้ หรือชื่อผลิตภัณฑ์

## 3. Development Environment

เครื่องมือที่ใช้:

- Windows
- Visual Studio Code
- Codex
- PlatformIO
- Arduino Framework
- C/C++
- HTML5
- CSS3
- JavaScript หรือ TypeScript ตามความเหมาะสม
- Git
- GitHub
- SketchUp
- Ender 3 V3 SE

ข้อกำหนดการจัดการไฟล์:

- ใช้ Drive D เป็นพื้นที่ทำงานหลัก
- เสนอให้สร้างโปรเจกต์ที่ D:\Projects\SmartHomeHub หากยังไม่มี Workspace ที่กำหนดไว้
- ตรวจสอบ Workspace และไฟล์เดิมก่อนสร้างโปรเจกต์
- ห้ามแก้ไขโปรเจกต์ Portfolio, POS หรือโปรเจกต์อื่น
- ห้ามย้าย ลบ หรือแก้ไขไฟล์นอกเหนือจากขอบเขตงาน
- ห้ามจัดการไฟล์ใน Drive C โดยพลการ
- หากเครื่องมือจำเป็นต้องใช้พื้นที่ระบบหรือ Cache บน Drive C ให้แจ้งก่อน
- ตรวจสอบ Dependencies และเครื่องมือที่ติดตั้งอยู่แล้วก่อนติดตั้งเพิ่มเติม
- ห้าม Push ขึ้น GitHub หรือ Flash Firmware ลงฮาร์ดแวร์โดยไม่ได้รับอนุญาต

## 4. Hardware Inventory

ฉันมีอุปกรณ์ดังนี้ และต้องการใช้งานให้ครบทุกประเภท

| No. | Hardware | Purpose |
|---|---|---|
| 01 | ESP32 Dev Module | Main Controller และ Wi-Fi Web Server |
| 02 | Relay Module 2CH | ควบคุมไฟและระบบปรับอากาศจำลอง |
| 03 | DHT11 | ตรวจวัดอุณหภูมิและความชื้น |
| 04 | PIR Module | ตรวจจับการเคลื่อนไหว |
| 05 | IR Module | ตรวจจับรถหรือสิ่งของในโรงจอดรถ |
| 06 | Photo Sensor | ตรวจวัดระดับแสง |
| 07 | OLED I2C 128x64 | แสดงข้อมูลและสถานะระบบ |
| 08 | Breadboard | ประกอบวงจรต้นแบบ |
| 09 | LED 5mm | ไฟบ้าน ไฟสวน และไฟแสดงสถานะโหลดจำลอง |
| 10 | Resistors | จำกัดกระแสและ Pull-up/Pull-down |
| 11 | Potentiometer | ปรับความสว่าง RGB จากตัวเครื่อง |
| 12 | Momentary Push Button | กริ่งหน้าบ้าน |
| 13 | Active Buzzer | สัญญาณเตือนภัย |
| 14 | Passive Buzzer | เสียงกริ่งและเสียงตอบสนอง |
| 15 | Jumper Wires | เชื่อมต่อวงจร มีเพียงพอต่อการใช้งาน |
| 16 | RGB LED | ไฟ Ambient Lighting ในห้องนอน |

ยังไม่ได้ยืนยันรุ่นย่อยและรายละเอียดทางไฟฟ้าของโมดูลทั้งหมด ให้สร้าง Hardware Abstraction และ Configuration ที่สามารถแก้ไขได้ภายหลัง

ห้ามสมมติว่าทุกโมดูลรองรับแรงดันและสัญญาณ 3.3V โดยตรง

## 5. Proposed GPIO Mapping

ใช้ตารางนี้เป็นจุดเริ่มต้นสำหรับ ESP32 รุ่นดั้งเดิม ไม่ใช่ Wiring Diagram ที่ผ่านการตรวจสอบฮาร์ดแวร์จริงแล้ว

| Device | GPIO |
|---|---|
| Relay CH1 | GPIO25 |
| Relay CH2 | GPIO26 |
| DHT11 | GPIO4 |
| PIR | GPIO32 |
| IR | GPIO33 |
| Photo Sensor | GPIO34 |
| OLED SDA | GPIO21 |
| OLED SCL | GPIO22 |
| Outdoor LED | GPIO23 |
| Potentiometer | GPIO35 |
| Push Button | GPIO39 |
| Active Buzzer | GPIO18 |
| Passive Buzzer | GPIO19 |
| RGB Red | GPIO13 |
| RGB Green | GPIO14 |
| RGB Blue | GPIO27 |

LED จำลองไฟห้องนั่งเล่นและเครื่องปรับอากาศจะอยู่ในวงจรโหลดแรงดันต่ำของรีเลย์ทั้งสองช่อง

Hardware Requirements:

- รวมการตั้งค่าขาทั้งหมดไว้ใน pins.h หรือ configuration กลาง
- GPIO34, GPIO35 และ GPIO39 เป็น Input-only สำหรับ ESP32 รุ่นดั้งเดิม
- GPIO39 ต้องมีตัวต้านทาน Pull-up ภายนอกหากใช้ตามแผนเดิม
- ตรวจสอบว่าบอร์ด ESP32 จริงมีขาที่กำหนดไว้ครบ
- ใช้ ADC1 สำหรับ Analog Sensor ขณะเปิด Wi-Fi
- ตรวจสอบว่า Photo Sensor มี Analog Output หรือ Digital Output
- ตรวจสอบชนิด IR Module ก่อนนำไปใช้ตรวจจับรถ
- ตรวจสอบ Active HIGH/LOW ของ Relay และเซนเซอร์
- ตรวจสอบ RGB LED ว่าเป็น Common Anode หรือ Common Cathode
- ใช้ตัวต้านทานจำกัดกระแสแยกทุกช่องสี RGB
- ตรวจสอบกระแสของ Buzzer และใช้วงจรขับเพิ่มเติมหากจำเป็น
- ตรวจสอบแรงดัน Output จากเซนเซอร์ไม่ให้เกินค่าที่ GPIO รองรับ
- ตรวจสอบ OLED Controller และ I2C Address
- กำหนด Safe Boot State ให้ Relay และ Buzzer ปิดเมื่อเริ่มระบบ
- ห้ามใช้ไฟบ้าน 220V ในโครงงานสาธิต
- ใช้เฉพาะโหลด DC แรงดันต่ำที่เหมาะสม
- หากมีอุปกรณ์เพิ่มเติมที่จำเป็น ให้จัดทำรายการแจ้งฉันก่อน

## 6. Physical Smart Home Zones

บ้านจำลองแบ่งออกเป็นพื้นที่ดังนี้

1. Living Room — ห้องนั่งเล่น
2. Bedroom — ห้องนอน
3. Garage — โรงจอดรถ
4. Garden & Pathway — สวนและทางเดิน
5. Main Entrance — ทางเข้า
6. Home Control Center — ศูนย์ควบคุมกลาง

แนวทางออกแบบตัวบ้าน:

- Modern Minimal
- หลังคาเปิดหรือถอดได้
- มองเห็นการทำงานของอุปกรณ์แต่ละห้อง
- ซ่อนสายไฟใต้ฐานบ้าน
- ถอดซ่อมและเปลี่ยนอุปกรณ์ได้
- ออกแบบพื้นที่ติดตั้ง ESP32, Breadboard และ Relay
- DHT11 อยู่ในบริเวณที่ระบายอากาศได้
- Photo Sensor ไม่ถูกแสงจาก LED ของตัวบ้านรบกวนโดยตรง
- ตำแหน่ง PIR และ IR ต้องเหมาะกับการตรวจจับ
- ยังไม่ต้องสร้างไฟล์ 3D จนกว่าจะยืนยันขนาดอุปกรณ์จริง

## 7. Smart Home Subsystems

### 7.1 Smart Lighting

- ใช้ PIR ตรวจจับการเคลื่อนไหว
- Relay CH1 ควบคุมไฟห้องนั่งเล่นจำลอง
- รองรับ Manual และ Auto
- เปิดไฟเมื่อพบการเคลื่อนไหวตามเงื่อนไขที่ตั้งไว้
- สามารถตั้ง Timeout ก่อนปิดไฟอัตโนมัติ
- เพิ่ม Manual Override
- PIR ไม่สามารถยืนยันการมีคนอยู่หรือนับจำนวนคนได้อย่างแม่นยำ

### 7.2 RGB Ambient Lighting

- ควบคุมไฟ RGB ผ่าน PWM
- เลือกสีจากหน้าเว็บ
- รองรับ Color Picker
- ปรับ Brightness 0–100%
- เปิดและปิดไฟได้
- รองรับสีและความสว่างตาม Home Scenes
- Potentiometer สามารถปรับความสว่างจากตัวเครื่อง
- ป้องกัน Potentiometer เขียนทับค่าจากเว็บตลอดเวลา ให้ใช้ Soft Takeover, Deadband หรือระบบควบคุมที่เหมาะสม
- สถานะต้องตรงกันระหว่างเว็บและฮาร์ดแวร์

### 7.3 Smart Climate

- อ่านอุณหภูมิและความชื้นจาก DHT11
- แสดงข้อมูลบนเว็บไซต์และ OLED
- ตั้งค่า Temperature Threshold
- Relay CH2 ควบคุม LED แทนพัดลมหรือเครื่องปรับอากาศ
- รองรับ Manual และ Auto
- ใช้ Hysteresis เพื่อป้องกัน Relay เปิดปิดถี่เกินไป
- อ่าน Sensor ตามช่วงเวลาที่ Datasheet รองรับ
- หากอ่านค่าไม่ได้ ให้แสดง Sensor Error และใช้ Safe State

### 7.4 Smart Parking

- ใช้ IR Module ตรวจจับรถจำลอง
- แสดงสถานะ Vacant หรือ Occupied
- แจ้งสถานะบน Web Application
- Passive Buzzer ส่งเสียงตอบสนองเมื่อสถานะเปลี่ยน
- ป้องกันค่ากระพริบด้วย Debounce หรือ Filtering
- บันทึกเหตุการณ์รถเข้าและออก
- ไม่กล่าวอ้างว่าสามารถวัดระยะได้ หาก IR Module ไม่มีความสามารถดังกล่าว

### 7.5 Smart Outdoor Lighting

- ใช้ Photo Sensor ตรวจจับระดับแสง
- เปิด LED สวนและทางเดินเมื่อมืด
- ปิด LED เมื่อสว่าง
- ตั้งค่า Threshold ผ่านเว็บได้
- รองรับ Manual และ Auto
- ใช้ Hysteresis และ Filtering ป้องกันการเปิดปิดถี่
- หากเป็น Analog Photo Sensor ให้แสดงค่าดิบและระดับแสงเชิงสัมพัทธ์ ไม่แสดงหน่วย Lux โดยไม่มีการสอบเทียบ

### 7.6 Smart Security

- ใช้ PIR ร่วมกับระบบไฟห้องนั่งเล่น
- เปิดการเฝ้าระวังเมื่ออยู่ใน Away Mode
- ตรวจจับความเคลื่อนไหวแล้วสั่ง Active Buzzer แจ้งเตือน
- แสดง Alert บน Dashboard
- บันทึก Activity Log
- มีปุ่ม Arm, Disarm, Mute และ Acknowledge
- กำหนดระยะเวลาแจ้งเตือนและป้องกันการแจ้งซ้ำที่ไม่จำเป็น
- เป็นระบบสาธิต ไม่ใช่อุปกรณ์รักษาความปลอดภัยที่ผ่านการรับรอง

### 7.7 Smart Doorbell

- ใช้ Push Button เป็นกริ่งหน้าบ้าน
- Passive Buzzer สร้างเสียงกระดิ่ง
- เมื่อกดปุ่มให้แจ้งเตือนหน้าเว็บแบบใกล้เคียง Real-time
- บันทึกเหตุการณ์และเวลาที่กด
- มี Debounce
- จัดลำดับความสำคัญของเสียง Parking และ Doorbell
- ห้ามใช้ delay() แบบยาวที่ทำให้ Web Server หยุดตอบสนอง

### 7.8 Home Control Center

- แสดงผลผ่าน OLED I2C 128x64
- แสดง Temperature และ Humidity
- แสดง Wi-Fi Status
- แสดง IP Address
- แสดง Home Scene
- แสดง Security Status
- สลับหน้าแสดงผลอัตโนมัติ
- แสดงข้อความ Sensor Error หรือ Network Error
- ไม่แสดงข้อมูลที่แน่นเกินความละเอียดหน้าจอ
- ใช้ระบบอัปเดตหน้าจอโดยไม่ขัดขวางงานอื่น

## 8. Home Scenes

สร้างระบบ Home Scenes จำนวน 4 โหมดเป็นค่าเริ่มต้น

| System | Home | Away | Night | Work |
|---|---|---|---|---|
| Living Room Light | Auto | Off | Off | On |
| Outdoor Light | Auto | Auto | Auto | Auto |
| Climate | Auto | Off | Auto | Auto |
| RGB | Custom | Off | Soft Purple | White |
| Security | Disarmed | Armed | Disarmed | Disarmed |
| Parking | Enabled | Enabled | Enabled | Enabled |
| Doorbell | Enabled | Enabled | Enabled | Enabled |

ข้อกำหนด:

- เปลี่ยน Scene ผ่านเว็บไซต์ได้
- สามารถแก้ไข Scene ภายหลัง
- Night Mode ใช้ RGB ความสว่างประมาณ 20% เป็นค่าเริ่มต้น
- Work Mode ใช้ RGB สีขาว เป็นค่าเริ่มต้น
- กำหนดกติกาให้ชัดเจนเมื่อ Manual Control, Automation และ Scene สั่งอุปกรณ์ตัวเดียวกัน
- Manual Override ให้มีผลตามระยะเวลาหรือจนกว่าผู้ใช้จะกลับเข้า Auto
- Security Alert มีลำดับความสำคัญสูง
- การเปลี่ยน Scene ต้องไม่ทำให้ระบบรักษาความปลอดภัยเข้าสู่สถานะผิดพลาดโดยไม่ตั้งใจ

## 9. Web Application Requirements

สร้างเว็บแอปพลิเคชันที่ใช้งานได้จริง ไม่ใช่หน้า Landing Page หรือ Static UI เพียงอย่างเดียว

ต้องมีทั้งหมด 9 หน้าหลัก

### 9.1 Dashboard

- ภาพรวมสถานะบ้าน
- Online/Offline Status
- อุณหภูมิ
- ความชื้น
- ระดับแสง
- Motion Status
- Parking Status
- Security Status
- Home Scenes
- Quick Device Controls
- RGB Control
- Recent Alerts
- Environment Chart
- Last Updated Time

### 9.2 Home Map

- แผนผังบ้านแบบ Interactive
- แสดงพื้นที่บ้านทั้ง 6 โซน
- ใช้ SVG หรือเทคโนโลยีที่ Lightweight
- คลิกแต่ละห้องเพื่อดูและควบคุมอุปกรณ์
- แสดงไฟและสถานะอุปกรณ์บนแผนผังแบบสด
- แสดงสถานะ Garage, Outdoor Light และ Security

### 9.3 Devices

- แสดงอุปกรณ์ทั้งหมดที่ควบคุมได้
- เปิดและปิด Relay
- ควบคุมไฟ LED
- เลือกสี RGB
- ปรับ Brightness
- ควบคุม Buzzer
- ดูข้อมูล Sensor
- เปลี่ยน Manual/Auto Mode
- แสดงสถานะและข้อผิดพลาดของอุปกรณ์

### 9.4 Automation

- สร้างกฎแบบ IF–THEN
- เลือก Sensor หรือ Trigger
- เลือก Condition
- ตั้ง Threshold
- เลือก Device และ Action
- เปิด/ปิด Rule
- แก้ไขและลบ Rule
- ตั้ง Delay, Timeout หรือ Hysteresis ตามประเภทกฎ
- จำกัดจำนวนกฎให้เหมาะกับหน่วยความจำของ ESP32
- ตรวจสอบ Rule ที่ขัดแย้งกัน
- ไม่แสดงฟังก์ชันที่ Firmware ยังไม่รองรับว่าใช้งานได้จริง

### 9.5 Scenes

- Home
- Away
- Night
- Work
- เลือกและแก้ไข Scene
- แสดงตัวอย่างสถานะอุปกรณ์ก่อนใช้งาน Scene

### 9.6 Security

- Armed/Disarmed
- Motion Detection
- Active Alarm
- Doorbell Events
- Parking Events
- Mute Alarm
- Acknowledge Alert
- Security History

### 9.7 Analytics

- Temperature History
- Humidity History
- Light Level History
- Motion Events
- Parking Events
- Device Activity
- เลือกช่วงข้อมูลที่มีอยู่จริง
- แสดง Empty State เมื่อยังไม่มีข้อมูล
- ไม่สร้างข้อมูลเซนเซอร์ปลอมใน Live Mode

### 9.8 Activity Logs

- Timestamp หรือ uptime หากยังไม่มีเวลาจริง
- Event Type
- Device
- Trigger Source
- Manual/Automation/System
- Event Description
- Filter และ Search
- Export CSV หากทรัพยากรและข้อมูลรองรับ
- จำกัดขนาดประวัติเพื่อไม่ให้ RAM หรือ Flash เต็ม

### 9.9 Settings

- Device Name
- Wi-Fi Configuration
- Connection Status
- Sensor Thresholds
- Display Settings
- Buzzer Settings
- Light/Dark/System Theme
- Firmware Version
- Simulation/Live Mode
- Reset Settings พร้อมขั้นตอนยืนยัน

## 10. UI/UX Design System

ต้องการเว็บไซต์ระดับผลิตภัณฑ์จริง ดูทันสมัย สวยงาม ใช้งานง่าย และไม่เหมือนหน้าเว็บทดสอบ Arduino หรือ Dashboard Template ทั่วไป

Design Direction:

- Modern Minimal
- Premium Smart Home Dashboard
- ใช้ภาษาไทยเป็นหลัก
- ใช้ศัพท์ภาษาอังกฤษประกอบเฉพาะคำที่เหมาะสม
- รองรับ Light Mode, Dark Mode และ System Theme
- Dark Mode ใช้สีเทาเข้มแบบ Notion ไม่ติดสีน้ำเงินมากเกินไป
- ใช้สีเขียวแสดงสถานะปกติ
- ใช้สีเหลืองหรือส้มแสดงคำเตือน
- ใช้สีแดงแสดงเหตุการณ์ผิดปกติ
- ใช้สีอย่างมีความหมาย ไม่ใช้ Gradient หรือ Glow มากเกินไป
- ใช้ไอคอน SVG ที่สอดคล้องกัน
- ใช้ฟอนต์ที่อ่านภาษาไทยได้ดี และไม่พึ่ง CDN ขณะทำงานออฟไลน์
- สร้าง Design Tokens และ Reusable Components

Desktop Layout:

- Sidebar Navigation
- Top Navigation Bar
- Dashboard Grid
- Device Cards
- Interactive Home Map
- Notification Center
- Charts และ Activity Timeline

Mobile Layout:

- Responsive Design
- Bottom Navigation หรือเมนูแบบย่อที่ใช้งานได้จริง
- Touch-friendly Controls
- Cards ไม่ล้นหน้าจอ
- Responsive Charts
- รองรับการใช้งานบน Android และ iPhone ผ่าน Browser

Interaction Design:

- Loading State
- Empty State
- Error State
- Offline State
- Toast Notifications
- Confirmation Dialog
- Micro-interactions ที่เหมาะสม
- Accessibility
- Keyboard Navigation
- Reduced Motion

ห้ามสร้างปุ่มที่กดแล้วไม่ทำงาน หากฟังก์ชันใดยังไม่รองรับให้แสดงสถานะ Disabled หรือ Coming Soon อย่างชัดเจน

## 11. System Architecture

ใช้แนวทาง Local-first Architecture

Mobile / Desktop Browser
↕
Smart Home Web Application
↕
Local Wi-Fi Network
↕
ESP32 Web Server + REST API
↕
Automation Engine + Device Controller
↕
Sensors / Relay / LED / RGB / OLED / Buzzer

ESP32 เป็นแหล่งข้อมูลสถานะหลักใน Live Mode

ข้อกำหนด:

- หน้าเว็บถูกให้บริการจาก ESP32 ผ่าน LittleFS
- ไม่จำเป็นต้องมี Internet สำหรับควบคุมภายในเครือข่าย
- ไม่จำเป็นต้องมี Cloud Server ใน Version 1
- ไม่ใช้ Firebase หรือ Supabase หากยังไม่มีความจำเป็น
- รองรับ HTTP REST API
- เลือก SSE, WebSocket หรือ Polling ตามความเหมาะสมและข้อจำกัดของ ESP32
- หลีกเลี่ยงการใช้หลายระบบสื่อสารพร้อมกันโดยไม่จำเป็น
- Firmware ต้องทำงานอัตโนมัติได้แม้ไม่มี Browser เปิดอยู่
- ระบบ Automation ต้องยังทำงานได้เมื่อ Wi-Fi หลุด
- Web UI และ Device State ต้อง Synchronize กัน
- แสดง Offline และ Stale Data เมื่อไม่สามารถอ่านสถานะล่าสุด
- ไม่เปิด ESP32 ให้เข้าถึงโดยตรงจาก Public Internet

## 12. Wi-Fi & Security

- รองรับ Station Mode สำหรับเชื่อม Wi-Fi ภายในบ้าน
- พิจารณา Setup Access Point สำหรับตั้งค่า Wi-Fi ครั้งแรก
- Setup AP ต้องไม่เป็นเครือข่ายเปิดที่ไม่มีการป้องกัน
- มีทางกู้คืนเมื่อเชื่อม Wi-Fi ไม่สำเร็จ
- ไม่ Hardcode รหัสผ่าน Wi-Fi จริงลงใน Repository
- เก็บ Configuration ด้วย Preferences/NVS ตามความเหมาะสม
- ไม่ส่งรหัสผ่าน Wi-Fi กลับไปใน API Response
- ออกแบบระบบควบคุมสิทธิ์ภายในเครือข่ายให้เหมาะสมกับต้นแบบ
- ตรวจสอบ Input และค่าที่รับจาก API
- ไม่อนุญาตคำสั่งที่ไม่ถูกต้องหรืออยู่นอกช่วง
- ห้ามแจ้งว่าเครือข่าย HTTP ปลอดภัยเทียบเท่า HTTPS

## 13. REST API Design

ออกแบบ API ให้มี Schema ที่ชัดเจนและ Frontend กับ Firmware ใช้ Contract เดียวกัน

ตัวอย่าง Endpoint:

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

GET /api/events

GET /api/history

GET /api/settings

PATCH /api/settings

POST /api/security/arm

POST /api/security/disarm

POST /api/security/acknowledge

GET /api/health

สามารถปรับ Endpoint ตาม Architecture ที่เหมาะสมได้ แต่ต้องบันทึกไว้ในเอกสาร API Contract

ทุก API ที่แก้ไขสถานะต้องตรวจสอบ Input และส่งสถานะจริงหรือข้อผิดพลาดกลับมา

Frontend ห้ามแสดงว่าสั่งงานสำเร็จแล้วหาก ESP32 ยังไม่ตอบรับ

## 14. Simulation Mode & Live Mode

สร้าง Data Provider อย่างน้อย 2 แบบ โดยใช้ UI ชุดเดียวกัน

Simulation Mode:

- ทำงานได้บนคอมพิวเตอร์ก่อนต่อ ESP32
- จำลองค่า Temperature, Humidity และ Light Level
- จำลองการตรวจจับ PIR
- จำลองรถเข้าออกโรงจอด
- จำลองการกดกริ่ง
- จำลองการปรับ Potentiometer
- จำลอง Relay, LED, RGB และ Buzzer
- ทดสอบ Home Scenes
- ทดสอบ Automation
- ทดสอบ Security Alert
- ทดสอบการเชื่อมต่อหลุดและ Sensor Error
- ระบุชัดเจนว่าเป็นข้อมูลจำลอง

Live Mode:

- ใช้ข้อมูลและสถานะจริงจาก ESP32
- ส่งคำสั่งผ่าน API
- รองรับการอัปเดตสถานะอย่างต่อเนื่อง
- ไม่สร้างข้อมูลปลอมเมื่อ ESP32 Offline
- แสดงข้อผิดพลาดอย่างเหมาะสม
- ใช้ Device State จาก Firmware เป็น Source of Truth

ควรให้การตั้งค่า API Base URL หรือการใช้งาน Same-Origin เหมาะสมกับทั้งการพัฒนาบน PC และการ Deploy ลง ESP32

## 15. Firmware Engineering Requirements

- ใช้ Arduino Framework ร่วมกับ PlatformIO
- เขียน C++ แบบ Modular
- แยก Sensor, Device, Network, Display, Security และ Automation
- ใช้ Non-blocking Logic เช่น millis() หรือ Scheduler ตามความเหมาะสม
- หลีกเลี่ยง delay() แบบยาว
- มี Debounce และ Filtering
- มี Hysteresis
- จัดการ Sensor Error
- มี Wi-Fi Reconnection
- มี Safe Output State
- ตรวจสอบค่าก่อนควบคุม GPIO
- จัดลำดับความสำคัญของเสียง Buzzer
- เก็บ Configuration โดยไม่เขียน Flash ทุกครั้งที่ Sensor เปลี่ยน
- ใช้ Bounded History หรือ Ring Buffer
- รองรับ NTP เมื่อมี Internet
- หากไม่มีเวลาจริงให้ใช้ uptime และระบุให้ชัดเจน
- คำนึงถึง RAM, Flash, CPU และขนาด LittleFS
- ตรวจสอบความเข้ากันได้ของ PlatformIO, Arduino ESP32 Core และ Library ที่เลือกใช้
- ใช้ API ของ PWM/LEDC ให้ตรงกับ Core Version ที่ติดตั้งจริง
- จัดทำ Serial Debug Log ที่อ่านง่าย
- ไม่เปิดเผย Credentials ใน Log
- รองรับการทดสอบโดยยังไม่ได้ต่อ Sensor ทุกตัว
- ไม่กล่าวอ้างว่าทดสอบฮาร์ดแวร์สำเร็จจนกว่าจะทดสอบจริง

## 16. Suggested Project Structure

จัดโครงสร้างตามมาตรฐาน PlatformIO โดยสามารถปรับรายละเอียดได้ตามความเหมาะสม

SmartHomeHub/
  platformio.ini
  README.md
  .gitignore

  src/
    main.cpp
    sensors.cpp
    devices.cpp
    automation.cpp
    security.cpp
    network.cpp
    web_server.cpp
    display.cpp
    storage.cpp

  include/
    config.h
    pins.h
    sensors.h
    devices.h
    automation.h
    security.h
    network.h
    web_server.h
    display.h
    storage.h

  web/
    src/
    public/
    tests/
    package.json

  data/
    index.html
    assets/

  test/

  hardware/
    BOM.md
    GPIO_MAP.md
    WIRING.md

  3d-models/

  docs/
    ARCHITECTURE.md
    API.md
    ROADMAP.md
    TEST_PLAN.md
    USER_GUIDE.md

Frontend Source Code ให้เก็บไว้ใน web/

ไฟล์ที่ Build สำหรับ ESP32 LittleFS ให้เก็บใน data/

ห้ามแก้ไฟล์ที่ Generate จาก Build โดยตรง ให้แก้ Source Code แล้ว Build ใหม่

เลือก Frontend Stack ที่ Lightweight และเหมาะกับ Flash และ RAM ของ ESP32 มากที่สุด

สามารถใช้ Vite + TypeScript, Vanilla JavaScript หรือเทคโนโลยีอื่นที่เหมาะสม แต่ต้องอธิบายเหตุผลก่อน และไม่สร้าง Dependency ที่หนักเกินความจำเป็น

## 17. Testing & Quality Assurance

ต้องมีการทดสอบดังนี้

Frontend:

- Desktop Layout
- Mobile Layout
- Light/Dark/System Theme
- Navigation ทั้ง 9 หน้า
- Simulation Mode
- Live Mode Error Handling
- Device Controls
- RGB Color/Brightness
- Home Scenes
- Automation
- Security Alerts
- Offline Mode
- Loading และ Empty State

Firmware:

- Compile
- GPIO Configuration
- Sensor Reading Logic
- Relay Logic
- RGB PWM
- Button Debounce
- Buzzer Scheduling
- Automation Rules
- Configuration Persistence
- Wi-Fi Recovery
- Safe Boot State
- API Validation

Integration:

- Frontend/API Contract
- State Synchronization
- Manual Override
- Scene Conflict
- Sensor Failure
- Network Disconnection
- Device Command Failure

ให้รัน Build, Lint และ Tests ที่มีอยู่จริง

หากมีความสามารถในการเปิด Browser และจับภาพ ให้ตรวจสอบ Desktop และ Mobile พร้อมจับภาพหน้าหลักสำหรับรีวิว UI

ห้ามรายงานผลทดสอบที่ไม่ได้ดำเนินการจริง

## 18. Development Roadmap

Phase 1 — Project Setup

- สร้าง Workspace
- ตรวจสอบ Development Environment
- เลือก Frontend Stack
- สร้าง Design System
- สร้าง PlatformIO Project
- กำหนด Data Model และ API Contract

Phase 2 — Hardware Integration

- สร้าง Firmware Configuration
- เขียน Driver และทดสอบ Sensor ทีละตัว
- ทดสอบ Relay, LED, RGB
- ทดสอบ Push Button และ Potentiometer
- ทดสอบ Active และ Passive Buzzer
- ทดสอบ OLED
- ยืนยัน Wiring Diagram จากอุปกรณ์จริง

Phase 3 — Web Application

- สร้าง UI ทั้ง 9 หน้า
- สร้าง Simulation Mode
- สร้าง Device Control
- สร้าง Interactive Home Map
- สร้าง REST API Integration
- Build Web Assets สำหรับ LittleFS

Phase 4 — Smart Home Automation

- พัฒนาระบบบ้านอัจฉริยะทั้ง 8 ระบบ
- พัฒนา Home Scenes
- พัฒนา Rule Engine
- พัฒนาระบบ Security
- พัฒนา Activity Logs
- ทดสอบระบบร่วมกัน

Phase 5 — Physical Model

- ออกแบบบ้านจำลอง
- ออกแบบเคสและฐาน
- พิมพ์ชิ้นส่วน 3D
- ติดตั้งฮาร์ดแวร์
- จัดสายไฟ
- ทดสอบบ้านจำลองจริง

Phase 6 — Release

- ปรับปรุง UI/UX
- ตรวจสอบความเสถียร
- จัดทำคู่มือภาษาไทย
- จัดทำ Wiring Diagram
- ถ่ายวิดีโอสาธิต
- เตรียม Git Repository
- วางแนวทางต่อยอด Smart Home Educational Kit

## 19. Initial Task — เริ่มลงมือทำทันที

ในรอบการทำงานแรก ให้ดำเนินการตามลำดับดังนี้

1. ตรวจสอบ Workspace และ Development Environment
2. ตรวจสอบ Drive D และพื้นที่ที่จะสร้างโปรเจกต์
3. สร้างโปรเจกต์ SmartHomeHub โดยไม่แตะต้องโปรเจกต์อื่น
4. สร้าง README, Architecture, Roadmap และ API Contract
5. สร้าง Frontend Design System
6. สร้าง Web Application ครบโครงสร้างทั้ง 9 หน้า
7. ทำ Dashboard และ Interactive Home Map ให้มีคุณภาพสูง
8. ทำ Simulation Mode ให้สามารถทดสอบอุปกรณ์และระบบย่อยได้
9. สร้าง PlatformIO Firmware Project
10. วาง GPIO Configuration และ Hardware Abstraction
11. เขียน Firmware สำหรับ Web Server, API, Sensor และ Device Controller เป็นโครงสร้างเริ่มต้น
12. เชื่อม Frontend และ Firmware ผ่าน Data Contract เดียวกัน
13. ทดสอบ Frontend Build และ Firmware Compile
14. ตรวจสอบการใช้งาน Desktop และ Mobile
15. สรุปงานที่สำเร็จจริง ข้อผิดพลาด และงานที่ยังต้องทดสอบเพิ่มเติม

ให้เริ่มจาก Simulation Mode ควบคู่กับ Firmware โดยไม่ต้องรอให้ฉันต่อวงจรทั้งหมด

ยังไม่ต้อง Upload Firmware ลง ESP32 จนกว่าจะตรวจสอบรุ่นบอร์ด โมดูล GPIO และความปลอดภัยของวงจรเรียบร้อย

หากงานมีขนาดใหญ่ ให้แบ่งเป็น Milestones และลงมือพัฒนาทีละส่วนอย่างเป็นระบบ ไม่หยุดเพียงการเสนอแผน

## 20. Final Working Rules

- เน้นคุณภาพมากกว่าความเร็ว
- ไม่สร้างเว็บแบบทั่วไปที่ไม่มีเอกลักษณ์
- ไม่ใช้ Mock Data ปะปนกับ Live Data
- ไม่สร้างฟังก์ชันปลอม
- ไม่แก้ไขไฟล์ที่ไม่เกี่ยวข้อง
- ไม่เพิ่มความซับซ้อนโดยไม่จำเป็น
- บันทึกเหตุผลเมื่อเปลี่ยน Architecture
- อธิบายขั้นตอนที่ฉันต้องทำกับฮาร์ดแวร์เป็นภาษาไทย
- ตรวจสอบงานจริงก่อนรายงานว่าสำเร็จ
- สรุปไฟล์ที่สร้างหรือแก้ไข
- แจ้งคำสั่งสำหรับเปิดเว็บ Development Server
- แจ้งวิธี Build Frontend และ Firmware
- แจ้ง URL สำหรับเปิดเว็บในเครื่อง
- ระบุสิ่งที่ยังไม่ได้ทดสอบและข้อจำกัดอย่างตรงไปตรงมา

เริ่มตรวจสอบ Environment และลงมือพัฒนา Smart Home Hub ได้เลย