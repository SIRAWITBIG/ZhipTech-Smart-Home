# ZhipTech - Smart Home — Firmware foundation

เฟิร์มแวร์นี้เป็นรากฐานสำหรับทดสอบต่อกับอุปกรณ์จริง ไม่ได้ผ่านการทดสอบไฟฟ้าหรือการ upload ลงบอร์ด ค่าเริ่มต้นปิด GPIO ทั้งหมด (`HUB_HARDWARE_ENABLED=0`) และอ่าน live sensors เป็น `null`/error คำสั่ง API แก้ desired state แต่ยังไม่จ่ายสัญญาณออก UI ต้องแสดงสถานะนี้ให้ชัดเจน

## Toolchain

- PlatformIO Core 6.1.18, `espressif32@6.12.0`, original `esp32dev` 4 MB assumption
- Arduino ESP32 2.0.17, LEDC `ledcSetup`/`ledcAttachPin`/channel API ของ core 2.x
- ArduinoJson 6.21.5, DHT sensor 1.4.6, Unified Sensor 1.1.15, SSD1306 2.5.13, GFX 1.12.1
- `default.csv`: app 1,310,720 bytes ต่อ slot; LittleFS 1,441,792 bytes
- Python 3.12.10 portable และ PlatformIO อยู่ `.tools/` บน D; `.pio/` เป็น build/lib cache ในโปรเจกต์
- ใช้ `PLATFORMIO_CORE_DIR=.tools/platformio`, process `TEMP/TMP=.tools/tmp`, `PIP_CACHE_DIR=.tools/pip-cache` ห้ามตั้งค่า TEMP/TMP ระดับ Windows

บนเครื่องนี้ไม่พบ Python/PlatformIO เดิม จึงดาวน์โหลด Python embeddable จาก python.org และใช้ pip ติดตั้ง PlatformIO ใน D เท่านั้น Embedded Python เปิด `import site` ใน `python312._pth` และติดตั้ง setuptools/wheel, esptool 4.9.0 เพิ่มใน site-packages เพื่อแก้ script import path

PlatformIO 6.1.18 มีบั๊ก package postinstall เมื่อ path interpreter มีช่องว่าง ได้แก้เฉพาะสำเนาเครื่องมือใน `.tools/python/Lib/site-packages/platformio/package/manager/base.py`: เปลี่ยน `" ".join(cmd) if shell else cmd` เป็น `subprocess.list2cmdline(cmd) if shell else cmd` ไม่มีการแก้โปรแกรมหรือ cache บน C สำเนานี้เป็นเครื่องมือ local ที่ไม่ได้ commit; การ setup ใหม่ควรใช้ PlatformIO ที่จัดการ quoted paths ได้ถูกต้องหรือใช้ Python tool path ที่ไม่มีช่องว่างบน D

คำสั่งจากรากโปรเจกต์ (PowerShell):

```powershell
$env:PLATFORMIO_CORE_DIR = Join-Path $PWD '.tools/platformio'
$env:TEMP = Join-Path $PWD '.tools/tmp'
$env:TMP = $env:TEMP
$env:PIP_CACHE_DIR = Join-Path $PWD '.tools/pip-cache'
& '.tools/python/python.exe' -m platformio run -e esp32dev
& '.tools/python/python.exe' -m platformio run -e esp32dev-hardware-compile
# ต้องสร้าง ESP32 Lite bundle ก่อน ไม่ใช้ full 3D dist/
npm.cmd run build:lite
# สร้าง image เท่านั้น ไม่ upload
& '.tools/python/python.exe' -m platformio run -e esp32dev -t buildfs
```

## Branding and web bundle

ชื่ออุปกรณ์เริ่มต้น, factory-reset settings, Serial boot และ OLED ใช้ `ZhipTech - Smart Home` ส่วน recovery AP ใช้ `ZhipTech-SmartHome-Setup` และ hostname ใช้ `zhiptech-smarthome` ชื่ออุปกรณ์ที่ผู้ใช้เคยบันทึกใน NVS จะคงไว้จนกว่าจะเปลี่ยนเองหรือ reset settings

ESP32 เสิร์ฟ `data/` ที่สร้างด้วย `npm run build:lite` เท่านั้น รุ่นนี้ใช้แผนผัง SVG และ controls เดิมโดยไม่บรรจุ Three.js/house engine/model ค่า `window.HUB_LITE=true` ถูกใส่ก่อน app โหลด ส่วนบ้าน WebGL เต็มทำงานใน browser จาก `dist/` บน PC/hosting ไม่มีการย้ายภาระ render 3D ไปยัง ESP32 และยังไม่มี Cloud provider/backend ใน firmware

## Behaviors and precedence

- Polling REST เท่านั้น; Arduino loop ทำงานอัตโนมัติแม้ไม่มี browser หรือ Wi-Fi
- Settings, scene definitions และ rules persist ผ่าน NVS หลังหยุดแก้ 2 วินาที ไม่เขียน Flash ทุก sensor tick
- Safe boot ไม่ restore relay outputs หรือ active incident จากรอบก่อน; Home scene แบบ default + disarmed หลัง restart
- การสั่ง `on` ผ่าน API ทำให้ device เป็น manual จนกลับ Auto หรือเลือก scene ใหม่
- Security incident มีลำดับสูงเหนือ manual buzzer; ใช้ Mute/Acknowledge/Disarm เท่านั้นในการหยุดเสียงหรือเคลียร์ incident
- Scene ที่จะ disarm ถูกปฏิเสธขณะมี incident ค้าง ต้อง acknowledge หรือ disarm โดยชัดเจนก่อน
- คำนวณ built-in auto ก่อน แล้วกฎที่ condition เป็นจริงครบ delay จะ override desired state ตามลำดับรายการ สั่ง output ครั้งเดียวต่อ tick; IF false กลับไปใช้ built-in auto และ manual override ชนะ rules
- Reject enabled rules ที่ nominal condition ซ้อนกันและสั่ง action ตรงข้ามให้อุปกรณ์เดียวกัน รองรับคู่กฎช่วงไม่ซ้อนกัน เช่น temperature>30 เปิด / temperature<25 ปิด; ไม่ใช่ formal proof ของความขัดแย้งจาก hysteresis ทุกกรณี
- Rule delay คือ condition ต้องคงอยู่ครบระยะเวลา, hysteresis คงสถานะ condition จนข้ามจุดปล่อย; ไม่รองรับ arbitrary scripts/actions
- DHT error ปิด climate ทุกโหมดรวม Manual ก่อนตอบสถานะ API; photo/ADC เป็น relative percent และ raw ไม่มีการอ้าง Lux
- PIR warm-up 60 วินาที; DHT 2.5 วินาที; IR stable 250 ms; button debounce 40 ms
- Passive buzzer: doorbell มีลำดับสูงกว่า parking; ไม่มี long delay ใน application loop
- RGB knob ใช้ soft takeover/crossing target + 3% deadband; การปรับผ่านเว็บ/scene ปลดการครอบครอง knob
- Events 48 รายการ, history 60 samples ทุก 10 วินาที (ประมาณ 10 นาที), rules 12; เก็บ history/events ใน RAM จึงหายเมื่อรีสตาร์ต
- `timestamp:null` และ `uptimeMs` เมื่อยังไม่ได้ NTP; ไม่ประดิษฐ์เวลา wall clock
- เมื่อครบ alarmDuration เสียงและ active alarm หยุด แต่ acknowledged ยัง false และ scene guard ยังบังคับรับทราบเหตุการณ์ก่อน disarm ผ่าน scene
- NVS restore ตรวจ settings/rules/scenes ครบทั้ง schema, required fields, ranges และ duplicate/conflicting rules ก่อนใช้ configuration; ชื่อ device/scene จำกัด40และrule60 UTF-8 codepoints รองรับชื่อภาษาไทย
- Raw uptime ใช้ millis32-bit จึงวนหลังประมาณ49.7วัน แม้ timer duration ใช้ modular subtraction; หากไม่มี NTP ประวัติข้ามจุด rollover ต้องพิจารณาข้อจำกัดนี้

## Network and limitations

Wi-Fi/API secrets ตั้งใน `include/config_local.h` (copy จาก example; git-ignored) ไม่ส่ง password กลับ API หรือพิมพ์ใน logs ไม่มี Wi-Fi configuration ผ่านหน้าเว็บในรอบนี้ (`wifiConfiguration:false`) ไม่สร้าง open setup AP: recovery AP เริ่มได้เฉพาะ setup password และ API key ยาวอย่างน้อย 12 ตัวอักษรที่กำหนดเองแล้ว

เมื่อเปิด hardware จริง (`HUB_HARDWARE_ENABLED=1`) API จะตอบ503หาก private key สั้นกว่า12ตัวอักษร และตอบ401เมื่อ `X-API-Key` ไม่ตรงกัน จึงไม่เปิดการควบคุม GPIO เมื่อยังไม่มี authentication ส่วน hardware-disabled prototype ที่ key ว่างแก้ได้เฉพาะ desired state และไม่ขับ GPIO HTTP ไม่เทียบเท่า HTTPS และห้าม expose ESP32 โดยตรงสู่ public Internet Cross-origin PC development ต้องระบุ exact `HUB_ALLOWED_ORIGIN`; ไม่มี wildcard CORS

Request body ตรวจที่ handler ไม่เกิน 4096 bytes หลัง parser ของ Arduino WebServer รับ body แล้ว จึงยังไม่ใช่การป้องกัน memory/slow-client denial-of-service ระดับ production Synchronous WebServer และ DHT/OLED library calls อาจบล็อก loop ชั่วครู่ ต้องทดสอบ response latency/long run บนบอร์ดจริง

`LittleFS.begin(false)` ไม่ format Flash อัตโนมัติ; mount ไม่สำเร็จจะตอบ 503 เว็บ assets; API ยังมี diagnostic ข้อมูลจริงอยู่ ไม่ได้ทดสอบ filesystem mount หรือ API บนฮาร์ดแวร์

การ compile ไม่ยืนยัน peak heap, physical GPIO, sensor accuracy, module voltage/polarity, Wi-Fi recovery timing หรือ reliability ของ hardware ดู checklist ใน `test/README.md` และ `hardware/WIRING.md`

อ้างอิง: [PlatformIO core_dir](https://docs.platformio.org/en/stable/projectconf/sections/platformio/options/directory/core_dir.html), [Espressif32 releases](https://github.com/platformio/platform-espressif32/releases), [ArduinoJson API](https://arduinojson.org/v6/api/), [ESP32 core 2.x LEDC source](https://github.com/espressif/arduino-esp32/blob/2.0.17/cores/esp32/esp32-hal-ledc.h)
