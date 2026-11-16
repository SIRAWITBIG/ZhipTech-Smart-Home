#include <Arduino.h>
#include "state.h"
#include "storage.h"
#include "sensors.h"
#include "devices.h"
#include "security.h"
#include "automation.h"
#include "network.h"
#include "web_server.h"
#include "display.h"
#include "config.h"

void setup() {
  Serial.begin(115200);
  Serial.println("ZhipTech - Smart Home: boot");
  State::begin();
  Storage::begin();
  Storage::load();
  Devices::begin();
  Sensors::begin();
  Display::begin();
  Network::begin();
  Web::begin();
  State::event("system", "hub", "system", Config::HardwareEnabled
    ? "Firmware started; hardware enabled" : "Hardware disabled: review config and wiring first");
}

void loop() {
  const uint32_t now = millis();
  Sensors::tick(now);
  Security::tick(now);
  Automation::tick(now);
  Devices::tick(now);
  Network::tick(now);
  Web::tick();
  Display::tick(now);
  Storage::tick(now);
  State::tick(now);
  yield();
}
