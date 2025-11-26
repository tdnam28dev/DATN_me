#include <Preferences.h>
#include <LittleFS.h>
Preferences eeprom;
void clearConfig() {
  eeprom.begin("my-app", false);
  eeprom.remove("ssid");
  eeprom.remove("password");
  eeprom.remove("user_email");
  eeprom.remove("user_password");
  eeprom.remove("node_id");
  eeprom.remove("door_password");
  eeprom.remove("pass");
  eeprom.end();

  // Xóa file pins.json và schedules.json trong LittleFS
  LittleFS.begin();
  if (LittleFS.exists("/pins.json")) {
    LittleFS.remove("/pins.json");
  }
  if (LittleFS.exists("/schedules.json")) {
    LittleFS.remove("/schedules.json");
  }
  LittleFS.end();
}
void setup() {
  clearConfig();
}

void loop() {
  // put your main code here, to run repeatedly:
}
