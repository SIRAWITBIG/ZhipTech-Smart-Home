# API Contract — schemaVersion 1

ใช้ contract เดียวกันระหว่าง `web/src/provider.js` กับ ESP32 หน้าเว็บอ่าน `GET /api/status` ทุกประมาณ 2 วินาที ใช้ REST polling เพียงวิธีเดียวในรอบเริ่มต้น ไม่มี MQTT, SSE หรือ WebSocket ที่แอบทำงานคู่กัน

## Transport และ acknowledgement

- Base URL ว่างหมายถึง same-origin เมื่อเปิดเว็บจาก ESP32; ระหว่างพัฒนาบน PC อาจตั้ง URL เช่น `http://192.168.1.20` และกำหนด allowed origin ฝั่งบอร์ด
- Request/response เป็น JSON; mutation ใช้ `Content-Type: application/json`
- หากกำหนด `HUB_API_KEY` ฝั่งบอร์ด ให้ส่ง `X-API-Key` ตามค่านั้น ไม่ส่ง Wi-Fi password กลับ API และไม่ใส่ credentials ใน URL
- Mutation ตอบ canonical status เมื่อสำเร็จ หรือ error เมื่อไม่สำเร็จ หาก endpoint ตอบ receipt, LiveProvider จะอ่าน `GET /api/status` ต่อก่อน commit UI
- LiveProvider timeout เริ่มต้น 5 วินาที; HTTP/JSON/schema/network error ต้องแสดงต่อผู้ใช้ ไม่เปลี่ยนไปใช้ simulation fallback
- โหมด Live รับเฉพาะ `mode: "live"`; payload `simulation` ถูกปฏิเสธ
- Dev server บน PC ไม่มี ESP32 proxy: `GET /api/*` ตอบ 503 เพื่อป้องกันการเข้าใจผิดว่าเชื่อมอุปกรณ์แล้ว; method ที่ไม่ใช่ GET/HEAD ตอบ 405

HTTP และ API key บน LAN ไม่เทียบเท่า HTTPS ห้ามเปิดบอร์ดโดยตรงสู่ Public Internet การตั้งค่าควบคุมสิทธิ์ต้องตรวจอีกครั้งก่อนใช้จริง

## Canonical status

นี่คือโครงสร้างของ payload ไม่ใช่ข้อมูลวัดจริง ตัวอย่างใช้ `null` เมื่อไม่มีเซนเซอร์และ `updatedAt: null` เมื่อยังไม่มีเวลาจริง

```json
{
  "schemaVersion": 1,
  "mode": "live",
  "connected": true,
  "uptimeMs": 12000,
  "updatedAt": null,
  "scene": "home",
  "sensors": {
    "temperature": null,
    "humidity": null,
    "lightRaw": null,
    "lightPercent": null,
    "motion": false,
    "parking": false,
    "potentiometer": null,
    "error": true
  },
  "devices": {
    "living": { "on": false, "mode": "auto" },
    "climate": { "on": false, "mode": "auto" },
    "outdoor": { "on": false, "mode": "auto" },
    "rgb": { "on": false, "mode": "manual", "color": "#29d6ab", "brightness": 65 },
    "alarm": { "on": false, "mode": "auto" }
  },
  "security": { "armed": false, "alarm": false, "muted": false, "acknowledged": true },
  "settings": {
    "deviceName": "ZhipTech - Smart Home",
    "temperatureThreshold": 28,
    "temperatureHysteresis": 2,
    "lightThreshold": 30,
    "lightHysteresis": 5,
    "motionTimeout": 30,
    "alarmDuration": 15,
    "displayEnabled": true,
    "buzzerEnabled": true
  },
  "scenes": [],
  "rules": [],
  "events": [],
  "history": []
}
```

`scenes` ใน response จริงมี 4 รายการ Home/Away/Night/Work ตัวอย่างย่อไว้เพื่อให้อ่าน schema ง่าย บอร์ดอาจส่ง metadata/capabilities เพิ่ม เช่น `hardwareEnabled` เพื่อแสดงว่าปิด physical I/O อยู่ UI ต้องไม่ตีความ logical device state ว่ามี output จริงเมื่อ hardware access ถูกปิด

| Field | ความหมาย |
| --- | --- |
| `temperature`, `humidity` | °C และ %RH หรือ `null` เมื่อไม่พร้อม |
| `lightRaw` | ADC raw 0–4095 สำหรับ analog configuration หรือ `null` |
| `lightPercent` | ระดับแสงสัมพัทธ์ 0–100; ไม่ใช่ Lux |
| `motion` | PIR ตรวจพบการเคลื่อนไหว ไม่ใช่จำนวนคน/การยืนยัน occupancy |
| `parking` | IR ตรวจพบรถ/สิ่งของตาม polarity ที่ตั้ง ไม่ใช่ระยะทาง |
| `potentiometer` | ADC ที่ปรับสเกลเป็น 0–100 หรือ `null` |
| `updatedAt` | ISO timestamp หรือ `null`; ใช้ `uptimeMs` แทนเมื่อยังไม่มีเวลา |
| `connected` | สถานะ provider/network ที่รายงาน; UI ยังต้องประเมิน request failure/staleness เอง |

## Endpoints

| Method | Path | Body / response |
| --- | --- | --- |
| GET | `/api/health` | firmware/network/hardware capabilities ที่ปลอดภัยต่อการเปิดเผย |
| GET | `/api/status` | canonical status |
| GET | `/api/sensors` | sensor state |
| GET | `/api/devices` | device state |
| PATCH | `/api/devices/{id}` | device patch; ตอบ canonical status |
| GET | `/api/scenes` | รายการ scene |
| POST | `/api/scenes/activate` | `{ "id": "home" }`; ตอบ canonical status |
| PATCH | `/api/scenes/{id}` | scene patch; ตอบ canonical status |
| GET | `/api/automation` | รายการ rule |
| POST | `/api/automation` | rule ใหม่; ตอบ canonical status |
| PATCH | `/api/automation/{id}` | แก้ไข rule; ตอบ canonical status |
| DELETE | `/api/automation/{id}` | ไม่มี body; ตอบ canonical status |
| GET | `/api/events` | array หรือ `{ "events": [...] }` |
| GET | `/api/history` | array หรือ `{ "history": [...] }` |
| GET | `/api/settings` | settings ที่ไม่รวม credentials |
| PATCH | `/api/settings` | settings patch; ตอบ canonical status |
| POST | `/api/settings/reset` | `{ "confirm": true }`; reset settings หลัง UI ยืนยัน |
| POST | `/api/security/arm` | `{}` |
| POST | `/api/security/disarm` | `{}` |
| POST | `/api/security/mute` | `{}` |
| POST | `/api/security/acknowledge` | `{}` |

Security mutations ตอบ canonical status การ acknowledge ไม่เท่ากับ disarm และ mute ใช้ปิดเสียงตามสถานะ alarm ที่มีอยู่ ไม่ควรแสดงว่าระบบเลิกเฝ้าระวังแล้ว

### Device patch

IDs: `living`, `climate`, `outdoor`, `rgb`, `alarm`

```json
{ "on": true, "mode": "manual" }
```

`on` ต้องเป็น boolean, `mode` เป็น `auto` หรือ `manual`; เฉพาะ `rgb` เพิ่ม `color: "#rrggbb"` และ `brightness: 0..100` ตัวเลขเป็น number ไม่รับ string หรือ NaN Unknown fields ต้องถูกปฏิเสธ อุปกรณ์ alarm ถูกควบคุมเพิ่มเติมด้วย security priority; ใช้ security endpoints สำหรับ workflow การเฝ้าระวัง

### Scene

```json
{
  "id": "night",
  "name": "พักผ่อน",
  "devices": {
    "living": { "on": false, "mode": "manual" },
    "climate": { "on": false, "mode": "auto" },
    "outdoor": { "on": false, "mode": "auto" },
    "rgb": { "on": true, "mode": "manual", "color": "#a78bfa", "brightness": 20 }
  },
  "securityArmed": false
}
```

Scene ใช้ ID คงที่ `home`, `away`, `night`, `work` แก้ชื่อ/output ได้ตาม validation แต่ไม่เพิ่ม ID ใหม่ในรุ่นนี้ เมื่อ activate จะตั้ง mode/output จาก scene แล้วประเมิน Auto จาก sensor ปัจจุบัน จึงไม่รับประกันว่าอุปกรณ์ Auto จะคง `on` เท่ากับ preview ระหว่างที่ sensor เปลี่ยน

ชื่อ scene มี 1–40 ตัวอักษร เช่นเดียวกับชื่ออุปกรณ์ รองรับภาษาไทย/UTF-8 โดย firmware นับตัวอักษรแทนการจำกัดตามจำนวน bytes และปฏิเสธชื่อที่เป็นช่องว่างล้วน

เมื่อมี alert ที่ยัง active หรือยังไม่ได้ acknowledge การเลือก scene ที่จะ disarm ต้องถูกปฏิเสธ ใช้ Acknowledge หรือ Disarm อย่างชัดเจนก่อนเปลี่ยน scene เพื่อป้องกันการปิดเฝ้าระวังโดยไม่ตั้งใจ

### Automation rule

```json
{
  "name": "เปิดไฟเมื่อมีการเคลื่อนไหว",
  "sensor": "motion",
  "operator": "eq",
  "threshold": 1,
  "device": "living",
  "action": true,
  "enabled": true,
  "delaySeconds": 0,
  "hysteresis": 0
}
```

| Field | ขอบเขต |
| --- | --- |
| `id` | string ตัวอักษร/ตัวเลข/`_`/`-`, 1–40 ตัว; immutable, PATCH ใช้ใน URL และไม่ส่งซ้ำใน body |
| `name` | 1–60 ตัวอักษร |
| `sensor` | `temperature`, `lightPercent`, `motion` |
| `operator` | `gt`, `lt`, `eq`; motion รองรับเฉพาะ `eq` |
| `threshold` | temperature 0–50, lightPercent 0–100, motion 0/1 |
| `device` | `living`, `climate`, `outdoor` |
| `action`, `enabled` | boolean |
| `delaySeconds` | จำนวนเต็ม 0–3600 วินาทีที่เงื่อนไขต้องต่อเนื่อง |
| `hysteresis` | temperature 0–10, light 0–30, motion 0 |

สูงสุด 12 กฎ ทั้ง simulation และ firmware ตรวจเงื่อนไขทับซ้อนด้วยกติกาเดียวกัน กฎที่เปิดใช้และสั่งผลตรงข้ามให้อุปกรณ์เดียวกันถูกปฏิเสธเมื่อช่วงเงื่อนไขทับซ้อน ส่วนเงื่อนไขคนละ sensor ถือว่าเกิดพร้อมกันได้ เช่น temperature > 30 เปิด และ temperature < 25 ปิดอยู่ร่วมกันได้ แต่ temperature > 30 เปิด และ temperature > 35 ปิดอยู่ร่วมกันไม่ได้

กฎทำงานกับอุปกรณ์ Auto เท่านั้น ระบบคำนวณ built-in automation ก่อน แล้วให้ custom rule ที่ตรงเงื่อนไข override จากนั้น commit output ครั้งเดียว เมื่อกฎไม่ตรงเงื่อนไข ระบบกลับใช้ built-in behavior; sensor failure และ Manual override มีลำดับสูงกว่ากฎ

### Settings patch

รับเฉพาะ `deviceName` (1–40 ตัวอักษร, รองรับ UTF-8 และไม่เป็นช่องว่างล้วน), `temperatureThreshold` (0–50), `temperatureHysteresis` (0.5–10), `lightThreshold` (0–100), `lightHysteresis` (1–30), `motionTimeout` (จำนวนเต็ม 1–3600 วินาที), `alarmDuration` (จำนวนเต็ม 1–120 วินาที), `displayEnabled`/`buzzerEnabled` (boolean)

Wi-Fi credentials, API key, allowed origin และ hardware verification เป็น local firmware configuration ในรอบนี้ ไม่ใช่ฟิลด์ PATCH settings ที่รองรับ ห้ามแสดง UI ว่าบันทึก Wi-Fi สำเร็จหาก firmware ยังไม่รองรับ endpoint นั้น

Reset ของ firmware คืน settings/rules/scenes ตามค่าเริ่มต้นและไม่ลบ Wi-Fi credentials; ดู capability `settingsReset: true`, `wifiConfiguration: false` จากบอร์ด Simulation reset คืนสถานะจำลองเริ่มต้นใน browser

## Events และ history

Event shape: `{id,timestamp,uptimeMs,type,device,source,message}` โดย `source` เป็น `manual`, `automation`, `system` หรือ `simulation` Timestamp อาจเป็น `null` ใช้ uptime เมื่อไม่มีเวลาจริง History shape: `{timestamp,uptimeMs,temperature,humidity,lightPercent}` Sensor values อาจเป็น `null`

| Provider | Rules | Events | History | Interval |
| --- | --- | --- | --- | --- |
| Simulation | 12 | 120 | 180 | ประมาณ 5 วินาทีขณะ provider tick |
| Firmware | 12 | 48 | 60 | ประมาณ 10 วินาที |

เมื่อเต็ม ตัดรายการเก่าเพื่อจำกัด memory ประวัติ firmware อยู่ใน RAM ไม่ใช่ฐานข้อมูลถาวร การเลือกช่วงข้อมูลและ CSV เป็นการจัดการข้อมูลที่มีจริงใน frontend ไม่มีการสร้าง history ปลอมใน Live

## Errors และขีดจำกัด

รูปแบบที่ provider รองรับ:

```json
{ "error": { "code": "INVALID_INPUT", "message": "รายละเอียดข้อผิดพลาด" } }
```

และรองรับ `{ "error": "รายละเอียด", "code": "INVALID_INPUT" }` เพื่อความเข้ากันได้กับ firmware โดย firmware ปัจจุบันตอบ `{ "error": "รายละเอียด" }` และ HTTP status เป็นหลัก: 400 malformed JSON/path, 401 unauthorized, 403 origin denied, 404 unknown resource, 409 conflict/capacity, 413 request too large, 422 invalid field/type/range, 503 unavailable UI ต้องเคารพ HTTP status ทุกกรณี

LiveProvider ตรวจ settings, scene definitions ทั้ง 4 รายการ, rules และสถานะอุปกรณ์ก่อนส่งข้อมูลให้ UI ส่วน firmware ตรวจ saved configuration ด้วย validation เดียวกับ API ก่อน restore จาก NVS หากข้อมูลไม่ตรง schema/ขอบเขตให้ใช้ค่าเริ่มต้นและบันทึก error

Firmware จำกัด request body ตาม `Config::MaxRequestBytes` (เริ่มต้น 4096 bytes) ห้ามส่ง scene/rule/history ก้อนใหญ่เกินจำเป็น Source contract อยู่ใน `include/config.h`, `src/web_server.cpp`, `web/src/provider.js` และ provider tests หากเปลี่ยน schema ให้แก้ทั้งสามส่วนพร้อมกัน
