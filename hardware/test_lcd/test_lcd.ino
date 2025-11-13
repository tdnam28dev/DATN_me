#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);  // set the LCD address to 0x27 for a 16 chars and 2 line display

void setup() {
  lcd.init();
  lcd.backlight();   // đèn nền bật
  lcd.begin(16, 2);  // cài đặt số cột và số dòng

  lcd.print("nhom 5");
  lcd.setCursor(0, 1);
  lcd.print("PHENIKAA");
  delay(2500);
  lcd.clear();
}

// void loop()
// {
//     lcd.setCursor(0, 0);
//     lcd.print("Hello, World!");
//     delay(1000);
//     lcd.clear();
//     lcd.setCursor(0, 1);
//     lcd.print("LCD Test");
//     delay(1000);
//     lcd.clear();
// }

void test() {
  lcd.setCursor(0, 0);
  lcd.print("Hello, World!");
  delay(1000);
  lcd.clear();
  lcd.setCursor(0, 1);
  lcd.print("LCD Test");
  delay(1000);
  lcd.clear();
}

void loop() {
  // server.handleClient();
  // socket.loop();
  // door();
  test();
  // reConfig();
}