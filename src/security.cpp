#include "security.h"
#include "state.h"

namespace {
uint32_t alarmStart = 0, lastIncident = 0;
bool previousMotion = false;
}
namespace Security {
void arm() {
  if (hubState["security"]["armed"].as<bool>()) return;
  hubState["security"]["armed"] = true;
  previousMotion = false;
  lastIncident = 0;
  // Preserve an ongoing incident. Arm/disarm acknowledgement is explicit.
  State::event("security", "alarm", "manual", "Security armed");
}
void disarm() {
  const bool wasArmed = hubState["security"]["armed"];
  hubState["security"]["armed"] = false;
  hubState["security"]["alarm"] = false;
  hubState["security"]["muted"] = false;
  hubState["security"]["acknowledged"] = true;
  State::setDevice("alarm", false, "security");
  if (wasArmed) State::event("security", "alarm", "manual", "Security disarmed");
}
void mute() {
  hubState["security"]["muted"] = true;
  State::setDevice("alarm", false, "security");
  State::event("security", "alarm", "manual", "Alarm muted; incident remains visible");
}
void acknowledge() {
  hubState["security"]["acknowledged"] = true;
  hubState["security"]["alarm"] = false;
  State::setDevice("alarm", false, "security");
  State::event("security", "alarm", "manual", "Incident acknowledged");
}
void tick(uint32_t now) {
  const bool motion = hubState["sensors"]["motion"];
  if (hubState["security"]["armed"].as<bool>() && motion && !previousMotion
      && !hubState["security"]["alarm"].as<bool>()
      && (!lastIncident || uint32_t(now - lastIncident) >= 10000)) {
    lastIncident = now; alarmStart = now;
    hubState["security"]["alarm"] = true;
    hubState["security"]["muted"] = false;
    hubState["security"]["acknowledged"] = false;
    State::event("alert", "pir", "automation", "Motion detected while armed");
  }
  previousMotion = motion;
  if (hubState["security"]["alarm"].as<bool>()) {
    const uint32_t duration = hubState["settings"]["alarmDuration"].as<unsigned>() * 1000;
    if (uint32_t(now - alarmStart) >= duration) {
      hubState["security"]["alarm"] = false;
      State::setDevice("alarm",false,"system");
      State::event("security","alarm","system","Alarm sound expired; acknowledgement still required");
      return;
    }
    const bool sounding = !hubState["security"]["muted"].as<bool>() && hubState["settings"]["buzzerEnabled"].as<bool>();
    State::setDevice("alarm", sounding, "security");
  }
}
}
