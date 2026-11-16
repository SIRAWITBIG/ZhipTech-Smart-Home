#pragma once
#include <Arduino.h>
namespace Network {
void begin();
void tick(uint32_t now);
void reconfigure();
bool setupApActive();
String ip();
}

