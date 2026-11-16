#include "devices.h"
#include "config.h"
#include "pins.h"
#include "state.h"

namespace {
constexpr int RedChannel = 0, GreenChannel = 1, BlueChannel = 2, ToneChannel = 6;
enum class Sound { None, Parking, Doorbell };
Sound sound = Sound::None;
uint32_t soundStart = 0;
int lastTone = -1;
bool potOwned = false;
int previousPot = -1;
uint32_t manualAlarmStart = 0;
bool lastAlarm = false;
void output(int pin, bool on, bool activeLow = false) { digitalWrite(pin, (on != activeLow) ? HIGH : LOW); }
void startSound(Sound kind, uint32_t now) {
  if (kind == Sound::Parking && sound == Sound::Doorbell) return;
  sound = kind; soundStart = now;
}
}

namespace Devices {
void begin() {
  if (!Config::HardwareEnabled) return;
  for (int pin : {Pins::RelayLiving, Pins::RelayClimate}) {
    output(pin, false, Config::RelayActiveLow);
    pinMode(pin, OUTPUT);
  }
  for (int pin : {Pins::OutdoorLed, Pins::ActiveBuzzer, Pins::PassiveBuzzer}) {
    output(pin, false); pinMode(pin, OUTPUT);
  }
  const int rgbPins[] = {Pins::RgbRed, Pins::RgbGreen, Pins::RgbBlue};
  for (int channel=0;channel<3;channel++) {
    digitalWrite(rgbPins[channel], Config::RgbCommonAnode ? HIGH : LOW);
    pinMode(rgbPins[channel],OUTPUT);
    ledcSetup(channel,5000,8);
    ledcWrite(channel,Config::RgbCommonAnode ? 255 : 0);
    ledcAttachPin(rgbPins[channel],channel);
  }
  ledcSetup(ToneChannel, 2000, 8); ledcAttachPin(Pins::PassiveBuzzer, ToneChannel);
  ledcWriteTone(ToneChannel, 0);
}
void playDoorbell(uint32_t now) { startSound(Sound::Doorbell, now); }
void playParking(uint32_t now) { startSound(Sound::Parking, now); }
void webRgbChanged() { potOwned = false; }
void acceptPot(int percent) {
  const int target = hubState["devices"]["rgb"]["brightness"] | 65;
  // Soft takeover: acquire only when the physical knob reaches/crosses the web
  // target. A fixed knob cannot continuously overwrite a new browser setting.
  if (!potOwned && (abs(percent - target) <= int(Config::PotTakeoverPercent)
      || (previousPot >= 0 && (previousPot - target) * (percent - target) < 0))) potOwned = true;
  if (potOwned && abs(percent - target) >= int(Config::PotDeadbandPercent)) {
    hubState["devices"]["rgb"]["brightness"] = percent;
    State::changed();
  }
  previousPot = percent;
}
void tick(uint32_t now) {
  if (hubState["sensors"]["error"].as<bool>() || hubState["sensors"]["temperature"].isNull())
    State::setDevice("climate",false,"system");
  if (!hubState["settings"]["buzzerEnabled"].as<bool>()) State::setDevice("alarm",false,"system");
  JsonObject d = hubState["devices"];
  const bool alarm = d["alarm"]["on"];
  if (alarm && !lastAlarm) manualAlarmStart = now;
  lastAlarm = alarm;
  // A manual buzzer test is bounded even if the browser disconnects.
  if (alarm && !hubState["security"]["alarm"].as<bool>()
      && uint32_t(now - manualAlarmStart) >= uint32_t(hubState["settings"]["alarmDuration"].as<unsigned>() * 1000))
    State::setDevice("alarm", false, "system");
  if (!Config::HardwareEnabled) return;
  output(Pins::RelayLiving, d["living"]["on"], Config::RelayActiveLow);
  output(Pins::RelayClimate, d["climate"]["on"], Config::RelayActiveLow);
  output(Pins::OutdoorLed, d["outdoor"]["on"]);
  const bool buzzerEnabled = hubState["settings"]["buzzerEnabled"];
  output(Pins::ActiveBuzzer, d["alarm"]["on"].as<bool>() && buzzerEnabled);
  const String color = d["rgb"]["color"] | "#ffffff";
  const unsigned rgb = strtoul(color.c_str() + 1, nullptr, 16);
  const float scale = d["rgb"]["on"].as<bool>() ? d["rgb"]["brightness"].as<float>() / 100 : 0;
  const int values[] = {int(((rgb >> 16) & 255) * scale), int(((rgb >> 8) & 255) * scale), int((rgb & 255) * scale)};
  for (int channel = 0; channel < 3; ++channel) ledcWrite(channel, Config::RgbCommonAnode ? 255 - values[channel] : values[channel]);
  int tone = 0;
  const uint32_t elapsed = now - soundStart;
  if (sound == Sound::Doorbell) {
    if (elapsed < 220) tone = 1047;
    else if (elapsed < 500) tone = 784;
    else sound = Sound::None;
  } else if (sound == Sound::Parking) {
    if (elapsed < 100 || (elapsed >= 180 && elapsed < 280)) tone = 1600;
    else if (elapsed >= 280) sound = Sound::None;
  }
  if (!buzzerEnabled) tone = 0;
  if (tone != lastTone) { ledcWriteTone(ToneChannel, tone); lastTone = tone; }
}
}
