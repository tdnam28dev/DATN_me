#include <Preferences.h>
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <SocketIoClient.h>
#include <Keypad.h>
#include <LiquidCrystal_I2C.h>

// -----khởi tạo server, socket, eeprom, led pin-----//
WebServer server(80);
SocketIoClient socket;
Preferences eeprom;

#define BUZZER 18             // GPIO18 pin kết nối còi báo
#define BUTTON_PIN 19         // GPIO19 pin kết nối nút thường
#define BOOT_PIN 0            // GPIO0 pin kết nối nút BOOT
#define LONG_PRESS_TIME 5000  // 5000 milliseconds (5 giây)
#define BOARD_LED_PIN 2       // GPIO2 là đèn có sẵn trên mạch
int lastState = LOW;          // the previous state from the input pin
int currentState;             // the current reading from the input pin
unsigned long pressedTime = 0;
unsigned long releasedTime = 0;
bool ledState = LOW;  // trạng thái hiện tại của đèn

// -----WiFi (Access Point)-----//
const char *AP_SSID = "ESP32-Setup";
const char *AP_PASS = "12345678";

// -----Biến lưu trữ thông tin WiFi và User-----//
String WIFI_SSID = "";
String WIFI_PASSWORD = "";
String USER_EMAIL = "";
String USER_PASSWORD = "";
String NODE_ID = "";
String DOOR_PASSWORD = "";
bool isConfigured = false;

// Led lcd
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Keypad
const byte rows = 4;     //số hàng
const byte columns = 4;  //số cột
//Định nghĩa các giá trị trả về
char keys[rows][columns] = {
  { '1', '2', '3', 'A' },
  { '4', '5', '6', 'B' },
  { '7', '8', '9', 'C' },
  { '*', '0', '#', 'D' },
};
uint8_t rowPins[rows] = { 13, 12, 14, 27 };
uint8_t columnPins[columns] = { 26, 25, 33, 32 };
Keypad keypad = Keypad(makeKeymap(keys), rowPins, columnPins, rows, columns);

// -----Lưu trữ thông tin-----//
void saveConfig() {
  eeprom.begin("my-app", false);
  eeprom.putString("ssid", WIFI_SSID);
  eeprom.putString("password", WIFI_PASSWORD);
  eeprom.putString("user_email", USER_EMAIL);
  eeprom.putString("user_password", USER_PASSWORD);
  eeprom.putString("node_id", NODE_ID);
  eeprom.putString("door_password", DOOR_PASSWORD);
  eeprom.end();
}
void clearConfig() {
  eeprom.begin("my-app", false);
  eeprom.remove("ssid");
  eeprom.remove("password");
  eeprom.remove("user_email");
  eeprom.remove("user_password");
  eeprom.remove("node_id");
    eeprom.remove("door_password");
  eeprom.end();
}

void loadConfig() {
  eeprom.begin("my-app", true);
  if (eeprom.isKey("ssid"))
    WIFI_SSID = eeprom.getString("ssid");
  if (eeprom.isKey("password"))
    WIFI_PASSWORD = eeprom.getString("password");
  if (eeprom.isKey("user_email"))
    USER_EMAIL = eeprom.getString("user_email");
  if (eeprom.isKey("user_password"))
    USER_PASSWORD = eeprom.getString("user_password");
  if (eeprom.isKey("node_id"))
    NODE_ID = eeprom.getString("node_id");
  if (eeprom.isKey("door_password"))
    DOOR_PASSWORD = eeprom.getString("door_password");
  eeprom.end();
}

// -----Hàm xử lý setup từ client-----//
void handleSetup() {
  if (server.hasArg("ssid") && server.hasArg("password") && server.hasArg("user") && server.hasArg("userpass") && server.hasArg("node") && server.hasArg("doorpass")) {
    WIFI_SSID = server.arg("ssid");
    WIFI_PASSWORD = server.arg("password");
    USER_EMAIL = server.arg("user");
    USER_PASSWORD = server.arg("userpass");
    NODE_ID = server.arg("node");
    DOOR_PASSWORD = server.arg("doorpass");
    saveConfig();
    bool success = config();
    server.send(200, "application/json", success ? "true" : "false");
    Serial.println(success ? "Cấu hình thành công, đã kết nối WiFi và server" : "Cấu hình thất bại, không thể kết nối WiFi hoặc server");
    delay(1000);
    if (success) {
      ESP.restart();
    }
  } else {
    server.send(400, "text/plain", "Missing ssid, password, user, userpass, or node");
  }
}

// -----Hàm kết nối WiFi-----//
bool connectToWiFi() {
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());
  Serial.print("Đang kết nối WiFi...");
  int timer = 0;
  while (WiFi.status() != WL_CONNECTED && timer < 60) {
    delay(500);
    Serial.print(".");
    timer++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi đã kết nối!");
    Serial.print("IP LAN: ");
    Serial.println(WiFi.localIP());
    return true;
  } else {
    Serial.println("\nKết nối WiFi thất bại!");
    return false;
  }
}

// -----Hàm kết nối socket.io tới server-----//
void connectSocketIo() {
  String serverHost = "192.168.1.40";  // Đổi IP server cho phù hợp
  int serverPort = 8080;
  String nodeId = NODE_ID;
  socket.begin(serverHost.c_str(), serverPort);
  socket.on("connect", [](const char *payload, size_t length) {
    Serial.println("SocketIO đã kết nối!");
    // Tham gia phòng riêng cho node
    String nodeIdJson = "\"" + NODE_ID + "\"";
    socket.emit("joinRoom", nodeIdJson.c_str());
  });
  socket.on("serverMessage", [](const char *payload, size_t length) {
    Serial.print("Nhận serverMessage: ");
    Serial.println(payload);
    // Giả sử server gửi: {"action":"toggle","led":1,"value":1}
    // String msg = String(payload);
    // if (msg.indexOf("toggle") != -1) {
    //   // Lấy giá trị pin từ chuỗi JSON
    //   int pinValue = -1;
    //   int ledIdx = msg.indexOf("\"led\":");
    //   if (ledIdx != -1) {
    //     int start = ledIdx + 6;
    //     int end = msg.indexOf(',', start);
    //     if (end == -1) end = msg.indexOf('}', start);
    //     String pinStr = msg.substring(start, end);
    //     pinStr.trim();
    //     pinValue = pinStr.toInt();
    //   }
    //   // Tìm vị trí pin trong mảng LED_PINS
    //   int ledNum = -1;
    //   for (int i = 0; i < NUM_LED; i++) {
    //     if (LED_PINS[i] == pinValue) {
    //       ledNum = i;
    //       Serial.println("Tìm thấy lệnh cho LED ở pin " + String(pinValue) + " (LED số " + String(i + 1) + ")");
    //       break;
    //     }
    //   }
    //   if (ledNum != -1) {
    //     int value = (msg.indexOf("\"value\":1") != -1) ? HIGH : LOW;
    //     digitalWrite(LED_PINS[ledNum], value);
    //     Serial.print("Đã cập nhật LED ở pin ");
    //     Serial.print(LED_PINS[ledNum]);
    //     Serial.print(" (LED số ");
    //     Serial.print(ledNum + 1);
    //     Serial.print("): ");
    //     Serial.println(value);
    //   }
    // }
  });
  socket.on("notification", [](const char *payload, size_t length) {
    Serial.print("Nhận notification: ");
    Serial.println(payload);
  });
  socket.on("disconnect", [](const char *payload, size_t length) {
    Serial.println("SocketIO ngắt kết nối!");
  });
}

// -----Hàm đăng nhập và gửi thông tin node lên server-----//
String login() {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/auth/login";
  String payload = "{\"username\":\"" + USER_EMAIL + "\",\"password\":\"" + USER_PASSWORD + "\"}";
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(payload);
  String res = http.getString();
  Serial.println("Login response: " + res);
  String token = "";
  bool success = false;
  if (httpCode == 200 && res.indexOf("token") != -1) {
    int t1 = res.indexOf("\"token\":\"");
    if (t1 != -1) {
      int t2 = res.indexOf('"', t1 + 9);
      token = res.substring(t1 + 9, t2);
    }
  }
  http.end();
  return token;
}

// -----Hàm gửi thông tin node lên server-----//
bool sendNodeInfo(String token) {
  HTTPClient http;
  String mac = WiFi.macAddress();
  String ip = WiFi.localIP().toString();
  String nodeName = "ESP32-" + mac.substring(mac.length() - 5);
  String nodeId = NODE_ID;
  String serverUrl = "http://192.168.1.40:8080/api/v1/nodes/" + nodeId;  // API update node
  String payload = "{\"name\":\"" + nodeName + "\",\"ip\":\"" + ip + "\",\"mac\":\"" + mac + "\"}";
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + token);
  int httpCode = http.PUT(payload);
  String res = http.getString();
  Serial.println("Node update response: " + res);
  http.end();
  return (httpCode == 200);
}

void onApAndWebServer() {
  // Bật AP và server để nhận cấu hình
  WiFi.softAP(AP_SSID, AP_PASS);
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());
  server.on("/setup", handleSetup);
  server.begin();
  Serial.println("Webserver started");
}

bool config() {
  // Kết nối WiFi và đăng nhập, gửi thông tin node
  bool ok = connectToWiFi();
  if (ok) {
    String token = login();
    if (token != "") {
      bool success = sendNodeInfo(token);
      if (success) {
        return true;
      } else {
        return false;
      }
    } else {
      Serial.println("Đăng nhập thất bại");
      clearConfig();
      return false;
    }
  } else {
    clearConfig();
    return false;
  }
}

void reConfig() {
  // Đọc trạng thái của cả hai nút
  int buttonState = digitalRead(BUTTON_PIN);
  int bootState = digitalRead(BOOT_PIN);
  currentState = (buttonState == LOW || bootState == LOW) ? LOW : HIGH;

  if (lastState == HIGH && currentState == LOW) {
    pressedTime = millis();
  }

  // Nếu đang giữ nút đủ 5 giây thì thực hiện lại cấu hình
  if (currentState == LOW && pressedTime > 0) {
    long holdDuration = millis() - pressedTime;
    if (holdDuration >= LONG_PRESS_TIME) {
      ledState = !ledState;
      digitalWrite(BOARD_LED_PIN, ledState);
      if (ledState == HIGH) {
        // Gọi lại hàm config để cấu hình lại
        onApAndWebServer();
      } else {
        WiFi.softAPdisconnect(true);
      }
      while (digitalRead(BUTTON_PIN) == LOW || digitalRead(BOOT_PIN) == LOW) {
        delay(10);
      }
      pressedTime = 0;
    }
  }

  lastState = currentState;
}

void connect() {
  bool ok = connectToWiFi();
  if (ok) {
    String token = login();
    if (token != "") {
      connectSocketIo();
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  lcd.init();
  lcd.backlight();   //đèn nền bật
  lcd.begin(16, 2);  // cài đặt số cột và số dòng
  // in logo lên màn hình
  lcd.print("nhom 5");
  lcd.setCursor(0, 1);
  lcd.print("PHENIKAA");
  delay(2500);
  lcd.clear();
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BOOT_PIN, INPUT_PULLUP);
  pinMode(BOARD_LED_PIN, OUTPUT);
  digitalWrite(BOARD_LED_PIN, ledState);
  loadConfig();
  isConfigured = WIFI_SSID.length() > 0 && WIFI_PASSWORD.length() > 0 && USER_EMAIL.length() > 0 && USER_PASSWORD.length() > 0 && NODE_ID.length() > 0 && DOOR_PASSWORD.length() > 0;

  if (!isConfigured) {
    onApAndWebServer();
  } else {
    connect();
  }
}

String str = "";
String new_pass = "";
String selectedSSID = "";
String passWifi = "";
bool isClose = true;
bool isOpen = false;
bool isMode = false;
bool isChangePassword = false;
bool isConnect = false;
bool isWifi = false;
bool isScanWifi = false;
bool isSelected = false;
bool isPassTrue = false;
String hidden = "";
int x = 0;
int i = 0;
int k = 47;
unsigned long t;

void door() {
  if (isClose) {
    lcd.setCursor(0, 0);
    lcd.print("Enter Password:");
    char temp = keypad.getKey();
    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp != 'A' && (char)temp != 'B' && (char)temp != 'C' && (char)temp != 'D' && temp != 0) {
        str += temp;
        Serial.println(str);
        hidden += "*";
        lcd.setCursor(x++, 1);
        lcd.print(temp);
        delay(250);
        lcd.setCursor(0, 1);
        lcd.print(hidden);
        if (str.length() == 8 && str == "12345678") {
          delay(600);
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Open");
          // for (int vitri = 180; vitri >= 90; vitri--) {
          //   sv.write(vitri);
          // }
          isClose = false;
          isOpen = true;
          str = "";
          hidden = "";
          x = 0;
          t = millis();
          lcd.clear();
        } else if (str.length() == 8 && str != "12345678") {
          delay(500);
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("incorrect");
          lcd.setCursor(0, 1);
          lcd.print("Password!");
          str = "";
          hidden = "";
          x = 0;
          delay(2000);
          lcd.clear();
        }
      }
      if (temp == 'C' && temp != 0) {
        if (str.length() > 0) {
          str.remove(str.length() - 1);
          hidden.remove(hidden.length() - 1);
          x--;
          lcd.clear();
        }
        lcd.setCursor(0, 1);
        lcd.print(hidden);
      }
      if (temp == 'D' && temp != 0) {
        str = "";
        isMode = true;
        isClose = false;
        lcd.clear();
      }
    }
  }
  if (isOpen) {
    lcd.setCursor(0, 0);
    lcd.print("Open");

    // Chỉ cho phép còi kêu ngắt quãng sau khi cửa mở được 10s
    static unsigned long lastBuzz = 0;
    static bool buzzState = false;
    if (millis() - t > 10000) {
      if (millis() - lastBuzz >= 500) {
        buzzState = !buzzState;
        digitalWrite(BUZZER, buzzState ? HIGH : LOW);
        lastBuzz = millis();
      }
    } else {
      digitalWrite(BUZZER, LOW);
    }

    char temp = keypad.getKey();
    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp == 'B') {
        digitalWrite(BUZZER, LOW);
        // for (int vitri = 90; vitri <= 180; vitri++) {
        //   sv.write(vitri);
        // }
        isOpen = false;
        isClose = true;
        lcd.clear();
      }
    }
  }
  if (isMode) {
    lcd.setCursor(0, 0);
    lcd.print("1:Change Password");
    lcd.setCursor(0, 1);
    lcd.print("2:Connect");
    char temp = keypad.getKey();

    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp == '1') {
        isMode = false;
        isChangePassword = true;
        lcd.clear();
      }
      if ((char)temp == '2') {
        isMode = false;
        isConnect = true;
        lcd.clear();
      }
      if ((char)temp == 'B') {
        isMode = false;
        isClose = true;
        isOpen = false;
        lcd.clear();
      }
    }
  }
  if (isConnect) {
    lcd.setCursor(0, 0);
    lcd.print("1:Wifi");
    lcd.setCursor(0, 1);
    lcd.print("2:Bluetooh");
    char temp = keypad.getKey();

    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp == '1') {
        isWifi = true;
        isConnect = false;
        lcd.clear();
      }
      if ((char)temp == '2') {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("null");
        delay(2000);
        lcd.clear();
      }
      if ((char)temp == 'B') {
        isMode = true;
        isConnect = false;
        lcd.clear();
      }
    }
  }
  if (isWifi) {
    lcd.setCursor(0, 0);
    lcd.print("1:Scan Wifi");
    lcd.setCursor(0, 1);
    lcd.print("2:Disconnect");
    char temp = keypad.getKey();

    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp == '1') {
        isScanWifi = true;
        isWifi = false;
        lcd.clear();
      }
      if ((char)temp == '2') {
      }
      if ((char)temp == 'B') {
        isConnect = true;
        isWifi = false;
        lcd.clear();
      }
    }
  }
  if (isScanWifi) {
    // if (WiFi.status() != WL_CONNECTED && numNetworks == 0) {
    //   WiFi.disconnect(true);
    // }
    // if (numNetworks == 0) {
    //   scanWifi();
    // }
    // char temp = keypad.getKey();
    // if (!isSelected) {
    //   lcd.setCursor(0, 0);
    //   lcd.print("Select Wifi:");
    //   lcd.setCursor(0, 1);
    //   lcd.print(wifiNetworks[i]);
    //   if ((int)keypad.getState() == PRESSED) {
    //     if ((char)temp == '6') {
    //       lcd.clear();
    //       i++;
    //       if (i == numNetworks) {
    //         i = 0;
    //         lcd.setCursor(0, 1);
    //         lcd.print(wifiNetworks[i]);
    //       } else {
    //         lcd.setCursor(0, 1);
    //         lcd.print(wifiNetworks[i]);
    //       }
    //     }
    //     if ((char)temp == '4') {
    //       lcd.clear();
    //       i--;
    //       if (i < 0) {
    //         i = numNetworks - 1;
    //         lcd.setCursor(0, 1);
    //         lcd.print(wifiNetworks[i]);
    //       } else {
    //         lcd.setCursor(0, 1);
    //         lcd.print(wifiNetworks[i]);
    //       }
    //     }
    //     if ((char)temp == '5') {
    //       WIFI_SSID = wifiNetworks[i];
    //       Serial.println(WIFI_SSID);
    //       isSelected = true;
    //       lcd.clear();
    //     }
    //     if ((char)temp == 'B') {
    //       isScanWifi = false;
    //       isWifi = true;
    //       numNetworks = 0;
    //       lcd.clear();
    //     }
    //   }
    // }
    // if (isSelected) {
    //   lcd.setCursor(0, 0);
    //   lcd.print("Enter password:");
    //   if ((int)keypad.getState() == PRESSED) {
    //     if ((char)temp == '2') {
    //       k++;
    //       if (k > 122) {
    //         k = 48;
    //       }
    //       lcd.setCursor(passWifi.length(), 1);
    //       lcd.print(char(k));
    //     }
    //     if ((char)temp == '8') {
    //       k--;
    //       if (k < 48) {
    //         k = 122;
    //       }
    //       lcd.setCursor(passWifi.length(), 1);
    //       lcd.print(char(k));
    //     }
    //     if ((char)temp == '5') {
    //       if (k >= 48 && k <= 122) {
    //         passWifi += char(k);
    //         k = 47;
    //       }
    //       lcd.setCursor(0, 1);
    //       lcd.print(passWifi + "_");
    //     }
    //     if ((char)temp == 'C') {
    //       if (passWifi.length() > 0) {
    //         passWifi.remove(passWifi.length() - 1);
    //         lcd.clear();
    //       }
    //       lcd.setCursor(0, 1);
    //       lcd.print(passWifi + "_");
    //     }
    //     if ((char)temp == 'B') {
    //       isSelected = false;
    //       numNetworks = 0;
    //       lcd.clear();
    //     }
    //     if ((char)temp == 'A') {
    //       WIFI_PASSWORD = passWifi;
    //       passWifi = "";
    //       Serial.println(WIFI_PASSWORD);
    //       bool a = connectToWiFi();
    //       if (a) {
    //         setWiFiInfo();
    //       }
    //       if (a && !Firebase.ready()) {
    //         connectFirebase();
    //       }
    //       delay(2000);
    //       isSelected = false;
    //       numNetworks = 0;
    //       isWifi = true;
    //       isScanWifi = false;
    //       lcd.clear();
    //     }
    //   }
    // }
  }
  if (isChangePassword) {
    // char temp = keypad.getKey();
    // if (!isPassTrue) {
    //   lcd.setCursor(0, 0);
    //   lcd.print("Old Password:");
    //   if ((int)keypad.getState() == PRESSED) {
    //     if ((char)temp != 'A' && (char)temp != 'B' && (char)temp != 'C' && (char)temp != 'B' && temp != 0) {
    //       new_pass += temp;
    //       Serial.println(new_pass);
    //       hidden += "*";
    //       lcd.setCursor(x++, 1);
    //       lcd.print(temp);
    //       delay(250);
    //       lcd.setCursor(0, 1);
    //       lcd.print(hidden);
    //     }
    //     if (temp == 'B' && temp != 0) {
    //       isChangePassword = false;
    //       isMode = true;
    //       new_pass = "";
    //       hidden = "";
    //       x = 0;
    //       lcd.clear();
    //     }
    //     if (temp == 'C' && temp != 0) {
    //       if (new_pass.length() > 0) {
    //         str.remove(new_pass.length() - 1);
    //         hidden.remove(hidden.length() - 1);
    //         x--;
    //         lcd.clear();
    //       }
    //       lcd.setCursor(0, 1);
    //       lcd.print(hidden);
    //     }
    //     if (temp == 'A' && temp != 0 && new_pass == PASS) {
    //       new_pass = "";
    //       isPassTrue = true;
    //       hidden = "";
    //       x = 0;
    //       lcd.clear();
    //     } else if (temp == 'A' && temp != 0 && new_pass != PASS) {
    //       new_pass = "";
    //       hidden = "";
    //       x = 0;
    //       lcd.clear();
    //       lcd.setCursor(0, 0);
    //       lcd.print("incorect");
    //       lcd.setCursor(0, 1);
    //       lcd.print("password");
    //       delay(2000);
    //       lcd.clear();
    //     }
    //   }
    // }
    // if (isPassTrue) {
    //   lcd.setCursor(0, 0);
    //   lcd.print("New Password:");
    //   if ((int)keypad.getState() == PRESSED) {
    //     if ((char)temp != 'A' && (char)temp != 'B' && (char)temp != 'C' && (char)temp != 'B' && temp != 0) {
    //       new_pass += temp;
    //       Serial.println(new_pass);
    //       hidden += "*";
    //       lcd.setCursor(x++, 1);
    //       lcd.print(temp);
    //       delay(250);
    //       lcd.setCursor(0, 1);
    //       lcd.print(hidden);
    //     }
    //     if (temp == 'B' && temp != 0) {
    //       isChangePassword = false;
    //       isMode = true;
    //       new_pass = "";
    //       hidden = "";
    //       x = 0;
    //       lcd.clear();
    //     }
    //     if (temp == 'C' && temp != 0) {
    //       if (new_pass.length() > 0) {
    //         str.remove(new_pass.length() - 1);
    //         hidden.remove(hidden.length() - 1);
    //         x--;
    //         lcd.clear();
    //       }
    //       lcd.setCursor(0, 1);
    //       lcd.print(hidden);
    //     }
    //     if (temp == 'A' && temp != 0 && new_pass.length() == 8) {
    //       PASS = new_pass;
    //       setPassInfo(new_pass);
    //       if (Firebase.setString(fbdo, userPath + "/esp32-door/password", PASS)) {
    //         Serial.println("change ok");
    //       } else {
    //         Serial.println("fail");
    //       }
    //       isPassTrue = false;
    //       isChangePassword = false;
    //       isMode = true;
    //       hidden = "";
    //       x = 0;
    //       delay(500);
    //       lcd.clear();
    //       lcd.setCursor(0, 0);
    //       lcd.print("Password is");
    //       lcd.setCursor(0, 1);
    //       lcd.print("change complete");
    //       new_pass = "";
    //       delay(2000);
    //       lcd.clear();
    //     }
    //   }
    // }
  }
}


void loop() {
  server.handleClient();
  socket.loop();
  door();
  reConfig();
}