#pragma once
#include <ArduinoJson.h>
namespace Web {
void begin();
void tick();
bool validateConfiguration(JsonObjectConst config);
}

