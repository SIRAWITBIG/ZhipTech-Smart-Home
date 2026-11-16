#include "display.h"
#include "config.h"
#include "pins.h"
#include "state.h"
#include "network.h"
#include <Wire.h>
#include <Adafruit_SSD1306.h>

namespace {
Adafruit_SSD1306 screen(128, 64, &Wire, -1);
bool available = false;
uint32_t lastUpdate = 0;
}
namespace Display {
void begin() {
  if (!Config::HardwareEnabled || !Config::OledEnabled) return;
  Wire.begin(Pins::OledSda, Pins::OledScl);
  available = screen.begin(SSD1306_SWITCHCAPVCC, Config::OledAddress);
  if (!available) State::event("error", "oled", "system", "OLED initialization failed; confirm controller and I2C address");
}
void tick(uint32_t now) {
  if (!available || uint32_t(now - lastUpdate) < 500) return;
  lastUpdate = now;
  screen.clearDisplay();
  if (!hubState["settings"]["displayEnabled"].as<bool>()) { screen.display(); return; }
  screen.setTextSize(1); screen.setTextColor(SSD1306_WHITE); screen.setCursor(0, 0);
  screen.println("ZhipTech - Smart Home"); screen.println();
  const unsigned page = (now / 5000) % 3;
  if (page == 0) {
    if (hubState["sensors"]["error"].as<bool>()) screen.println("DHT SENSOR ERROR");
    else {
      screen.print("Temp: "); screen.print(hubState["sensors"]["temperature"].as<float>(), 1); screen.println(" C");
      screen.print("Humidity: "); screen.print(hubState["sensors"]["humidity"].as<float>(), 0); screen.println(" %");
    }
    screen.print("Light: "); screen.print(hubState["sensors"]["lightPercent"].as<int>()); screen.println(" % relative");
  } else if (page == 1) {
    screen.println(hubState["network"]["stationConnected"].as<bool>() ? "Wi-Fi: connected" : "NETWORK OFFLINE");
    screen.println(Network::ip());
    screen.print("Uptime: "); screen.print(now / 1000); screen.println(" s");
  } else {
    screen.print("Scene: "); screen.println(hubState["scene"].as<String>());
    screen.println(hubState["security"]["armed"].as<bool>() ? "SECURITY: ARMED" : "Security: disarmed");
    if (hubState["security"]["alarm"].as<bool>()) screen.println("ALERT: check web UI");
    screen.println(hubState["sensors"]["parking"].as<bool>() ? "Parking: occupied" : "Parking: vacant");
  }
  screen.display();
}
}
