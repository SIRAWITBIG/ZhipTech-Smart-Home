#include "state.h"
#include "config.h"
#include "devices.h"
#include "automation.h"
#include "security.h"
#include <time.h>

DynamicJsonDocument hubState(65536);
namespace {
uint32_t lastHistory = 0;
uint32_t sequence = 0;
void makeDevice(JsonObject parent, const char* id, bool on, const char* mode) {
  JsonObject device = parent.createNestedObject(id);
  device["on"] = on;
  device["mode"] = mode;
}
String timestamp() {
  const time_t seconds = time(nullptr);
  if (seconds < 1700000000) return String();
  struct tm utc;
  gmtime_r(&seconds, &utc);
  char value[25];
  strftime(value, sizeof(value), "%Y-%m-%dT%H:%M:%SZ", &utc);
  return value;
}
}

namespace State {
void begin() {
  hubState["schemaVersion"] = 1;
  hubState["mode"] = "live";
  hubState["connected"] = true;
  hubState["scene"] = "home";
  hubState["firmwareVersion"] = Config::Version;
  hubState["uptimeMs"] = 0;
  hubState["updatedAt"] = nullptr;
  JsonObject caps = hubState.createNestedObject("capabilities");
  caps["hardwareEnabled"] = Config::HardwareEnabled;
  caps["automation"] = true;
  caps["sceneEditing"] = true;
  caps["settingsReset"] = true;
  caps["wifiConfiguration"] = false;
  caps["maxRules"] = Config::MaxRules;
  caps["maxEvents"] = Config::MaxEvents;
  caps["maxHistory"] = Config::MaxHistory;
  JsonObject sensors = hubState.createNestedObject("sensors");
  for (const char* key : {"temperature", "humidity", "lightRaw", "lightPercent", "potentiometer"}) sensors[key] = nullptr;
  sensors["motion"] = false;
  sensors["parking"] = false;
  sensors["error"] = true;
  sensors["pirReady"] = false;
  JsonObject devices = hubState.createNestedObject("devices");
  makeDevice(devices, "living", false, "auto");
  makeDevice(devices, "climate", false, "auto");
  makeDevice(devices, "outdoor", false, "auto");
  makeDevice(devices, "rgb", true, "manual");
  devices["rgb"]["color"] = "#29d6ab";
  devices["rgb"]["brightness"] = 65;
  makeDevice(devices, "alarm", false, "auto");
  JsonObject security = hubState.createNestedObject("security");
  security["armed"] = false;
  security["alarm"] = false;
  security["muted"] = false;
  security["acknowledged"] = true;
  JsonObject settings = hubState.createNestedObject("settings");
  settings["deviceName"] = "ZhipTech - Smart Home";
  settings["temperatureThreshold"] = 28;
  settings["temperatureHysteresis"] = 2;
  settings["lightThreshold"] = 30;
  settings["lightHysteresis"] = 5;
  settings["motionTimeout"] = 30;
  settings["alarmDuration"] = 15;
  settings["displayEnabled"] = true;
  settings["buzzerEnabled"] = true;
  hubState.createNestedArray("rules");
  hubState.createNestedArray("events");
  hubState.createNestedArray("history");
  JsonArray scenes = hubState.createNestedArray("scenes");
  for (const char* id : {"home", "away", "night", "work"}) {
    JsonObject scene = scenes.createNestedObject();
    scene["id"] = id;
    scene["name"] = !strcmp(id,"home") ? "อยู่บ้าน" : !strcmp(id,"away") ? "ออกจากบ้าน" : !strcmp(id,"night") ? "พักผ่อน" : "ทำงาน";
    scene["securityArmed"] = !strcmp(id, "away");
    JsonObject d = scene.createNestedObject("devices");
    const bool away = !strcmp(id,"away"), night = !strcmp(id,"night"), work = !strcmp(id,"work");
    makeDevice(d,"living",work,away || night || work ? "manual" : "auto");
    makeDevice(d,"climate",false,away ? "manual" : "auto");
    makeDevice(d,"outdoor",false,"auto");
    makeDevice(d,"rgb",!away,"manual");
    d["rgb"]["color"] = night ? "#a78bfa" : work ? "#ffffff" : "#29d6ab";
    d["rgb"]["brightness"] = night ? 20 : work ? 80 : 65;
  }
}

void changed() { hubState["revision"] = (hubState["revision"] | 0U) + 1; }

void event(const char* type, const char* device, const char* source, const String& message) {
  JsonArray events = hubState["events"];
  if (events.size() >= Config::MaxEvents) events.remove(0);
  JsonObject entry = events.createNestedObject();
  entry["id"] = String(++sequence);
  const String now = timestamp();
  if (now.length()) entry["timestamp"] = now; else entry["timestamp"] = nullptr;
  entry["uptimeMs"] = millis();
  entry["type"] = type;
  entry["device"] = device;
  entry["source"] = !strcmp(source,"security") ? "automation" : !strcmp(source,"sensor") ? "system" : source;
  entry["message"] = message;
  changed();
}

bool deviceExists(const String& id) { return hubState["devices"].containsKey(id); }

void setDevice(const String& id, bool on, const char* source) {
  if (!deviceExists(id) || hubState["devices"][id]["on"].as<bool>() == on) return;
  hubState["devices"][id]["on"] = on;
  event("device", id.c_str(), source, String(on ? "On" : "Off"));
}

bool applyScene(const String& id, bool log) {
  for (JsonObject scene : hubState["scenes"].as<JsonArray>()) {
    if (scene["id"].as<String>() != id) continue;
    if (!scene["securityArmed"].as<bool>() && (hubState["security"]["alarm"].as<bool>()
        || !hubState["security"]["acknowledged"].as<bool>())) return false;
    for (JsonPair pair : scene["devices"].as<JsonObject>()) hubState["devices"][pair.key()] = pair.value();
    hubState["scene"] = id;
    // The guard above requires acknowledgement/disarm before disarming scenes.
    if (scene["securityArmed"].as<bool>()) Security::arm();
    else if (!hubState["security"]["alarm"].as<bool>()) Security::disarm();
    Devices::webRgbChanged();
    Automation::reset();
    if (log) event("scene", "hub", "manual", String("Scene: ") + id);
    changed();
    return true;
  }
  return false;
}

void tick(uint32_t now) {
  // Collect only at the end of the application loop, after all modules have
  // released JsonObject/JsonVariant views into this document.
  if (hubState.memoryUsage() > 48000) hubState.garbageCollect();
  hubState["uptimeMs"] = now;
  if (uint32_t(now - lastHistory) < Config::HistoryIntervalMs) return;
  lastHistory = now;
  const String stamp = timestamp();
  if (stamp.length()) hubState["updatedAt"] = stamp; else hubState["updatedAt"] = nullptr;
  // No synthetic data or unconnected samples in live mode.
  if (!Config::HardwareEnabled) { hubState.garbageCollect(); return; }
  JsonArray history = hubState["history"];
  if (history.size() >= Config::MaxHistory) history.remove(0);
  JsonObject sample = history.createNestedObject();
  sample["timestamp"] = hubState["updatedAt"];
  sample["uptimeMs"] = now;
  for (const char* key : {"temperature", "humidity", "lightPercent", "motion", "parking"}) sample[key] = hubState["sensors"][key];
  // JsonDocument's monotonic allocator needs occasional garbage collection
  // after bounded array entries have been removed/replaced.
  hubState.garbageCollect();
}

void serialize(String& output) {
  hubState["uptimeMs"] = millis();
  serializeJson(hubState, output);
}
}
