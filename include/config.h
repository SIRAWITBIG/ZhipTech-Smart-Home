#pragma once

// Copy config_local.example.h to config_local.h only after board/wiring review.
// config_local.h is intentionally excluded from version control.
#if __has_include("config_local.h")
#include "config_local.h"
#endif
#ifndef HUB_HARDWARE_ENABLED
#define HUB_HARDWARE_ENABLED 0
#endif
#ifndef HUB_WIFI_SSID
#define HUB_WIFI_SSID ""
#endif
#ifndef HUB_WIFI_PASSWORD
#define HUB_WIFI_PASSWORD ""
#endif
#ifndef HUB_SETUP_AP_PASSWORD
#define HUB_SETUP_AP_PASSWORD ""
#endif
#ifndef HUB_API_KEY
#define HUB_API_KEY ""
#endif
#ifndef HUB_ALLOWED_ORIGIN
#define HUB_ALLOWED_ORIGIN ""
#endif

namespace Config {
constexpr char Version[] = "1.0.0-dev";
constexpr bool HardwareEnabled = HUB_HARDWARE_ENABLED;
constexpr bool RelayActiveLow = true;
constexpr bool PirActiveHigh = true;
constexpr bool IrActiveLow = true;
constexpr bool RgbCommonAnode = false;
constexpr bool LightHigherMeansBrighter = true;
constexpr bool PhotoAnalog = true;
constexpr bool PhotoDigitalActiveHigh = true;
constexpr bool OledEnabled = true;
constexpr int OledAddress = 0x3C;
constexpr unsigned DhtIntervalMs = 2500;
constexpr unsigned SensorPollMs = 40;
constexpr unsigned ButtonDebounceMs = 40;
constexpr unsigned ParkingDebounceMs = 250;
constexpr unsigned PirWarmupMs = 60000;
constexpr unsigned HistoryIntervalMs = 10000;
constexpr unsigned MaxEvents = 48;
constexpr unsigned MaxHistory = 60;
constexpr unsigned MaxRules = 12;
constexpr unsigned MaxRequestBytes = 4096;
constexpr unsigned PotDeadbandPercent = 3;
constexpr unsigned PotTakeoverPercent = 4;
}

