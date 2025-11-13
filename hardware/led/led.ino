#include <Preferences.h>
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <SocketIoClient.h>

WebServer server(80);
SocketIoClient socket;
Preferences eeprom;

#define NUM_LED 5
const int LED_PINS[NUM_LED] = { 19, 5, 16, 0, 15 };

String WIFI_SSID = "";
String WIFI_PASSWORD = "";
String USER_EMAIL = "";
String USER_PASSWORD = "";
String NODE_ID = "";

// Phát WiFi (Access Point)
const char *AP_SSID = "ESP32-Setup";
const char *AP_PASS = "12345678";

void handleSetWiFi() {
  if (server.hasArg("ssid") && server.hasArg("password") && server.hasArg("user") && server.hasArg("userpass") && server.hasArg("node")) {
    WIFI_SSID = server.arg("ssid");
    WIFI_PASSWORD = server.arg("password");
    USER_EMAIL = server.arg("user");
    USER_PASSWORD = server.arg("userpass");
    NODE_ID = server.arg("node");
    // Lưu vào EEPROM
    eeprom.begin("my-app", false);
    eeprom.putString("ssid", WIFI_SSID);
    eeprom.putString("password", WIFI_PASSWORD);
    eeprom.putString("user_email", USER_EMAIL);
    eeprom.putString("user_password", USER_PASSWORD);
    eeprom.putString("node_id", NODE_ID);
    eeprom.end();
    bool success = connectToWiFiAndLogin();
    if (success) {
      WiFi.softAPdisconnect(true);  // Ngắt AP khi cấu hình thành công
    }
    server.send(200, "application/json", success ? "true" : "false");
  } else {
    server.send(400, "text/plain", "Missing ssid, password, user, userpass, or node");
  }
}

bool connectToWiFiAndLogin() {
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());
  Serial.print("Đang kết nối WiFi thực...");
  int timer = 0;
  while (WiFi.status() != WL_CONNECTED && timer < 30) {
    delay(500);
    Serial.print(".");
    timer++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi đã kết nối!");
    Serial.print("IP LAN: ");
    Serial.println(WiFi.localIP());
    bool ok = loginAndSendNodeInfo();
    if (ok) {
      connectSocketIo();
    }
    return ok;
  } else {
    Serial.println("\nKết nối WiFi thất bại!");
    return false;
  }
}
// Hàm kết nối socket.io tới server
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
    String msg = String(payload);
    if (msg.indexOf("toggle") != -1) {
      // Lấy giá trị pin từ chuỗi JSON
      int pinValue = -1;
      int ledIdx = msg.indexOf("\"led\":");
      if (ledIdx != -1) {
        int start = ledIdx + 6;
        int end = msg.indexOf(',', start);
        if (end == -1) end = msg.indexOf('}', start);
        String pinStr = msg.substring(start, end);
        pinStr.trim();
        pinValue = pinStr.toInt();
      }
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
        int value = (msg.indexOf("\"value\":1") != -1) ? HIGH : LOW;
        digitalWrite(LED_PINS[ledNum], value);
        Serial.print("Đã cập nhật LED ở pin ");
        Serial.print(LED_PINS[ledNum]);
        Serial.print(" (LED số ");
        Serial.print(ledNum + 1);
        Serial.print("): ");
        Serial.println(value);
      }
    }
  });
  // Lắng nghe sự kiện notification từ server
  socket.on("notification", [](const char *payload, size_t length) {
    Serial.print("Nhận notification: ");
    Serial.println(payload);
  });
  socket.on("disconnect", [](const char *payload, size_t length) {
    Serial.println("SocketIO ngắt kết nối!");
  });
}

bool loginAndSendNodeInfo() {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/auth/login";  // Đổi IP server cho phù hợp
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
    success = sendNodeInfo(token);
  }
  http.end();
  return success;
}

bool sendNodeInfo(String token) {
  HTTPClient http;
  String mac = WiFi.macAddress();
  String ip = WiFi.localIP().toString();
  String nodeName = "ESP32-" + mac.substring(mac.length() - 5);
  String nodeId = NODE_ID;                                               // Sử dụng NODE_ID làm nodeId truyền từ app
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

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < NUM_LED; i++) {
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
  }
  // Đọc thông tin từ EEPROM nếu có
  bool isConfigured = false;
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
  // Kiểm tra đã cấu hình đủ thông tin chưa
  isConfigured = WIFI_SSID.length() > 0 && WIFI_PASSWORD.length() > 0 && USER_EMAIL.length() > 0 && USER_PASSWORD.length() > 0 && NODE_ID.length() > 0;
  eeprom.end();

  if (!isConfigured) {
    WiFi.softAP(AP_SSID, AP_PASS);
    Serial.print("AP IP: ");
    Serial.println(WiFi.softAPIP());
    server.on("/set-wifi", handleSetWiFi);  // Truyền cả ssid, password, user, userpass
    server.on("/get-wifi", handleGetWiFi);
    server.on("/get-user", handleGetUser);
    server.begin();
    Serial.println("Webserver started");
  } else {
    // Nếu đã cấu hình, kết nối WiFi và socket
    bool ok = connectToWiFiAndLogin();
    if (ok) {
      connectSocketIo();
    }
  }
}

void loop() {
  server.handleClient();
  socket.loop();
}
