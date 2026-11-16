#include "sensors.h"
#include "config.h"
#include "pins.h"
#include "state.h"
#include "devices.h"
#include <DHT.h>

namespace {
DHT dht(Pins::Dht, DHT11);
uint32_t lastPoll = 0, lastDht = 0, irChanged = 0, buttonChanged = 0;
bool irCandidate = false, irStable = false, buttonCandidate = false, buttonStable = false;
bool lightStarted = false;
bool pirReady = false;
float filteredLight = 0, filteredPot = 0;
}
namespace Sensors {
void begin() {
  if (!Config::HardwareEnabled) return;
  dht.begin();
  pinMode(Pins::Pir, INPUT);
  pinMode(Pins::Ir, INPUT);
  pinMode(Pins::Photo, INPUT);
  pinMode(Pins::Pot, INPUT);
  pinMode(Pins::Button, INPUT); // GPIO39 requires a physical pull-up to 3.3V.
  analogReadResolution(12);
  lastDht = millis() - Config::DhtIntervalMs;
}
void tick(uint32_t now) {
  if (!Config::HardwareEnabled) return;
  JsonObject s = hubState["sensors"];
  if (uint32_t(now - lastDht) >= Config::DhtIntervalMs) {
    lastDht = now;
    const float humidity = dht.readHumidity(), temperature = dht.readTemperature();
    const bool valid = isfinite(temperature) && isfinite(humidity)
      && temperature >= 0 && temperature <= 50 && humidity >= 0 && humidity <= 100;
    const bool previousError = s["error"];
    s["error"] = !valid;
    if (valid) { s["temperature"] = temperature; s["humidity"] = humidity; }
    else { s["temperature"] = nullptr; s["humidity"] = nullptr; }
    if (previousError != !valid) State::event(valid ? "sensor" : "error", "dht", "system",
      valid ? "DHT readings available" : "DHT read failed; automatic climate output is off");
    State::changed();
  }
  if (uint32_t(now - lastPoll) < Config::SensorPollMs) return;
  lastPoll = now;
  const int raw = Config::PhotoAnalog ? analogRead(Pins::Photo)
    : ((digitalRead(Pins::Photo) == (Config::PhotoDigitalActiveHigh ? HIGH : LOW)) ? 4095 : 0);
  const int pot = analogRead(Pins::Pot);
  if (!lightStarted) { filteredLight = raw; filteredPot = pot; lightStarted = true; }
  filteredLight += (raw - filteredLight) * 0.12f;
  filteredPot += (pot - filteredPot) * 0.12f;
  s["lightRaw"] = int(filteredLight + .5f);
  const int percent = constrain(int(filteredLight * 100 / 4095 + .5f), 0, 100);
  s["lightPercent"] = Config::LightHigherMeansBrighter ? percent : 100 - percent;
  const int potPercent = constrain(int(filteredPot * 100 / 4095 + .5f), 0, 100);
  s["potentiometer"] = potPercent;
  Devices::acceptPot(potPercent);
  if (now >= Config::PirWarmupMs) pirReady = true;
  s["pirReady"] = pirReady;
  const bool motion = pirReady && digitalRead(Pins::Pir) == (Config::PirActiveHigh ? HIGH : LOW);
  if (motion != s["motion"].as<bool>()) {
    s["motion"] = motion;
    State::event("motion", "pir", "system", motion ? "Motion detected" : "Motion cleared");
  }
  const bool ir = digitalRead(Pins::Ir) == (Config::IrActiveLow ? LOW : HIGH);
  if (ir != irCandidate) { irCandidate = ir; irChanged = now; }
  if (irCandidate != irStable && uint32_t(now - irChanged) >= Config::ParkingDebounceMs) {
    irStable = irCandidate;
    s["parking"] = irStable;
    State::event("parking", "ir", "system", irStable ? "Parking occupied" : "Parking vacant");
    Devices::playParking(now);
  }
  const bool button = digitalRead(Pins::Button) == LOW;
  if (button != buttonCandidate) { buttonCandidate = button; buttonChanged = now; }
  if (buttonCandidate != buttonStable && uint32_t(now - buttonChanged) >= Config::ButtonDebounceMs) {
    buttonStable = buttonCandidate;
    if (buttonStable) {
      State::event("doorbell", "button", "system", "Doorbell pressed");
      Devices::playDoorbell(now);
    }
  }
}
}
