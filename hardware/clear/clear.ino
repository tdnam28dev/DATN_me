#include <Preferences.h>
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
}
void setup() {
  clearConfig();

}

void loop() {
  // put your main code here, to run repeatedly:

}
