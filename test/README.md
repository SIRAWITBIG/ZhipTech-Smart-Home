# Firmware verification

Compile with the pinned PlatformIO environment first. The firmware defaults to hardware-disabled and has not been uploaded to any ESP32.

Required board tests after wiring review and explicit upload authorization:

- Boot/reset: relay, RGB and buzzer electrical safe state, including pre-firmware boot period.
- DHT: valid readings, disconnected sensor -> null/error and automatic climate off.
- Climate/light thresholds: hysteresis and manual override until switching back to Auto.
- PIR: warm-up, motion timeout, Away incident, mute, acknowledge, no scene-based silent disarm.
- IR/button: debounce, parking event, doorbell rising edge, doorbell priority over parking audio.
- RGB: each channel/polarity, web brightness, knob pickup and deadband.
- Wi-Fi: reconnect without stopping local automation; recovery AP only with private configured password/API key.
- LittleFS/API: real browser against ESP32, command acknowledgement, API validation, optional key, forbidden Origin, request size and bounded history.
- Persistence: setting/rule/scene survives power cycle; outputs/incidents are not restored to an unsafe state.
- Long running memory: bounded 48 events / 60 history / 12 rules with repeated API edits.

These are pending hardware/integration checks, not results. Frontend simulation tests do not replace them.
