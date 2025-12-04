/*
  Skeleton ESP32 FreeRTOS 2-core
  - Core 1: Quản lý WiFi/AP, NTP, WebServer
  - Core 0: Logic nghiệp vụ: Login, SocketIO, Lưu trữ, LED, Nút Re-config
*/

#include <Arduino.h>
#include <Preferences.h>
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <SocketIoClient.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

// -----------------------------
// Biến toàn cục & hằng số
// -----------------------------

WebServer server(80);
SocketIoClient socket;
Preferences eeprom;

#define NUM_LED 5
const int LED_PINS[NUM_LED] = { 19, 5, 16, 4, 15 };
#define NUM_BUTTON 5
const int BUTTON_PINS[NUM_BUTTON] = { 13, 12, 14, 27, 26 };

bool pinStates[NUM_LED];
bool buttonStates[NUM_BUTTON];
bool manualOverride[NUM_LED] = { false, false, false, false, false };

#define BUTTON_PIN 22
#define BOOT_PIN 0
#define LONG_PRESS_TIME 5000
#define BOARD_LED_PIN 2

int lastState = LOW;
int currentState;
unsigned long pressedTime = 0;
unsigned long releasedTime = 0;
bool ledState = LOW;

const char *AP_SSID = "ESP32-Setup";
const char *AP_PASS = "12345678";

String WIFI_SSID = "";
String WIFI_PASSWORD = "";
String USER_EMAIL = "";
String USER_PASSWORD = "";
String NODE_ID = "";
String TOKEN = "";
bool isConfigured = false;
bool isLogin = false;
bool isConnectedWifi = false;
bool isConnectedSocket = false;
bool isOnAP = false;
volatile bool timeSynced = false;

// Đồng bộ và giao tiếp giữa các task
SemaphoreHandle_t xConfigMutex = NULL;
QueueHandle_t xEventQueue = NULL;

// -----------------------------
// Task handle
// -----------------------------
TaskHandle_t wifiTaskHandle = NULL;
TaskHandle_t webTaskHandle = NULL;
TaskHandle_t timeTaskHandle = NULL;
TaskHandle_t loginTaskHandle = NULL;
TaskHandle_t socketTaskHandle = NULL;
TaskHandle_t storageTaskHandle = NULL;
TaskHandle_t ledScheduleTaskHandle = NULL;
TaskHandle_t ledButtonTaskHandle = NULL;
TaskHandle_t reconfigTaskHandle = NULL;

// -----------------------------
// Khai báo các hàm 
// -----------------------------

void saveConfig();
void clearConfig();
void loadConfig();

bool checkFile();
bool createPinFile();
bool createScheduleFile();
bool addPinToFile(int pin, int value);
bool checkPin(int pin);
bool updatePin(int pin, int newValue);
bool removePin(int pin);
void getAllPins();

bool addSchedule(int led, const char *onTime, const char *offTime, const char *repeat);
bool removeSchedule(int led, const char *onTime, const char *offTime, const char *repeat);
JsonArray getSchedules();

void handleSetup();

bool connectToWiFi();
void connectSocketIo();
bool login();
bool sendNodeInfo(String token);
void getPinsUsedFromServer(String token);

bool onApAndWebServer();
bool config();
void reConfig();
void connect();

// -----------------------------
// Task FreeRTOS
// -----------------------------

// Core 1: Quản lý WiFi/AP
void WiFiTask(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    if (isConfigured) {
      if (WiFi.status() != WL_CONNECTED) isConnectedWifi = connectToWiFi();
    } else {
      if (!isOnAP) isOnAP = onApAndWebServer();
    }

    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

// Core 1: Đồng bộ thời gian NTP
void TimeTask(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
      Serial.println("Không lấy được thời gian!");
      timeSynced = false;
    } else {
      Serial.printf("Thời gian: %02d:%02d:%02d\n", timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
      timeSynced = true;
    }
    vTaskDelay(pdMS_TO_TICKS(60000));
  }
}

// Core 1: Web server cho AP mode
void WebServerTask(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    if (isOnAP) server.handleClient();
    vTaskDelay(pdMS_TO_TICKS(5));
  }
}

// Core 0: Login
void LoginTask(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    if (isConnectedWifi && !isLogin) isLogin = login();
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

// Core 0: Socket.io client
void SocketTask(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    if (isConnectedWifi && isLogin && !isConnectedSocket) {
      connectSocketIo();
      // getPinsUsedFromServer(TOKEN);
      isConnectedSocket = true;
    }
    if (isConnectedWifi && isLogin && isConnectedSocket) socket.loop();
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

// Core 0: Lưu trữ (LittleFS/EEPROM)
void StorageTask(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    // TODO: xử lý yêu cầu đọc/ghi từ các task khác
    vTaskDelay(pdMS_TO_TICKS(500));
  }
}

// Core 0: LED control
void LedScheduleTask(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    if (timeSynced) {
      struct tm timeinfo;
      if (getLocalTime(&timeinfo)) {
        char nowHM[6];
        snprintf(nowHM, sizeof(nowHM), "%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min);
        JsonArray schedules = getSchedules();
        for (JsonObject sch : schedules) {
          int led = sch["led"];
          const char *onTime = sch["onTime"];
          const char *offTime = sch["offTime"];
          const char *repeat = sch["repeat"];
          bool isActive = sch.containsKey("isActive") ? sch["isActive"] == true : true;
          bool shouldControl = isActive;

          if (shouldControl) {
            bool inSchedule = false;
            if (strcmp(onTime, offTime) < 0) {
              inSchedule = (strcmp(nowHM, onTime) >= 0 && strcmp(nowHM, offTime) < 0);
            } else {
              inSchedule = (strcmp(nowHM, onTime) >= 0 || strcmp(nowHM, offTime) < 0);
            }
            int ledIndex = -1;
            for (int i = 0; i < NUM_LED; i++) {
              if (LED_PINS[i] == led) {
                ledIndex = i;
                break;
              }
            }
            if (ledIndex > -1 && !manualOverride[ledIndex]) {
              if (inSchedule) {
                if (pinStates[ledIndex] != HIGH) {
                  digitalWrite(led, HIGH);
                  pinStates[ledIndex] = HIGH;
                  updatePin(led, 1);
                  String id = getPinId(led);
                  if (TOKEN != "") updateStatusLed(TOKEN, id, true);
                  Serial.printf("LED Pin %d turned ON by schedule (onTime: %s, offTime: %s, now: %s)\n", led, onTime, offTime, nowHM);
                }
                if (strcmp(repeat, "once") == 0) {
                  markScheduleExecuted(sch["id"]);
                }
              } else {
                if (pinStates[ledIndex] != LOW) {
                  digitalWrite(led, LOW);
                  pinStates[ledIndex] = LOW;
                  updatePin(led, 0);
                  String id = getPinId(led);
                  if (TOKEN != "") updateStatusLed(TOKEN, id, false);
                  Serial.printf("LED Pin %d turned OFF by schedule (onTime: %s, offTime: %s, now: %s)\n", led, onTime, offTime, nowHM);
                }
              }
            }
          }
        }
      }
    }
    vTaskDelay(pdMS_TO_TICKS(200));
  }
}

void LedButtonTask(void *pvParameters) {
  (void)pvParameters;

  bool lastState[NUM_BUTTON];  // lưu trạng thái trước đó

  // Khởi tạo
  for (int i = 0; i < NUM_BUTTON; i++) {
    lastState[i] = digitalRead(BUTTON_PINS[i]);  // HIGH
  }

  for (;;) {
    for (int i = 0; i < NUM_BUTTON; i++) {
      bool reading = digitalRead(BUTTON_PINS[i]);
      // Kiểm tra nhấn xuống (từ HIGH → LOW vì có INPUT_PULLUP)
      if (lastState[i] == HIGH && reading == LOW) {
        pinStates[i] = !pinStates[i];
        manualOverride[i] = !manualOverride[i];
        updatePin(LED_PINS[i], pinStates[i] ? 1 : 0);
        String id = getPinId(LED_PINS[i]);
        if (TOKEN != "" && id != "") updateStatusLed(TOKEN, id, pinStates[i] ? true : false);
        digitalWrite(LED_PINS[i], pinStates[i]);
      }
      lastState[i] = reading;
    }
    vTaskDelay(pdMS_TO_TICKS(50));  // debounce
  }
}

// Core 0: Nút Re-config
void ReconfigTask(void *pvParameters) {
  (void)pvParameters;
  for (;;) {
    reConfig();
    vTaskDelay(pdMS_TO_TICKS(20));
  }
}

// -----------------------------
// Hàm dài: để trống, implement sau
// -----------------------------

void saveConfig() {
  xSemaphoreTake(xConfigMutex, portMAX_DELAY);
  eeprom.begin("my-app", false);
  eeprom.putString("ssid", WIFI_SSID);
  eeprom.putString("password", WIFI_PASSWORD);
  eeprom.putString("user_email", USER_EMAIL);
  eeprom.putString("user_password", USER_PASSWORD);
  eeprom.putString("node_id", NODE_ID);
  eeprom.end();
  xSemaphoreGive(xConfigMutex);
}
void clearConfig() {
  xSemaphoreTake(xConfigMutex, portMAX_DELAY);
  eeprom.begin("my-app", false);
  eeprom.remove("ssid");
  eeprom.remove("password");
  eeprom.remove("user_email");
  eeprom.remove("user_password");
  eeprom.remove("node_id");
  eeprom.end();
  xSemaphoreGive(xConfigMutex);
}
void loadConfig() {
  xSemaphoreTake(xConfigMutex, portMAX_DELAY);
  eeprom.begin("my-app", true);
  if (eeprom.isKey("ssid")) WIFI_SSID = eeprom.getString("ssid");
  if (eeprom.isKey("password")) WIFI_PASSWORD = eeprom.getString("password");
  if (eeprom.isKey("user_email")) USER_EMAIL = eeprom.getString("user_email");
  if (eeprom.isKey("user_password")) USER_PASSWORD = eeprom.getString("user_password");
  if (eeprom.isKey("node_id")) NODE_ID = eeprom.getString("node_id");
  eeprom.end();
  xSemaphoreGive(xConfigMutex);
}
bool checkFile() {
  return LittleFS.exists("/pins.json") && LittleFS.exists("/schedules.json");
}
bool createPinFile() {
  File file = LittleFS.open("/pins.json", "w");
  if (!file) return false;
  file.close();
  return true;
}
bool createScheduleFile() {
  File file = LittleFS.open("/schedules.json", "w");
  if (!file) return false;
  file.close();
  return true;
}
bool addPinToFile(const char *id, int pin, int value) {
  File file = LittleFS.open("/pins.json", "a");
  if (file) {
    StaticJsonDocument<128> doc;
    doc["id"] = id;
    doc["pin"] = pin;
    doc["value"] = value;
    serializeJson(doc, file);
    file.println();
    file.close();
    return true;
  }
  return false;
}
bool checkPin(int pin) {
  File file = LittleFS.open("/pins.json", "r");
  if (!file) return false;
  while (file.available()) {
    String line = file.readStringUntil('\n');
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, line);
    if (!err && doc["pin"].as<int>() == pin) {
      file.close();
      return true;
    }
  }
  file.close();
  return false;
}
String getPinId(int pin) {
  File file = LittleFS.open("/pins.json", "r");
  if (!file) return "";
  while (file.available()) {
    String line = file.readStringUntil('\n');
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, line);
    if (!err && doc["pin"].as<int>() == pin) {
      String id = doc["id"].as<String>();
      file.close();
      return id;
    }
  }
  file.close();
  return "";
}
bool updatePin(int pin, int newValue) {
  File file = LittleFS.open("/pins.json", "r");
  if (!file) return false;
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
    if (!file) return false;
    file.print(newContent);
    file.close();
    return true;
  }
  return false;
}
bool removePin(int pin) {
  File file = LittleFS.open("/pins.json", "r");
  if (!file) return false;
  String newContent = "";
  while (file.available()) {
    String line = file.readStringUntil('\n');
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, line);
    if (!err && doc["pin"].as<int>() != pin) {
      newContent += line + "\n";
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
    while (file.available()) {
      String line = file.readStringUntil('\n');
      StaticJsonDocument<128> doc;
      DeserializationError err = deserializeJson(doc, line);
      if (!err) {
        String id = doc["id"].as<String>();
        int pin = doc["pin"].as<int>();
        int value = doc["value"].as<int>();
        Serial.printf("id:%s, Pin: %d, Value: %d\n", id.c_str(), pin, value);
        for (int i = 0; i < NUM_LED; i++) {
          if (LED_PINS[i] == pin) {
            pinStates[i] = value == 1 ? HIGH : LOW;
            break;
          }
        }
        digitalWrite(pin, value == 1 ? HIGH : LOW);
      }
    }
    file.close();
  }
}

bool addSchedule(const char *id, int led, const char *onTime, const char *offTime, const char *repeat, bool isActive) {
  File file = LittleFS.open("/schedules.json", "r");
  StaticJsonDocument<2048> doc;
  JsonArray arr;
  if (file && file.size() > 0) {
    DeserializationError err = deserializeJson(doc, file);
    if (err) {
      file.close();
      return false;
    }
    arr = doc.as<JsonArray>();
    file.close();
  } else {
    arr = doc.to<JsonArray>();
    if (file) file.close();
  }
  // Thêm lịch mới
  JsonObject sch = arr.createNestedObject();
  sch["id"] = id;
  sch["led"] = led;
  sch["onTime"] = onTime;
  sch["offTime"] = offTime;
  sch["repeat"] = repeat;
  sch["isActive"] = isActive;
  // Ghi lại file
  file = LittleFS.open("/schedules.json", "w");
  if (!file) return false;
  serializeJson(doc, file);
  file.close();
  return true;
}
void markScheduleExecuted(const char *id) {
  File file = LittleFS.open("/schedules.json", "r");
  StaticJsonDocument<2048> doc;
  JsonArray arr;
  if (file && file.size() > 0) {
    DeserializationError err = deserializeJson(doc, file);
    if (err) {
      file.close();
      return;
    }
    arr = doc.as<JsonArray>();
    file.close();
  } else {
    if (file) file.close();
    return;
  }
  bool updated = false;
  for (JsonObject sch : arr) {
    if (sch.containsKey("id") && String(sch["id"]) == id && sch["repeat"] == String("once")) {
      sch["isActive"] = false;
      updated = true;
      break;
    }
  }
  if (updated) {
    file = LittleFS.open("/schedules.json", "w");
    if (!file) return;
    serializeJson(doc, file);
    file.close();
  }
}
void resetScheduleExecuted(const char *id) {
  File file = LittleFS.open("/schedules.json", "r");
  StaticJsonDocument<2048> doc;
  JsonArray arr;
  if (file && file.size() > 0) {
    DeserializationError err = deserializeJson(doc, file);
    if (err) {
      file.close();
      return;
    }
    arr = doc.as<JsonArray>();
    file.close();
  } else {
    if (file) file.close();
    return;
  }
  bool updated = false;
  for (JsonObject sch : arr) {
    if (sch.containsKey("id") && String(sch["id"]) == id && sch["repeat"] == String("once")) {
      sch["isActive"] = true;
      updated = true;
      break;
    }
  }
  if (updated) {
    file = LittleFS.open("/schedules.json", "w");
    if (!file) return;
    serializeJson(doc, file);
    file.close();
  }
}
bool updateSchedule(const char *id, const char *onTime, const char *offTime, const char *repeat, bool isActive) {
  File file = LittleFS.open("/schedules.json", "r");
  StaticJsonDocument<2048> doc;
  JsonArray arr;
  if (file && file.size() > 0) {
    DeserializationError err = deserializeJson(doc, file);
    if (err) {
      file.close();
      return false;
    }
    arr = doc.as<JsonArray>();
    file.close();
  } else {
    if (file) file.close();
    return false;
  }
  bool updated = false;
  for (JsonObject sch : arr) {
    if (sch.containsKey("id") && String(sch["id"]) == id) {
      sch["onTime"] = onTime;
      sch["offTime"] = offTime;
      sch["repeat"] = repeat;
      sch["isActive"] = isActive;
      updated = true;
      break;
    }
  }
  if (updated) {
    file = LittleFS.open("/schedules.json", "w");
    if (!file) return false;
    serializeJson(doc, file);
    file.close();
    return true;
  }
  return false;
}
bool removeSchedule(const char *id) {
  File file = LittleFS.open("/schedules.json", "r");
  StaticJsonDocument<2048> doc;
  JsonArray arr;
  if (file && file.size() > 0) {
    DeserializationError err = deserializeJson(doc, file);
    if (err) {
      file.close();
      return false;
    }
    arr = doc.as<JsonArray>();
    file.close();
  } else {
    if (file) file.close();
    return false;
  }
  // Lọc bỏ lịch cần xóa theo id
  JsonArray newArr = doc.to<JsonArray>();
  for (JsonObject sch : arr) {
    if (!(String(sch["id"]) == id)) {
      newArr.add(sch);
    }
  }
  // Ghi lại file
  file = LittleFS.open("/schedules.json", "w");
  if (!file) return false;
  serializeJson(doc, file);
  file.close();
  return true;
}
JsonArray getSchedules() {
  static StaticJsonDocument<2048> doc;  // static để không bị giải phóng khi return
  doc.clear();
  File file = LittleFS.open("/schedules.json", "r");
  if (file && file.size() > 0) {
    DeserializationError err = deserializeJson(doc, file);
    file.close();
    if (err) return JsonArray();
    return doc.as<JsonArray>();
  }
  if (file) file.close();
  return doc.to<JsonArray>();
}

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
    delay(1000);
    if (success) {
      ESP.restart();
    }
  } else {
    server.send(400, "text/plain", "Missing ssid, password, user, userpass, or node");
  }
}
bool connectToWiFi() {
  Serial.printf("[WiFiTask] Connecting to %s\n", WIFI_SSID);
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());

  unsigned long startAttempt = millis();
  // chờ tối đa 10s để connect (có thể điều chỉnh)
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    vTaskDelay(pdMS_TO_TICKS(500));
    Serial.print(".");
  }
  Serial.println();
  return WiFi.status() == WL_CONNECTED;
}
void connectSocketIo() {
  String serverHost = "192.168.1.40";  // Đổi IP server cho phù hợp
  int serverPort = 8080;
  String nodeId = NODE_ID;
  socket.begin(serverHost.c_str(), serverPort);
  socket.on("connect", [](const char *payload, size_t length) {
    Serial.println("SocketIO đã kết nối!");
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
      // Xử lý các hành động từ server
      if (action == "updateStatus") {
        int pin = doc["led"].as<int>();
        int value = doc["value"].as<int>();
        for(int i = 0; i < NUM_LED; i++) {
          if (LED_PINS[i] == pin && pinStates[i] != (value == 1)) {
            pinStates[i] = (value == 1);
            manualOverride[i] = (value == 1);
            break;
          }
        }
        digitalWrite(pin, value == 1 ? HIGH : LOW);
        updatePin(pin, value);
        Serial.print("Đã cập nhật LED ở pin ");
        Serial.print(pin);
        Serial.print(": ");
        Serial.println(value);
      }
      if (action == "createPin") {
        const char *id = doc["id"];
        int pin = doc["led"].as<int>();
        int value = doc["value"].as<int>();
        digitalWrite(pin, value == 1 ? HIGH : LOW);
        addPinToFile(id, pin, value);
        Serial.print("Đã thêm LED ở pin ");
        Serial.print(pin);
        Serial.print(" id: ");
        Serial.print(id);
        Serial.print(": ");
        Serial.println(value);
      }
      if (action == "deletePin") {
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
      if (action == "createSchedule") {
        const char *id = doc["id"];
        int led = doc["led"].as<int>();
        const char *onTime = doc["onTime"];
        const char *offTime = doc["offTime"];
        const char *repeat = doc["repeat"];
        bool isActive = false;
        if (doc.containsKey("isActive")) {
          isActive = doc["isActive"] == true;
        }
        if (addSchedule(id, led, onTime, offTime, repeat, isActive)) {
          Serial.println("Đã thêm lịch thành công!");
        } else {
          Serial.println("Thêm lịch thất bại!");
        }
      }
      if (action == "updateSchedule") {
        const char *id = doc["id"];
        const char *onTime = doc["onTime"];
        const char *offTime = doc["offTime"];
        const char *repeat = doc["repeat"];
        bool isActive = false;
        if (doc.containsKey("isActive")) {
          isActive = doc["isActive"] == true;
        }
        if (updateSchedule(id, onTime, offTime, repeat, isActive)) {
          Serial.println("Đã update lịch thành công!");
        } else {
          Serial.println("Update lịch thất bại!");
        }
      }
      if (action == "deleteSchedule") {
        const char *id = doc["id"];
        if (removeSchedule(id)) {
          Serial.println("Đã xóa lịch thành công!");
        } else {
          Serial.println("Xóa lịch thất bại!");
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
bool login() {
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
    TOKEN = token;
  }
  http.end();
  return (TOKEN != "");
}
bool sendNodeInfo(String token) {
  HTTPClient http;
  String mac = WiFi.macAddress();
  String ip = WiFi.localIP().toString();
  String nodeName = "ESP32-" + mac.substring(mac.length() - 5);
  String nodeId = NODE_ID;
  String serverUrl = "http://192.168.1.40:8080/api/v1/nodes/" + nodeId;
  StaticJsonDocument<128> payloadDoc;
  payloadDoc["name"] = nodeName;
  payloadDoc["ip"] = ip;
  payloadDoc["mac"] = mac;
  payloadDoc["isConfig"] = true;
  String payload;
  serializeJson(payloadDoc, payload);
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + token);
  int httpCode = http.PUT(payload);
  String res = http.getString();
  http.end();
  return (httpCode == 200);
}
bool updateStatusLed(String token, String id, bool status) {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/devices/update/me/" + id;
  StaticJsonDocument<128> payloadDoc;
  payloadDoc["status"] = status;
  String payload;
  serializeJson(payloadDoc, payload);
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + token);
  int httpCode = http.PUT(payload);
  String res = http.getString();
  Serial.println("Update status response: " + res);
  http.end();
  return (httpCode == 200);
}
// void getPinsUsedFromServer(String token) {
//   HTTPClient http;
//   String serverUrl = "http://192.168.1.40:8080/api/v1/nodes/" + NODE_ID + "?pinsUsed=1";
//   http.begin(serverUrl);
//   http.addHeader("Authorization", "Bearer " + token);
//   int httpCode = http.GET();
//   String res = http.getString();
//   http.end();
//   StaticJsonDocument<256> doc;
//   DeserializationError err = deserializeJson(doc, res);
//   if (!err) {
//     for (int i = 0; i < NUM_LED; i++) {
//       int pin = LED_PINS[i];
//       if (doc[String(pin)].is<int>()) {
//         int value = doc[String(pin)].as<int>();
//         String id = doc["_id"].as<String>();
//         digitalWrite(pin, value == 1 ? HIGH : LOW);
//         if (checkPin(pin)) {
//           updatePin(pin, value);
//         } else {
//           addPinToFile(id, pin, value);
//         }
//       }
//     }
//   }
// }
bool onApAndWebServer() {
  WiFi.softAP(AP_SSID, AP_PASS);
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());
  server.on("/setup", handleSetup);
  server.begin();
  Serial.println("Webserver started");
  return true;
}
bool config() {
  bool ok = connectToWiFi();
  if (ok) {
    if (login()) {
      bool success = sendNodeInfo(TOKEN);
      return success;
    } else {
      clearConfig();
      return false;
    }
  } else {
    clearConfig();
    return false;
  }
}
void reConfig() {
  int buttonState = digitalRead(BUTTON_PIN);
  int bootState = digitalRead(BOOT_PIN);
  currentState = (buttonState == LOW || bootState == LOW) ? LOW : HIGH;
  if (lastState == HIGH && currentState == LOW) {
    pressedTime = millis();
  }
  if (currentState == LOW && pressedTime > 0) {
    long holdDuration = millis() - pressedTime;
    if (holdDuration >= LONG_PRESS_TIME) {
      ledState = !ledState;
      digitalWrite(BOARD_LED_PIN, ledState);
      if (ledState == HIGH) {
        isConfigured = false;
      } else {
        isConfigured = true;
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


// -----------------------------
// Setup: khởi tạo FS, pins, mutex/queue, tạo task
// -----------------------------
void setup() {
  Serial.begin(115200);
  delay(200);

  xConfigMutex = xSemaphoreCreateMutex();
  xEventQueue = xQueueCreate(10, sizeof(int));

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
    if (createPinFile() && createScheduleFile()) {
      Serial.println("Đã tạo file !");
    } else {
      Serial.println("Lỗi tạo file !");
    }
  }

  configTime(7 * 3600, 0, "pool.ntp.org", "time.google.com");

  for (int i = 0; i < NUM_LED; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }
  for (int i = 0; i < NUM_BUTTON; i++) {
    pinMode(BUTTON_PINS[i], INPUT_PULLUP);
  }
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BOOT_PIN, INPUT_PULLUP);
  pinMode(BOARD_LED_PIN, OUTPUT);
  digitalWrite(BOARD_LED_PIN, ledState ? HIGH : LOW);



  loadConfig();
  isConfigured = WIFI_SSID.length() > 0 && WIFI_PASSWORD.length() > 0 && USER_EMAIL.length() > 0 && USER_PASSWORD.length() > 0 && NODE_ID.length() > 0;

  xTaskCreatePinnedToCore(WiFiTask, "WiFiTask", 4096, NULL, 2, &wifiTaskHandle, 1);
  xTaskCreatePinnedToCore(TimeTask, "TimeTask", 4096, NULL, 1, &timeTaskHandle, 1);
  xTaskCreatePinnedToCore(WebServerTask, "WebTask", 8192, NULL, 1, &webTaskHandle, 1);

  xTaskCreatePinnedToCore(LoginTask, "LoginTask", 4096, NULL, 1, &loginTaskHandle, 0);
  xTaskCreatePinnedToCore(SocketTask, "SocketTask", 8192, NULL, 1, &socketTaskHandle, 0);
  //   xTaskCreatePinnedToCore(StorageTask, "StorageTask", 4096, NULL, 1, &storageTaskHandle, 0);
  xTaskCreatePinnedToCore(LedScheduleTask, "LedScheduleTask", 4096, NULL, 1, &ledScheduleTaskHandle, 0);
  xTaskCreatePinnedToCore(LedButtonTask, "LedButtonTask", 4096, NULL, 1, &ledButtonTaskHandle, 0);
  xTaskCreatePinnedToCore(ReconfigTask, "ReconfigTask", 4096, NULL, 1, &reconfigTaskHandle, 0);

  Serial.println("Đã tạo các task. Hệ thống chạy.");
}

void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}
