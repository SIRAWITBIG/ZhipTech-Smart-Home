#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>

extern DynamicJsonDocument hubState;
namespace State {
void begin();
void tick(uint32_t now);
void event(const char* type, const char* device, const char* source, const String& message);
void changed();
bool deviceExists(const String& id);
void setDevice(const String& id, bool on, const char* source);
bool applyScene(const String& id, bool log = true);
void serialize(String& output);
}

