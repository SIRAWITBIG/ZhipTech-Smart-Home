#pragma once

// Proposed map for original ESP32 ONLY. Confirm exposed pins and module levels.
namespace Pins {
constexpr int RelayLiving = 25;
constexpr int RelayClimate = 26;
constexpr int Dht = 4;
constexpr int Pir = 32;
constexpr int Ir = 33;
constexpr int Photo = 34;     // ADC1, input only, NO internal pull resistors.
constexpr int OledSda = 21;
constexpr int OledScl = 22;
constexpr int OutdoorLed = 23;
constexpr int Pot = 35;       // ADC1, input only, NO internal pull resistors.
constexpr int Button = 39;    // External pull-up to 3.3 V required.
constexpr int ActiveBuzzer = 18;
constexpr int PassiveBuzzer = 19;
constexpr int RgbRed = 13;
constexpr int RgbGreen = 14;
constexpr int RgbBlue = 27;
}

