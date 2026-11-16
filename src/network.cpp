#include "network.h"
#include "storage.h"
#include "config.h"
#include "state.h"
#include <WiFi.h>
#include <time.h>

namespace {
uint32_t started = 0, lastReconnect = 0;
bool apActive = false, previouslyConnected = false;
void startRecoveryAp() {
  if (apActive || strlen(HUB_SETUP_AP_PASSWORD) < 12 || strlen(HUB_API_KEY) < 12) return;
  WiFi.mode(WIFI_AP_STA);
  apActive = WiFi.softAP("ZhipTech-SmartHome-Setup", HUB_SETUP_AP_PASSWORD, 1, false, 2);
  State::event(apActive ? "network" : "error", "wifi", "system",
    apActive ? "Password-protected setup AP enabled; use configured private credentials" : "Setup AP failed");
}
}
namespace Network {
void begin() {
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.setHostname("zhiptech-smarthome");
  started = millis();
  const String ssid = Storage::wifiSsid();
  if (ssid.length()) WiFi.begin(ssid.c_str(), Storage::wifiPassword().c_str());
  else {
    Serial.println("Wi-Fi credentials absent: configure private include/config_local.h");
    startRecoveryAp();
  }
}
void reconfigure() {
  WiFi.disconnect(false, false);
  const String ssid = Storage::wifiSsid();
  if (ssid.length()) WiFi.begin(ssid.c_str(), Storage::wifiPassword().c_str());
  started = millis();
}
bool setupApActive() { return apActive; }
String ip() { return WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : apActive ? WiFi.softAPIP().toString() : "0.0.0.0"; }
void tick(uint32_t now) {
  const bool connected = WiFi.status() == WL_CONNECTED;
  if (connected != previouslyConnected) {
    previouslyConnected = connected;
    State::event("network", "wifi", "system", connected ? "Wi-Fi connected" : "Wi-Fi disconnected; automation continues locally");
    if (connected) {
      configTime(0, 0, "pool.ntp.org", "time.nist.gov");
      Serial.print("Local IP: "); Serial.println(WiFi.localIP());
    }
  }
  if (!connected && uint32_t(now - started) > 30000) startRecoveryAp();
  if (!connected && uint32_t(now - lastReconnect) > 15000 && Storage::wifiSsid().length()) {
    lastReconnect = now;
    WiFi.reconnect();
  }
  JsonObject network = hubState["network"];
  if (network.isNull()) network = hubState.createNestedObject("network");
  network["stationConnected"] = connected;
  network["setupApActive"] = apActive;
  network["ip"] = ip();
  if (connected) network["rssi"] = WiFi.RSSI(); else network["rssi"] = nullptr;
}
}
