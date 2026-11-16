# Hardware inventory

รายการผู้ใช้มีครบ 16 ประเภท; รายการด้านล่างเป็นการจัดสรรการใช้งาน ยังไม่ได้ตรวจจำนวน ขนาด หรือรุ่นย่อยจริง

| # | อุปกรณ์ | การใช้ในโปรเจกต์ |
|---:|---|---|
| 1 | ESP32 Dev Module | Controller, REST server, Wi-Fi, LittleFS |
| 2 | Relay 2CH | LED จำลองไฟห้องนั่งเล่นและ climate |
| 3 | DHT11 | อุณหภูมิ/ความชื้น |
| 4 | PIR | Motion เพื่อไฟอัตโนมัติและ security demo |
| 5 | IR module | โรงจอดรถ: ว่าง/มีรถ |
| 6 | Photo sensor | ระดับแสงสัมพัทธ์และค่าดิบ |
| 7 | OLED I2C 128×64 | Environment, network, scene/security 3 หน้า |
| 8 | Breadboard | ประกอบวงจร DC ต้นแบบ |
| 9 | LED 5 mm | โหลดจำลองและไฟสวน |
| 10 | Resistors | จำกัดกระแส LED/RGB, pull-up/down ตามวงจรจริง |
| 11 | Potentiometer | ปรับ RGB brightness แบบ soft takeover |
| 12 | Momentary button | กริ่งหน้าบ้าน debounce |
| 13 | Active buzzer | สัญญาณเตือนภัยแบบจำกัดเวลา |
| 14 | Passive buzzer | Doorbell / parking แบบจัดลำดับความสำคัญ |
| 15 | Jumper wires | สัญญาณและไฟเลี้ยงใน breadboard |
| 16 | RGB LED | Ambient bedroom lighting |

สิ่งที่ต้องยืนยันก่อนต่อวงจร: รุ่น ESP32/Flash, relay input voltage และ active level, แหล่งจ่ายและกระแส, RGB common-anode/cathode, photo analog/digital, IR voltage/polarity, OLED controller/address และจำนวน resistors ที่เหมาะสม

อาจต้องมีอุปกรณ์เพิ่มตามโมดูลจริง: transistor/MOSFET driver, diode ป้องกันโหลดเหนี่ยวนำ, level shifter/voltage divider, แหล่งจ่าย DC ที่จ่ายกระแสพอ, ตัวต้านทาน pull-up GPIO39 และตัวต้านทาน RGB แยกสี ยังไม่ยืนยันว่าจำเป็นทุกชิ้นหรือผู้ใช้มีแล้ว ให้ตรวจร่วมกับผู้ใช้ก่อนเลือกซื้อ/ต่อวงจร

ไม่สร้างไฟล์ 3D จนกว่าจะทราบขนาดอุปกรณ์จริง

