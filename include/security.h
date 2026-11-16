#pragma once
#include <Arduino.h>
namespace Security {
void tick(uint32_t now);
void arm();
void disarm();
void mute();
void acknowledge();
}

