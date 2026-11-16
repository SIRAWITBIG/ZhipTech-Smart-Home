# Test Plan

เอกสารนี้เป็นรายการตรวจ ไม่ใช่หลักฐานว่าทุกข้อผ่านแล้ว ผลที่รันจริงอยู่ใน `QA.md` การทดสอบ hardware ต้องบันทึกบอร์ด, wiring, supply และผลวัดจริง

## Automated checks บน PC

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
```

- Syntax ของ scripts และ frontend; แยกจาก lint เชิง semantic
- Provider: API acknowledgement, input ranges, manual override, scene defaults, threshold/hysteresis, timeout, alarm mute/ack, fault injection, rule conflicts และ bounded history
- Live provider: HTTP error, malformed data, timeout, offline และไม่สร้างค่าจำลอง
- Build: ไม่มี CDN, generated assets อยู่ใน `data/`, ไม่มีการ overwrite ไฟล์นอก manifest และตรวจ budget
- Firmware: `pio run` หรือ D-only command ใน README; compile ไม่ได้ยืนยันวงจร

## Browser

| พื้นผิว | เกณฑ์ตรวจ |
| --- | --- |
| Navigation | เปิดครบทั้ง 9 หน้า, URL/selected nav ถูกต้อง, keyboard ใช้งานได้ |
| Dashboard / Map | ทุกโซนกดเลือกได้และ inspector ตรงกับโซน; ไม่มี clipping |
| Device / RGB | คำสั่งเปลี่ยนสถานะ, color/brightness sync, Auto/Manual เห็นชัด |
| Scenes | Preview/activate Home, Away, Night, Work; output/mode/security ตรง contract |
| Automation | เพิ่ม/แก้ไข/ปิด/ลบกฎ, invalid/conflicting rule แสดง error |
| Security | Arm → motion → alarm, mute, acknowledge, disarm และ doorbell/parking event |
| Simulation | เปลี่ยน sensor, PIR, parking, doorbell, pot; offline และ sensor error |
| Analytics / Logs | ข้อมูลตามช่วงที่มีจริง, empty state, search/filter, CSV |
| Settings | Save/validate, theme light/dark/system, mode switch, reset confirmation |
| Error handling | Live ไม่มี ESP32: offline/stale ไม่มีค่าจำลองและไม่แสดง success |
| Responsive | Desktop และ mobile; touch targets, no horizontal overflow, chart/nav readable |
| Health | ไม่มี app console error, missing required assets หรือ error overlay |

## Hardware และ integration ที่ยังต้องทำ

1. ตรวจวงจรแบบไม่จ่ายไฟ → ตรวจแรงดัน/ground → จ่ายไฟทีละโมดูลและวัด output ก่อนเข้าขา ESP32
2. ยืนยัน relay/buzzer ปิดขณะ boot/reset และ sensor error ทำให้ climate เข้าสู่ safe state
3. ทดสอบ DHT11 interval, NaN/error recovery, PIR timeout, IR/button debounce และ photo hysteresis
4. ทดสอบ PWM RGB ตาม core ที่ตรึงไว้, current-limiting resistors และ soft takeover potentiometer
5. ทดสอบ buzzer priority doorbell/parking และ alarm timeout โดย web server ยังตอบสนอง
6. ทดสอบ OLED/address, readable pages, Wi-Fi disconnect/recovery, config persistence และไม่ log credentials
7. UI Live → API → output จริง → status ตรงกัน; ทดสอบ bad commands, stale data และการรีบูต
8. เปิดใช้งานต่อเนื่องและติดตาม heap/loop responsiveness/history bounds ก่อน release

ห้ามใช้โหลดไฟบ้าน 220V ในทุกขั้นตอน และไม่ upload โดยอัตโนมัติจากสคริปต์ตรวจสอบ
