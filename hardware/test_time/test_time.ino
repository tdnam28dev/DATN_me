/*
  ESP32 FreeRTOS Example
  - WiFiTask: quản lý WiFi + đồng bộ NTP (configTime)
  - LightTask: kiểm tra thời gian và bật/tắt đèn theo lịch
  - Không dùng TaskScheduler; dùng FreeRTOS API (xTaskCreate)
*/

#include <WiFi.h>
#include "time.h"

// ======= Cấu hình WiFi & NTP =======
const char* WIFI_SSID = "P1202";
const char* WIFI_PASS = "88888888";

const char* NTP_SERVER = "pool.ntp.org";
const long  GMT_OFFSET_SEC = 7 * 3600; // GMT+7
const int   DAYLIGHT_OFFSET_SEC = 0;

// ======= Chân điều khiển đèn =======
#define LIGHT_PIN 19  // thay chân theo board của bạn (GPIO2 là LED on-board nhiều board)

// ======= Lịch bật/tắt (có thể thay đổi) =======
int ON_HOUR  = 00;
int ON_MIN   = 31;
int OFF_HOUR = 00;
int OFF_MIN  = 32;

// ======= Biến trạng thái chia sẻ =======
volatile bool timeSynced = false; // true khi NTP đã sync (đủ tin cậy)

// ======= Hàm tiện ích: tạo timestamp "HÔM NAY giờ:phút" =======
time_t makeTodayTime(int hour, int minute) {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo, 2000)) return 0; // trả 0 nếu chưa có time
  timeinfo.tm_hour = hour;
  timeinfo.tm_min  = minute;
  timeinfo.tm_sec  = 0;
  return mktime(&timeinfo);
}

// ======= Hàm bật/tắt đèn theo lịch (được gọi trong LightTask) =======
void controlLightBySchedule() {
  // Nếu chưa sync thời gian, ta không can thiệp vội (hoặc có thể tắt đèn an toàn)
  if (!timeSynced) {
    digitalWrite(LIGHT_PIN, LOW);
    return;
  }

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo, 1000)) { // lấy thời gian với timeout 1s
    // nếu thất bại, tắt an toàn
    digitalWrite(LIGHT_PIN, LOW);
    return;
  }

  time_t current = mktime(&timeinfo);
  time_t onTime  = makeTodayTime(ON_HOUR, ON_MIN);
  time_t offTime = makeTodayTime(OFF_HOUR, OFF_MIN);

  if (onTime == 0 || offTime == 0) {
    digitalWrite(LIGHT_PIN, LOW);
    return;
  }

  // Trường hợp ON <= OFF trong cùng ngày
  if (onTime <= offTime) {
    if (current >= onTime && current < offTime) digitalWrite(LIGHT_PIN, HIGH);
    else digitalWrite(LIGHT_PIN, LOW);
  } else {
    // Trường hợp lịch bọc qua nửa đêm (ví dụ bật 20:00 - tắt 03:00)
    if (current >= onTime || current < offTime) digitalWrite(LIGHT_PIN, HIGH);
    else digitalWrite(LIGHT_PIN, LOW);
  }
}

// ======= WiFi & NTP task =======
// Nhiệm vụ: kết nối WiFi, configTime, kiểm tra sync, reconnect khi cần.
void WiFiTask(void* pvParameters) {
  (void) pvParameters;

  for (;;) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.printf("[WiFiTask] Connecting to %s\n", WIFI_SSID);
      WiFi.mode(WIFI_STA);
      WiFi.begin(WIFI_SSID, WIFI_PASS);

      unsigned long startAttempt = millis();
      // chờ tối đa 10s để connect (có thể điều chỉnh)
      while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
        vTaskDelay(pdMS_TO_TICKS(500));
        Serial.print(".");
      }
      Serial.println();
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("[WiFiTask] WiFi connected, IP: " + WiFi.localIP().toString());

      // Cấu hình NTP
      configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
      Serial.println("[WiFiTask] NTP configTime called. Waiting for sync...");

      // Chờ time sync: kiểm tra năm >= 2019 hoặc timeout 10s
      bool synced = false;
      unsigned long syncStart = millis();
      while (!synced && millis() - syncStart < 10000) {
        struct tm timeinfo;
        if (getLocalTime(&timeinfo, 2000)) {
          if (timeinfo.tm_year + 1900 >= 2019) {
            synced = true;
            break;
          }
        }
        vTaskDelay(pdMS_TO_TICKS(500));
      }

      if (synced) {
        timeSynced = true;
        Serial.println("[WiFiTask] Time synced OK.");
        // Print current time
        struct tm timeinfo;
        if (getLocalTime(&timeinfo)) {
          char buf[64];
          strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &timeinfo);
          Serial.printf("[WiFiTask] Current time: %s\n", buf);
        }
      } else {
        timeSynced = false;
        Serial.println("[WiFiTask] Time sync FAILED (timeout).");
      }

      // Khi đã kết nối & đồng bộ hoặc không, kiểm tra định kỳ
      // Nếu mất WiFi, vòng lặp sẽ reconnect ở đầu
      // Ở đây sleep 30s trước khi kiểm tra lại trạng thái
      for (int i = 0; i < 30; ++i) {
        if (WiFi.status() != WL_CONNECTED) break;
        vTaskDelay(pdMS_TO_TICKS(1000));
      }

    } else {
      // Chưa kết nối WiFi -> chờ 2s rồi thử lại
      Serial.println("[WiFiTask] WiFi not connected, retrying...");
      vTaskDelay(pdMS_TO_TICKS(2000));
    }

    // Nếu WiFi mất, đánh dấu timeSynced false
    if (WiFi.status() != WL_CONNECTED) {
      timeSynced = false;
      WiFi.disconnect(true, true); // force disconnect, xóa config tạm
      vTaskDelay(pdMS_TO_TICKS(2000));
    }
  } // end for
}

// ======= Light control task =======
void LightTask(void* pvParameters) {
  (void) pvParameters;

  // Khởi tạo chân
  pinMode(LIGHT_PIN, OUTPUT);
  digitalWrite(LIGHT_PIN, LOW);

  for (;;) {
    // Kiểm tra & điều khiển (mỗi 1s)
    controlLightBySchedule();
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}

// ======= Setup & loop =======
void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println();
  Serial.println("==== ESP32 FreeRTOS Light Scheduler ====");

  // Tạo tasks FreeRTOS
  // WiFiTask: stack 4096 bytes, priority 1, gán core 1 (thay đổi nếu cần)
  BaseType_t r1 = xTaskCreatePinnedToCore(
    WiFiTask,            // task function
    "WiFiTask",          // name
    4096,                // stack (bytes)
    NULL,                // parameter
    1,                   // priority
    NULL,                // task handle
    1                    // run on core 1
  );

  // LightTask: stack 4096 bytes, priority 1, gán core 0
  BaseType_t r2 = xTaskCreatePinnedToCore(
    LightTask,
    "LightTask",
    4096,
    NULL,
    1,
    NULL,
    0
  );

  if (r1 == pdPASS && r2 == pdPASS) {
    Serial.println("[setup] Tasks created successfully.");
  } else {
    Serial.println("[setup] Failed to create tasks!");
  }
}

void loop() {
  // Không dùng loop() để làm việc; tasks xử lý toàn bộ
  vTaskDelay(pdMS_TO_TICKS(1000));
}
