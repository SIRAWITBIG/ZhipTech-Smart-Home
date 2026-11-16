#pragma once
#include <Arduino.h>
namespace Devices {
void begin();
void tick(uint32_t now);
void playDoorbell(uint32_t now);
void playParking(uint32_t now);
void webRgbChanged();
void acceptPot(int percent);
}

