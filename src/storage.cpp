#include "storage.h"
#include "state.h"
#include "config.h"
#include "web_server.h"
#include <Preferences.h>

namespace {
Preferences preferences;
bool pending = false;
uint32_t dirtySince = 0;
}
namespace Storage {
void begin() { preferences.begin("smarthome", false); }
void load() {
  const String json = preferences.getString("config", "");
  if (json.isEmpty()) return;
  DynamicJsonDocument saved(12288);
  if (deserializeJson(saved, json) || !Web::validateConfiguration(saved.as<JsonObjectConst>())) {
    State::event("error", "storage", "system", "Stored configuration rejected; using defaults");
    return;
  }
  // Configuration is produced only by validated API writes. Outputs and security
  // incidents deliberately do not restore automatically after a power loss.
  if (saved["settings"].is<JsonObject>()) hubState["settings"] = saved["settings"];
  if (saved["scenes"].is<JsonArray>()) hubState["scenes"] = saved["scenes"];
  if (saved["rules"].is<JsonArray>() && saved["rules"].size() <= Config::MaxRules) hubState["rules"] = saved["rules"];
}
void scheduleSave() { pending = true; dirtySince = millis(); }
void tick(uint32_t now) {
  if (!pending || uint32_t(now - dirtySince) < 2000) return;
  pending = false;
  DynamicJsonDocument saved(12288);
  saved["schemaVersion"] = 1;
  saved["settings"] = hubState["settings"];
  saved["scenes"] = hubState["scenes"];
  saved["rules"] = hubState["rules"];
  if (saved.overflowed()) {
    State::event("error", "storage", "system", "Configuration too large to persist");
    return;
  }
  String json;
  serializeJson(saved, json);
  if (preferences.getString("config", "") != json && !preferences.putString("config", json))
    State::event("error", "storage", "system", "NVS save failed");
}
String wifiSsid() { return preferences.getString("ssid", HUB_WIFI_SSID); }
String wifiPassword() { return preferences.getString("wifiPass", HUB_WIFI_PASSWORD); }
bool saveWifi(const String& ssid, const String& password) {
  if (ssid.isEmpty() || ssid.length() > 32 || password.length() > 63 || (password.length() > 0 && password.length() < 8)) return false;
  return preferences.putString("ssid", ssid) > 0
    && preferences.putString("wifiPass", password) == password.length();
}
}
