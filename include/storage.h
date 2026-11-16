#pragma once
#include <Arduino.h>
namespace Storage {
void begin();
void load();
void scheduleSave();
void tick(uint32_t now);
String wifiSsid();
String wifiPassword();
bool saveWifi(const String& ssid, const String& password);
}

