#include <Preferences.h>
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <SocketIoClient.h>
#include <Arduino.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

// -----khởi tạo server, socket, eeprom, led pin-----//
WebServer server(80);
SocketIoClient socket;
Preferences eeprom;
#define NUM_LED 5
const int LED_PINS[NUM_LED] = { 19, 5, 16, 0, 15 };

#define BUTTON_PIN 22         // GPIO22 pin kết nối nút thường
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
String TOKEN = "";
bool isConfigured = false;

// -----Lưu trữ thông tin-----//
void saveConfig() {
  eeprom.begin("my-app", false);
  eeprom.putString("ssid", WIFI_SSID);
  eeprom.putString("password", WIFI_PASSWORD);
  eeprom.putString("user_email", USER_EMAIL);
  eeprom.putString("user_password", USER_PASSWORD);
  eeprom.putString("node_id", NODE_ID);
  eeprom.end();
}

void clearConfig() {
  eeprom.begin("my-app", false);
  eeprom.remove("ssid");
  eeprom.remove("password");
  eeprom.remove("user_email");
  eeprom.remove("user_password");
  eeprom.remove("node_id");
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
  eeprom.end();
}

// ------------------------ Đọc/ghi danh sách pin ------------------ //

bool checkFile() {
  return LittleFS.exists("/pins.json");
}

bool createFile() {
  File file = LittleFS.open("/pins.json", "w");
  if (!file) {
    return false;
  } else {
    file.close();
    return true;
  }
}

bool addPinToFile(int pin, int value) {
  File file = LittleFS.open("/pins.json", "a");
  if (file) {
    StaticJsonDocument<128> doc;
    doc["pin"] = pin;
    doc["value"] = value;
    serializeJson(doc, file);
    file.println();
    file.close();
    Serial.println("Đã thêm pin mới vào file!");
    return true;
  } else {
    return false;
  }
}

bool checkPin(int pin) {
  File file = LittleFS.open("/pins.json", "r");
  if (!file) {
    Serial.println("Không mở được file pins.json để đọc!");
    return false;
  } else {
    while (file.available()) {
      String line = file.readStringUntil('\n');
      StaticJsonDocument<128> doc;
      DeserializationError err = deserializeJson(doc, line);
      if (!err) {
        if (doc["pin"].as<int>() == pin) {
          file.close();
          return true;
        }
      }
    }
    file.close();
    return false;
  }
}

bool updatePin(int pin, int newValue) {
  File file = LittleFS.open("/pins.json", "r");
  if (!file) {
    Serial.println("Không mở được file pins.json để đọc!");
    return false;
  }
  String newContent = "";
  bool updated = false;
  while (file.available()) {
    String line = file.readStringUntil('\n');
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, line);
    if (!err) {
      if (doc["pin"].as<int>() == pin) {
        doc["value"] = newValue;
        updated = true;
        String updatedLine;
        serializeJson(doc, updatedLine);
        newContent += updatedLine + "\n";
      } else {
        newContent += line + "\n";
      }
    }
  }
  file.close();
  if (updated) {
    file = LittleFS.open("/pins.json", "w");
    if (!file) {
      return false;
    }
    file.print(newContent);
    file.close();
    return true;
  } else {
    return false;
  }
}

bool removePin(int pin) {
  File file = LittleFS.open("/pins.json", "r");
  if (!file) return false;
  String newContent = "";
  while (file.available()) {
    String line = file.readStringUntil('\n');
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, line);
    if (!err) {
      if (doc["pin"].as<int>() != pin) {
        newContent += line + "\n";
      }
    }
  }
  file.close();
  file = LittleFS.open("/pins.json", "w");
  if (!file) return false;
  file.print(newContent);
  file.close();
  return true;
}

void getAllPins() {
  File file = LittleFS.open("/pins.json", "r");
  if (file) {
    Serial.println("Danh sách pin:");
    while (file.available()) {
      String line = file.readStringUntil('\n');
      StaticJsonDocument<128> docRead2;
      DeserializationError err = deserializeJson(docRead2, line);
      if (!err) {
        int pin = docRead2["pin"].as<int>();
        int value = docRead2["value"].as<int>();
        Serial.printf("Pin: %d, Value: %d\n", pin, value);
        digitalWrite(pin, value == 1 ? HIGH : LOW);
      }
    }
    file.close();
  }
}

// -----Hàm xử lý setup từ client-----//
void handleSetup() {
  if (server.hasArg("ssid") && server.hasArg("password") && server.hasArg("user") && server.hasArg("userpass") && server.hasArg("node")) {
    WIFI_SSID = server.arg("ssid");
    WIFI_PASSWORD = server.arg("password");
    USER_EMAIL = server.arg("user");
    USER_PASSWORD = server.arg("userpass");
    NODE_ID = server.arg("node");
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
  socket.on("sendUpdateToNode", [](const char *payload, size_t length) {
    Serial.print("Nhận serverMessage: ");
    Serial.println(payload);
    // Parse dữ liệu JSON từ server
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, payload);
    if (!err) {
      String action = doc["action"].as<String>();
      if (action == "toggle") {
        int pinValue = doc["led"].as<int>();
        int value = doc["value"].as<int>();
        // Tìm vị trí pin trong mảng LED_PINS
        int ledNum = -1;
        for (int i = 0; i < NUM_LED; i++) {
          if (LED_PINS[i] == pinValue) {
            ledNum = i;
            Serial.println("Tìm thấy lệnh cho LED ở pin " + String(pinValue) + " (LED số " + String(i + 1) + ")");
            break;
          }
        }
        if (ledNum != -1) {
          digitalWrite(LED_PINS[ledNum], value == 1 ? HIGH : LOW);
          updatePin(LED_PINS[ledNum], value);
          Serial.print("Đã cập nhật LED ở pin ");
          Serial.print(LED_PINS[ledNum]);
          Serial.print(" (LED số ");
          Serial.print(ledNum + 1);
          Serial.print("): ");
          Serial.println(value);
        }
      }
      if (action == "delete") {
        int pinValue = doc["led"].as<int>();
        // Tìm vị trí pin trong mảng LED_PINS
        int ledNum = -1;
        for (int i = 0; i < NUM_LED; i++) {
          if (LED_PINS[i] == pinValue) {
            ledNum = i;
            Serial.println("Tìm thấy lệnh xóa cho LED ở pin " + String(pinValue) + " (LED số " + String(i + 1) + ")");
            break;
          }
        }
        if (ledNum != -1) {
          digitalWrite(LED_PINS[ledNum], LOW);
          removePin(LED_PINS[ledNum]);
          Serial.print("Đã xóa LED ở pin ");
          Serial.print(LED_PINS[ledNum]);
          Serial.print(" (LED số ");
          Serial.print(ledNum + 1);
          Serial.println(") khỏi file!");
        }
      }
    } else {
      Serial.println("Lỗi parse JSON từ server!");
    }
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
void login() {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/auth/login";
  StaticJsonDocument<128> payloadDoc;
  payloadDoc["username"] = USER_EMAIL;
  payloadDoc["password"] = USER_PASSWORD;
  String payload;
  serializeJson(payloadDoc, payload);
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(payload);
  String res = http.getString();
  // Serial.println("Login response: " + res);
  String token = "";
  if (httpCode == 200) {
    StaticJsonDocument<512> doc;
    DeserializationError err = deserializeJson(doc, res);
    if (!err && doc["token"].is<String>()) {
      token = doc["token"].as<String>();
      Serial.println("Token: " + token);
    }
  }
  http.end();
  TOKEN = token;
}

// -----Hàm gửi thông tin node lên server-----//
bool sendNodeInfo(String token) {
  HTTPClient http;
  String mac = WiFi.macAddress();
  String ip = WiFi.localIP().toString();
  String nodeName = "ESP32-" + mac.substring(mac.length() - 5);
  String nodeId = NODE_ID;
  String serverUrl = "http://192.168.1.40:8080/api/v1/nodes/" + nodeId;  // API update node
  StaticJsonDocument<128> payloadDoc;
  payloadDoc["name"] = nodeName;
  payloadDoc["ip"] = ip;
  payloadDoc["mac"] = mac;
  String payload;
  serializeJson(payloadDoc, payload);
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + token);
  int httpCode = http.PUT(payload);
  String res = http.getString();
  Serial.println("Node update response: " + res);
  http.end();
  return (httpCode == 200);
}

// -----Hàm lấy trạng thái các pin đang dùng từ server-----//
void getPinsUsedFromServer(String token) {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/nodes/" + NODE_ID + "?pinsUsed=1";
  http.begin(serverUrl);
  http.addHeader("Authorization", "Bearer " + token);
  int httpCode = http.GET();
  String res = http.getString();
  Serial.println("PinsUsed response: " + res);
  http.end();
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, res);
  if (!err) {
    for (int i = 0; i < NUM_LED; i++) {
      int pin = LED_PINS[i];
      if (doc[String(pin)].is<int>()) {
        int value = doc[String(pin)].as<int>();
        digitalWrite(pin, value == 1 ? HIGH : LOW);
        Serial.printf("Set pin %d to %d\n", pin, value);
        // Sử dụng các hàm quản lý file pin
        if (checkPin(pin)) {
          updatePin(pin, value);
        } else {
          addPinToFile(pin, value);
        }
      }
    }
    Serial.println("Đã lưu trạng thái các pin vào file pins.json!");
  } else {
    Serial.println("Lỗi parse JSON pinsUsed!");
  }
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
    login();
    if (TOKEN != "") {
      bool success = sendNodeInfo(TOKEN);
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
    login();
    if (TOKEN != "") {
      getPinsUsedFromServer(TOKEN);
      connectSocketIo();
    } else {
      getAllPins();
    }
  } else {
    getAllPins();
  }
}

void setup() {
  Serial.begin(115200);
  if (!LittleFS.begin()) {
    if (!LittleFS.begin(true)) {
      Serial.println("LittleFS ready!");
    } else {
      Serial.println("Lỗi khởi tạo LittleFS!");
    }
  } else {
    Serial.println("LittleFS ready!");
  }
  if (!checkFile()) {
    if (createFile()) {
      Serial.println("Đã tạo file cards.json!");
    } else {
      Serial.println("Lỗi tạo file cards.json!");
    }
  }
  for (int i = 0; i < NUM_LED; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }
  getAllPins();
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BOOT_PIN, INPUT_PULLUP);
  pinMode(BOARD_LED_PIN, OUTPUT);
  digitalWrite(BOARD_LED_PIN, ledState);
  loadConfig();
  isConfigured = WIFI_SSID.length() > 0 && WIFI_PASSWORD.length() > 0 && USER_EMAIL.length() > 0 && USER_PASSWORD.length() > 0 && NODE_ID.length() > 0;

  if (!isConfigured) {
    onApAndWebServer();
  } else {
    connect();
  }
}

void loop() {
  server.handleClient();
  socket.loop();
  reConfig();
}
