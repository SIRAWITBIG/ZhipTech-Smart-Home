#pragma once
#include <Arduino.h>
namespace Sensors {
void begin();
void tick(uint32_t now);
}

