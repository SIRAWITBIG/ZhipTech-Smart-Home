#include "automation.h"
#include "state.h"
#include "config.h"

namespace {
uint32_t lastTick = 0, lastMotion = 0;
uint32_t pendingSince[Config::MaxRules] = {};
bool matched[Config::MaxRules] = {}, waiting[Config::MaxRules] = {};
bool motionSeen = false;
bool automatic(const char* id) { return hubState["devices"][id]["mode"] == "auto"; }
}
namespace Automation {
void reset() {
  for (unsigned i = 0; i < Config::MaxRules; i++) { pendingSince[i] = 0; matched[i] = false; waiting[i] = false; }
  motionSeen = false;
}
void tick(uint32_t now) {
  if (uint32_t(now - lastTick) < 100) return;
  lastTick = now;
  JsonObject s = hubState["sensors"], settings = hubState["settings"];
  const char* ids[] = {"living","climate","outdoor"};
  bool desired[] = {hubState["devices"]["living"]["on"],hubState["devices"]["climate"]["on"],hubState["devices"]["outdoor"]["on"]};
  if (s["motion"].as<bool>()) { lastMotion = now; motionSeen = true; }
  if (automatic("living")) {
    const uint32_t timeout = settings["motionTimeout"].as<unsigned>() * 1000;
    desired[0] = motionSeen && uint32_t(now - lastMotion) < timeout;
  }
  if (automatic("climate")) {
    bool on = hubState["devices"]["climate"]["on"];
    if (s["temperature"].isNull() || s["error"].as<bool>()) on = false;
    else {
      const float temperature = s["temperature"], threshold = settings["temperatureThreshold"], hysteresis = settings["temperatureHysteresis"];
      if (temperature >= threshold) on = true;
      else if (temperature <= threshold - hysteresis) on = false;
    }
    desired[1] = on;
  }
  if (automatic("outdoor")) {
    bool on = hubState["devices"]["outdoor"]["on"];
    if (s["lightPercent"].isNull() || s["error"].as<bool>()) on = false;
    else {
      const float light = s["lightPercent"], threshold = settings["lightThreshold"], hysteresis = settings["lightHysteresis"];
      if (light <= threshold) on = true;
      else if (light >= threshold + hysteresis) on = false;
    }
    desired[2] = on;
  }
  unsigned index = 0;
  for (JsonObject rule : hubState["rules"].as<JsonArray>()) {
    if (index >= Config::MaxRules) break;
    const String device = rule["device"], sensor = rule["sensor"], op = rule["operator"];
    if (!rule["enabled"].as<bool>() || s[sensor].isNull() || (s["error"].as<bool>() && sensor != "motion")) {
      matched[index] = false; waiting[index++] = false; continue;
    }
    const float value = sensor == "motion" ? (s["motion"].as<bool>() ? 1.f : 0.f) : s[sensor].as<float>();
    const float threshold = rule["threshold"], h = rule["hysteresis"];
    bool condition = op == "gt" ? value > (matched[index] ? threshold - h : threshold)
      : op == "lt" ? value < (matched[index] ? threshold + h : threshold) : value == threshold;
    matched[index] = condition;
    if (!condition) waiting[index] = false;
    else {
      if (!waiting[index]) { pendingSince[index] = now; waiting[index] = true; }
      if (uint32_t(now - pendingSince[index]) >= rule["delaySeconds"].as<unsigned>() * 1000 && hubState["devices"][device]["mode"] == "auto")
        for (unsigned i=0;i<3;i++) if (device == ids[i]) desired[i] = rule["action"].as<bool>();
    }
    index++;
  }
  // Compute once, then commit once: no transient built-in/rule output flapping.
  if (s["error"].as<bool>() || s["temperature"].isNull()) desired[1] = false;
  for (unsigned i=0;i<3;i++) State::setDevice(ids[i],desired[i],"automation");
}
}
