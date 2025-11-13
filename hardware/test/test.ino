
#include <WiFi.h>
#include <SocketIoClient.h>

const char* ssid = "P1202";
const char* password = "88888888";
const char* host = "192.168.1.40"; // IP server backend
const uint16_t port = 8080;

SocketIoClient socket;

unsigned long lastSend = 0;

// Khai báo chân LED
const int LED1_PIN = 19;
const int LED2_PIN = 5;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi đã kết nối!");

  // Khởi tạo chân LED
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);

  // Kết nối socket.io (không có http://, chỉ IP hoặc domain)
  socket.begin(host, port);

  // Lắng nghe sự kiện notification từ server
  socket.on("notification", [](const char* payload, size_t length) {
    Serial.print("Nhận notification: ");
    Serial.println(payload);
  });

  // Lắng nghe sự kiện phản hồi từ server
  socket.on("serverMessage", [](const char* payload, size_t length) {
    Serial.print("Nhận serverMessage: ");
    Serial.println(payload);
  });

  // Lắng nghe trạng thái LED từ server
  socket.on("ledStatus", [](const char* payload, size_t length) {
    Serial.print("Nhận trạng thái LED: ");
    Serial.println(payload);
    // payload dạng JSON: {"led1":true, "led2":false}
    bool led1 = false, led2 = false;
    String data = String(payload);
    int idx1 = data.indexOf("led1");
    int idx2 = data.indexOf("led2");
    if (idx1 != -1) {
      int valIdx = data.indexOf(":", idx1);
      if (valIdx != -1) led1 = data.substring(valIdx+1, data.indexOf(",", valIdx)).indexOf("true") != -1;
    }
    if (idx2 != -1) {
      int valIdx = data.indexOf(":", idx2);
      if (valIdx != -1) led2 = data.substring(valIdx+1).indexOf("true") != -1;
    }
    digitalWrite(LED1_PIN, led1 ? HIGH : LOW);
    digitalWrite(LED2_PIN, led2 ? HIGH : LOW);
    Serial.printf("LED1: %s, LED2: %s\n", led1 ? "ON" : "OFF", led2 ? "ON" : "OFF");
  });

  // Gửi sự kiện joinRoom với roomId cụ thể
  socket.emit("joinRoom", "\"68daac56f7584a041f229d1f\"");
}

void loop() {
  socket.loop();
  // Gửi tin nhắn lên server mỗi 5 giây
  // if (millis() - lastSend > 5000) {
  //   String msg = String("ESP32 gửi lúc ") + millis()/1000 + "s";
  //   String jsonMsg = "\"" + msg + "\""; // bọc chuỗi trong dấu nháy kép
  //   socket.emit("deviceMessage", jsonMsg.c_str());
  //   Serial.print("Đã gửi deviceMessage: ");
  //   Serial.println(msg);
  //   lastSend = millis();
  // }
  delay(10);
}