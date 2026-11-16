# Proposed GPIO map

สำหรับ ESP32 รุ่นดั้งเดิม (`esp32dev`, สมมติ Flash 4 MB) เท่านั้น ยังไม่ใช่แผนผังวงจรที่ยืนยันแล้ว ห้ามใช้กับ ESP32-C3/S3 โดยไม่แก้ map และตรวจสอบบอร์ดจริง

| อุปกรณ์ | GPIO | หมายเหตุ |
|---|---:|---|
| Relay CH1: ไฟห้องนั่งเล่นจำลอง | 25 | ตั้ง active-low/high ใน `include/config.h` |
| Relay CH2: Climate LED จำลอง | 26 | โหลด DC แรงดันต่ำเท่านั้น |
| DHT11 | 4 | Data pull-up ตาม datasheet ของโมดูลจริง |
| PIR | 32 | มี warm-up 60 วินาที; ไม่ใช่ตัวนับคน |
| IR parking | 33 | ตรวจชนิดและ polarity จริง; ไม่วัดระยะ |
| Photo sensor | 34 | ADC1 / input-only, ไม่มี internal pull |
| OLED SDA / SCL | 21 / 22 | ค่าเริ่มต้น SSD1306, `0x3C`; ต้องตรวจของจริง |
| Outdoor LED | 23 | ใช้ตัวต้านทานจำกัดกระแส |
| Potentiometer | 35 | ADC1 / input-only, 0–3.3 V เท่านั้น |
| Doorbell button | 39 | input-only, ต้องมี external pull-up ไป 3.3 V |
| Active buzzer | 18 | ตรวจพิกัดกระแส; เพิ่ม transistor driver หากจำเป็น |
| Passive buzzer | 19 | LEDC channel 6, ตัวขับตามโหลดจริง |
| RGB R / G / B | 13 / 14 / 27 | PWM channels 0/1/2, ตัวต้านทานแยกแต่ละสี |

GPIO34–39 ไม่มีตัวต้านทาน pull ภายใน ห้ามกำหนดเป็น output การอ่าน analog ใช้ ADC1 เพื่อใช้งานร่วมกับ Wi-Fi

ค่าเริ่มต้น `HUB_HARDWARE_ENABLED=0`: เฟิร์มแวร์ไม่แตะ GPIO เซนเซอร์เป็น `null`/error และคำสั่ง API แก้เพียง desired state การเปิด hardware ต้องตรวจ wiring แล้วเปลี่ยน local config เท่านั้น

อ้างอิง: [ESP32 GPIO](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html), [Arduino ESP32 ADC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)

