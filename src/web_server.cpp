#include "web_server.h"
#include "state.h"
#include "config.h"
#include "storage.h"
#include "security.h"
#include "automation.h"
#include "devices.h"
#include <WebServer.h>
#include <LittleFS.h>

namespace {
WebServer server(80);
bool filesystemReady = false;
uint32_t ruleCounter = 0;
void error(int status, const String& message) {
  StaticJsonDocument<256> doc;
  doc["error"] = message;
  String body;
  serializeJson(doc, body);
  server.sendHeader("Cache-Control", "no-store");
  server.send(status, "application/json; charset=utf-8", body);
}
bool constantEquals(const String& provided, const char* expected) {
  const size_t length = strlen(expected);
  unsigned difference = provided.length() ^ length;
  for (size_t i = 0; i < length; ++i) difference |= (i < provided.length() ? provided[i] : 0) ^ expected[i];
  return difference == 0;
}
bool originAllowed() {
  const String origin = server.header("Origin");
  if (origin.isEmpty()) return true;
  const String ownOrigin = String("http://") + server.hostHeader();
  if (origin == ownOrigin) return true;
  if (strlen(HUB_ALLOWED_ORIGIN) && origin == HUB_ALLOWED_ORIGIN) {
    server.sendHeader("Access-Control-Allow-Origin", origin);
    server.sendHeader("Vary", "Origin");
    return true;
  }
  error(403, "Origin not allowed"); return false;
}
bool authorize() {
  if (!originAllowed()) return false;
  if (strlen(HUB_API_KEY) && !constantEquals(server.header("X-API-Key"), HUB_API_KEY)) {
    error(401, "A valid X-API-Key is required"); return false;
  }
  return true;
}
void status() {
  // Apply safe effective outputs before returning acknowledged state.
  Devices::tick(millis());
  String json;
  State::serialize(json);
  server.sendHeader("Cache-Control", "no-store");
  server.send(200, "application/json; charset=utf-8", json);
}
bool body(DynamicJsonDocument& doc) {
  if (server.arg("plain").length() > Config::MaxRequestBytes) { error(413,"JSON body exceeds 4096 bytes"); return false; }
  if (deserializeJson(doc, server.arg("plain")) || !doc.is<JsonObject>()) { error(400,"Expected a JSON object"); return false; }
  return true;
}
bool allowedKeys(JsonObjectConst object, std::initializer_list<const char*> allowed) {
  for (JsonPairConst item : object) {
    bool found = false;
    for (const char* key : allowed) if (!strcmp(item.key().c_str(), key)) { found = true; break; }
    if (!found) return false;
  }
  return true;
}
bool number(JsonVariantConst value, float low, float high) {
  return value.is<float>() && isfinite(value.as<float>()) && value.as<float>() >= low && value.as<float>() <= high;
}
bool text(JsonVariantConst value, size_t min, size_t max) {
  if (!value.is<const char*>()) return false;
  String trimmed = value.as<String>(); trimmed.trim();
  if (trimmed.isEmpty()) return false;
  const unsigned char* s = reinterpret_cast<const unsigned char*>(value.as<const char*>());
  size_t count = 0;
  for (; *s; s++) if ((*s & 0xC0) != 0x80) count++;
  return count >= min && count <= max;
}
bool color(JsonVariantConst value) {
  if (!text(value,7,7)) return false;
  const char* s = value;
  if (s[0] != '#') return false;
  for (unsigned i=1;i<7;i++) if (!isxdigit(s[i])) return false;
  return true;
}
bool validDevicePatch(const String& id, JsonObjectConst patch) {
  if (patch.size() == 0 || !allowedKeys(patch,{"on","mode","color","brightness"})) return false;
  if (patch.containsKey("on") && !patch["on"].is<bool>()) return false;
  if (patch.containsKey("mode") && patch["mode"] != "auto" && patch["mode"] != "manual") return false;
  if (patch.containsKey("color") && (id != "rgb" || !color(patch["color"]))) return false;
  if (patch.containsKey("brightness") && (id != "rgb" || !number(patch["brightness"],0,100))) return false;
  return true;
}
void applyDevicePatch(JsonObject target, JsonObjectConst patch, bool manual = true) {
  for (JsonPairConst item : patch) target[item.key()] = item.value();
  if (manual && patch.containsKey("on") && !patch.containsKey("mode")) target["mode"] = "manual";
}
bool validRule(JsonObjectConst rule) {
  if (!allowedKeys(rule,{"id","name","sensor","operator","threshold","device","action","enabled","delaySeconds","hysteresis"})) return false;
  if (!text(rule["name"],1,60) || !rule["action"].is<bool>() || !rule["enabled"].is<bool>()) return false;
  if (rule.containsKey("id")) {
    if (!text(rule["id"],1,40)) return false;
    for (const char* id = rule["id"].as<const char*>(); *id; id++)
      if (!((*id >= 'a' && *id <= 'z') || (*id >= 'A' && *id <= 'Z') || (*id >= '0' && *id <= '9') || *id == '_' || *id == '-')) return false;
  }
  const String sensor = rule["sensor"] | "", op = rule["operator"] | "", device = rule["device"] | "";
  if (sensor != "temperature" && sensor != "lightPercent" && sensor != "motion") return false;
  if (op != "gt" && op != "lt" && op != "eq") return false;
  if (device != "living" && device != "climate" && device != "outdoor") return false;
  if (!number(rule["threshold"],0,sensor == "motion" ? 1 : sensor == "temperature" ? 50 : 100)) return false;
  if (sensor == "motion" && (op != "eq" || (rule["threshold"] != 0 && rule["threshold"] != 1))) return false;
  return number(rule["delaySeconds"],0,3600) && rule["delaySeconds"].is<unsigned>()
    && number(rule["hysteresis"],0,sensor == "motion" ? 0 : sensor == "temperature" ? 10 : 30);
}
bool predicatesOverlap(JsonObjectConst a, JsonObjectConst b) {
  if (a["sensor"].as<String>() != b["sensor"].as<String>()) return true;
  const String aOp = a["operator"], bOp = b["operator"];
  const float aT = a["threshold"], bT = b["threshold"];
  if (aOp == "eq") return bOp == "eq" ? aT == bT : bOp == "gt" ? aT > bT : aT < bT;
  if (bOp == "eq") return predicatesOverlap(b,a);
  if (aOp == bOp) return true;
  return aOp == "gt" ? aT < bT : bT < aT;
}
bool ruleConflict(JsonObjectConst candidate, const String& exceptId) {
  if (!candidate["enabled"].as<bool>()) return false;
  for (JsonObject rule : hubState["rules"].as<JsonArray>()) {
    if (rule["id"].as<String>() == exceptId || !rule["enabled"].as<bool>()) continue;
    if (rule["device"].as<String>() == candidate["device"].as<String>() && rule["action"].as<bool>() != candidate["action"].as<bool>() && predicatesOverlap(rule,candidate)) return true;
  }
  return false;
}
bool validSettings(JsonObjectConst patch) {
  if (!patch.size() || !allowedKeys(patch,{"deviceName","temperatureThreshold","temperatureHysteresis","lightThreshold","lightHysteresis","motionTimeout","alarmDuration","displayEnabled","buzzerEnabled"})) return false;
  for (JsonPairConst item : patch) {
    const String key = item.key().c_str();
    if (key == "deviceName") { if (!text(item.value(),1,40)) return false; }
    else if (key == "displayEnabled" || key == "buzzerEnabled") { if (!item.value().is<bool>()) return false; }
    else {
      float lo = 0, hi = 100;
      if (key == "temperatureThreshold") { lo = 0; hi = 50; }
      if (key == "temperatureHysteresis") { lo = .5; hi = 10; }
      if (key == "lightHysteresis") { lo = 1; hi = 30; }
      if (key == "motionTimeout") { lo = 1; hi = 3600; }
      if (key == "alarmDuration") { lo = 1; hi = 120; }
      if (!number(item.value(),lo,hi)) return false;
      if ((key == "motionTimeout" || key == "alarmDuration") && !item.value().is<unsigned>()) return false;
    }
  }
  return true;
}
String mime(const String& path) {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".svg")) return "image/svg+xml";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".woff2")) return "font/woff2";
  if (path.endsWith(".ttf")) return "font/ttf";
  return "application/octet-stream";
}
void serveStatic() {
  if (server.method() != HTTP_GET) { error(405,"Method not allowed"); return; }
  if (!filesystemReady) { error(503,"LittleFS unavailable; build and review filesystem image before upload"); return; }
  String path = server.uri();
  if (path.indexOf("..") >= 0 || path.indexOf('\\') >= 0 || path.length() > 160) { error(400,"Invalid path"); return; }
  if (path == "/") path = "/index.html";
  String selected = path;
  if (server.header("Accept-Encoding").indexOf("gzip") >= 0 && LittleFS.exists(path + ".gz")) {
    selected += ".gz";
    server.sendHeader("Content-Encoding","gzip");
    server.sendHeader("Vary","Accept-Encoding");
  }
  if (!LittleFS.exists(selected)) { error(404,"File not found"); return; }
  File file = LittleFS.open(selected,"r");
  server.sendHeader("X-Content-Type-Options","nosniff");
  server.sendHeader("Cache-Control","no-cache");
  server.streamFile(file,mime(path));
  file.close();
}
void route() {
  const String path = server.uri();
  if (!path.startsWith("/api/")) { serveStatic(); return; }
  if (server.method() == HTTP_OPTIONS) {
    if (!originAllowed()) return;
    server.sendHeader("Access-Control-Allow-Headers","Content-Type, X-API-Key");
    server.sendHeader("Access-Control-Allow-Methods","GET, POST, PATCH, DELETE, OPTIONS");
    server.send(204); return;
  }
  if (path == "/api/health" && server.method() == HTTP_GET) {
    if (!originAllowed()) return;
    StaticJsonDocument<256> doc;
    doc["ok"] = true; doc["schemaVersion"] = 1; doc["firmwareVersion"] = Config::Version;
    doc["hardwareEnabled"] = Config::HardwareEnabled; doc["apiKeyRequired"] = strlen(HUB_API_KEY) > 0;
    doc["freeHeap"] = ESP.getFreeHeap();
    String result; serializeJson(doc,result); server.send(200,"application/json",result); return;
  }
  if (!authorize()) return;
  if (server.method() == HTTP_GET) {
    if (path == "/api/status") { status(); return; }
    const String fields[][2] = {{"/api/sensors","sensors"},{"/api/devices","devices"},{"/api/scenes","scenes"},
      {"/api/automation","rules"},{"/api/events","events"},{"/api/history","history"},{"/api/settings","settings"}};
    for (const auto& entry : fields) if (path == entry[0]) {
      String result; serializeJson(hubState[entry[1]],result);
      server.sendHeader("Cache-Control","no-store"); server.send(200,"application/json; charset=utf-8",result); return;
    }
    error(404,"Unknown API endpoint"); return;
  }
  DynamicJsonDocument request(6144);
  if (server.method() != HTTP_DELETE && !body(request)) return;
  const JsonObjectConst patch = request.as<JsonObjectConst>();
  if (path.startsWith("/api/devices/") && server.method() == HTTP_PATCH) {
    const String id = path.substring(strlen("/api/devices/"));
    if (!State::deviceExists(id)) { error(404,"Unknown device"); return; }
    if (!validDevicePatch(id,patch)) { error(422,"Invalid device patch"); return; }
    if (id == "alarm" && hubState["security"]["alarm"].as<bool>()) { error(409,"Active incident: use security mute or acknowledge"); return; }
    applyDevicePatch(hubState["devices"][id],patch);
    if (id == "rgb") Devices::webRgbChanged();
    State::event("device",id.c_str(),"manual","Device settings updated");
    status(); return;
  }
  if (path == "/api/scenes/activate" && server.method() == HTTP_POST) {
    if (!allowedKeys(patch,{"id"}) || !text(patch["id"],1,24)) { error(422,"Expected a valid scene id"); return; }
    const String id = patch["id"];
    bool exists = false;
    for (JsonObject scene : hubState["scenes"].as<JsonArray>()) if (scene["id"].as<String>() == id) exists = true;
    if (!exists) { error(404,"Unknown scene"); return; }
    if (!State::applyScene(id)) { error(409,"Acknowledge or disarm the security incident before this scene"); return; }
    status(); return;
  }
  if (path.startsWith("/api/scenes/") && server.method() == HTTP_PATCH) {
    const String id = path.substring(strlen("/api/scenes/"));
    if (!patch.size() || !allowedKeys(patch,{"name","devices","securityArmed"})
      || (patch.containsKey("name") && !text(patch["name"],1,40))
      || (patch.containsKey("securityArmed") && !patch["securityArmed"].is<bool>())) { error(422,"Invalid scene patch"); return; }
    if (patch.containsKey("devices")) {
      if (!patch["devices"].is<JsonObjectConst>()) { error(422,"Expected scene devices object"); return; }
      for (JsonPairConst item : patch["devices"].as<JsonObjectConst>()) {
        const String device = item.key().c_str();
        if ((device != "living" && device != "climate" && device != "outdoor" && device != "rgb")
          || !item.value().is<JsonObjectConst>() || !validDevicePatch(device,item.value().as<JsonObjectConst>())) {
          error(422,"Invalid scene device settings"); return;
        }
      }
    }
    for (JsonObject scene : hubState["scenes"].as<JsonArray>()) if (scene["id"].as<String>() == id) {
      if (patch.containsKey("name")) scene["name"] = patch["name"];
      if (patch.containsKey("securityArmed")) scene["securityArmed"] = patch["securityArmed"];
      for (JsonPairConst item : patch["devices"].as<JsonObjectConst>()) applyDevicePatch(scene["devices"][item.key()],item.value().as<JsonObjectConst>());
      Storage::scheduleSave(); State::event("scene",id.c_str(),"manual","Scene definition saved"); status(); return;
    }
    error(404,"Unknown scene"); return;
  }
  if (path == "/api/automation" && server.method() == HTTP_POST) {
    if (patch.containsKey("id") || !validRule(patch)) { error(422,"Invalid automation rule"); return; }
    JsonArray rules = hubState["rules"];
    if (rules.size() >= Config::MaxRules) { error(409,"Maximum 12 automation rules"); return; }
    if (ruleConflict(patch,"")) { error(409,"Overlapping rules target the same device with opposite actions"); return; }
    JsonObject rule = rules.createNestedObject(); rule.set(patch);
    rule["id"] = String("rule-") + String(esp_random(),HEX) + String(++ruleCounter);
    Automation::reset(); Storage::scheduleSave(); State::event("automation","hub","manual","Rule created"); status(); return;
  }
  if (path.startsWith("/api/automation/") && (server.method() == HTTP_PATCH || server.method() == HTTP_DELETE)) {
    const String id = path.substring(strlen("/api/automation/"));
    JsonArray rules = hubState["rules"];
    for (unsigned i=0;i<rules.size();i++) if (rules[i]["id"].as<String>() == id) {
      if (server.method() == HTTP_DELETE) rules.remove(i);
      else {
        if (patch.containsKey("id") || !patch.size()) { error(422,"Rule id is immutable"); return; }
        DynamicJsonDocument candidate(2048); candidate.set(rules[i]);
        for (JsonPairConst item : patch) candidate[item.key()] = item.value();
        if (!validRule(candidate.as<JsonObjectConst>())) { error(422,"Invalid automation rule patch"); return; }
        if (ruleConflict(candidate.as<JsonObjectConst>(),id)) { error(409,"Conflicting enabled rule"); return; }
        rules[i] = candidate;
      }
      Automation::reset(); Storage::scheduleSave(); State::event("automation","hub","manual","Rules updated"); status(); return;
    }
    error(404,"Unknown automation rule"); return;
  }
  if (path == "/api/settings" && server.method() == HTTP_PATCH) {
    if (!validSettings(patch)) { error(422,"Invalid settings or unsupported key"); return; }
    for (JsonPairConst item : patch) hubState["settings"][item.key()] = item.value();
    Storage::scheduleSave(); State::event("settings","hub","manual","Settings updated"); status(); return;
  }
  if (path == "/api/settings/reset" && server.method() == HTTP_POST) {
    if (!allowedKeys(patch,{"confirm"}) || !patch["confirm"].is<bool>() || !patch["confirm"].as<bool>()) { error(422,"Explicit confirm:true required"); return; }
    // Preserve operating state and incident history; reset configuration only.
    JsonObject settings = hubState["settings"];
    settings["deviceName"] = "ZhipTech - Smart Home"; settings["temperatureThreshold"] = 28;
    settings["temperatureHysteresis"] = 2; settings["lightThreshold"] = 30;
    settings["lightHysteresis"] = 5; settings["motionTimeout"] = 30;
    settings["alarmDuration"] = 15; settings["displayEnabled"] = true; settings["buzzerEnabled"] = true;
    hubState["rules"].as<JsonArray>().clear();
    for (JsonObject scene : hubState["scenes"].as<JsonArray>()) {
      const String id = scene["id"];
      const bool away = id == "away", night = id == "night", work = id == "work";
      scene["name"] = id=="home" ? "อยู่บ้าน" : away ? "ออกจากบ้าน" : night ? "พักผ่อน" : "ทำงาน"; scene["securityArmed"] = away;
      scene["devices"]["living"]["on"] = work;
      scene["devices"]["living"]["mode"] = away || night || work ? "manual" : "auto";
      scene["devices"]["climate"]["on"] = false; scene["devices"]["climate"]["mode"] = away ? "manual" : "auto";
      scene["devices"]["outdoor"]["on"] = false; scene["devices"]["outdoor"]["mode"] = "auto";
      scene["devices"]["rgb"]["on"] = !away; scene["devices"]["rgb"]["mode"] = "manual";
      scene["devices"]["rgb"]["color"] = night ? "#a78bfa" : work ? "#ffffff" : "#29d6ab";
      scene["devices"]["rgb"]["brightness"] = night ? 20 : work ? 80 : 65;
    }
    Automation::reset(); Storage::scheduleSave(); State::event("settings","hub","manual","Configuration defaults restored; Wi-Fi unchanged"); status(); return;
  }
  if (path.startsWith("/api/security/") && server.method() == HTTP_POST) {
    if (patch.size()) { error(422,"Security command expects an empty object"); return; }
    const String action = path.substring(strlen("/api/security/"));
    if (action == "arm") Security::arm();
    else if (action == "disarm") Security::disarm();
    else if (action == "mute") Security::mute();
    else if (action == "acknowledge") Security::acknowledge();
    else { error(404,"Unknown security action"); return; }
    status(); return;
  }
  error(404,"Unsupported API endpoint or method");
}
}

namespace Web {
bool validateConfiguration(JsonObjectConst config) {
  if (config["schemaVersion"] != 1 || !allowedKeys(config,{"schemaVersion","settings","scenes","rules"})) return false;
  const JsonObjectConst settings=config["settings"];
  if (settings.size()!=9 || !validSettings(settings)) return false;
  if (!config["scenes"].is<JsonArrayConst>() || config["scenes"].size()!=4
      || !config["rules"].is<JsonArrayConst>() || config["rules"].size()>Config::MaxRules) return false;
  bool seen[4]={false,false,false,false};
  const char* ids[]={"home","away","night","work"};
  for (JsonObjectConst scene:config["scenes"].as<JsonArrayConst>()) {
    if (scene.size()!=4 || !allowedKeys(scene,{"id","name","devices","securityArmed"})
        || !text(scene["name"],1,40) || !scene["securityArmed"].is<bool>()) return false;
    int found=-1;
    for (int i=0;i<4;i++) if (scene["id"]==ids[i]) found=i;
    if (found<0 || seen[found]) return false;
    seen[found]=true;
    const JsonObjectConst devices=scene["devices"];
    if (devices.size()!=4 || !allowedKeys(devices,{"living","climate","outdoor","rgb"})) return false;
    for (JsonPairConst device:devices) {
      const JsonObjectConst patch=device.value();
      const String id=device.key().c_str();
      if (!validDevicePatch(id,patch) || !patch["on"].is<bool>() || !patch.containsKey("mode")) return false;
      if (id=="rgb" && (!patch.containsKey("color") || !patch.containsKey("brightness"))) return false;
    }
  }
  const JsonArrayConst rules=config["rules"];
  for (unsigned i=0;i<rules.size();i++) {
    const JsonObjectConst rule=rules[i];
    if (!rule.containsKey("id") || !validRule(rule)) return false;
    for (unsigned j=0;j<i;j++) {
      const JsonObjectConst other=rules[j];
      if (rule["id"].as<String>()==other["id"].as<String>()) return false;
      if (rule["enabled"].as<bool>() && other["enabled"].as<bool>() && rule["device"].as<String>()==other["device"].as<String>()
          && rule["action"].as<bool>()!=other["action"].as<bool>() && predicatesOverlap(rule,other)) return false;
    }
  }
  return true;
}
void begin() {
  filesystemReady = LittleFS.begin(false); // Never format user flash automatically.
  if (!filesystemReady) State::event("error","filesystem","system","LittleFS mount failed; no automatic format");
  const char* headers[] = {"Origin","X-API-Key","Accept-Encoding"};
  server.collectHeaders(headers,3);
  server.onNotFound(route);
  server.begin();
}
void tick() { server.handleClient(); }
}
