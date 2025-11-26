#include <SPI.h>
#include <MFRC522.h>
#include <Preferences.h>
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <SocketIoClient.h>
#include <Keypad.h>
#include <LiquidCrystal_I2C.h>
#include <Arduino.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

#define SS_PIN 5
#define RST_PIN 0
#define BUZZER 4  // GPIO4 pin kết nối còi báo
#define LED_ONL 2
#define LED_OFF 17
#define SERVO_PIN 15
#define BUTTON_PIN 16
// Biến ROOM_ID cho socket.io
String ROOM_ID = "1234";
// ID thẻ
String CARD_ID = "";
// Tên thẻ
String CARD_NAME = "";
// Thông tin kết nối WIFI
String WIFI_SSID = "";
String WIFI_PASSWORD = "";
// Thông tin user
String USER_EMAIL = "admin";
String USER_PASSWORD = "1";
// Mật khẩu cửa
String PASS = "";
// Access token
String ACCESS_TOKEN = "";
String ACCESS_TYPE = "";
// Xác định thẻ khách
bool IS_GUEST = false;

// -----khởi tạo server, socket, eeprom-----//
WebServer server(80);
SocketIoClient socket;
Preferences eeprom;
LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo sv;
MFRC522 rfid(SS_PIN, RST_PIN);
byte nuidPICC[4];
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

// --------------------------- WIFI ------------------------------------- //

const int MAX_NETWORKS = 20;        // Số lượng mạng tối đa để lưu lại
String wifiNetworks[MAX_NETWORKS];  // Mảng để lưu các SSID
int numNetworks = 0;                // Số lượng mạng tìm được
bool isConnectedWifi;               // Trạng thái WIFI

// Hàm quét các mạng WiFi
void scanWifi() {
  WiFi.mode(WIFI_STA);
  //WiFi.disconnect();
  numNetworks = 0;
  lcd.setCursor(0, 0);
  lcd.print("Scaning WiFi...");
  int numScanNetworks = WiFi.scanNetworks();
  lcd.clear();

  if (numScanNetworks == -1) {
    lcd.setCursor(0, 0);
    lcd.print("Couldn't get a WiFi");
    delay(2000);
    lcd.clear();
  } else {
    Serial.print("Found ");
    Serial.print(numScanNetworks);
    Serial.println(" networks");

    // Lưu các SSID vào mảng
    for (int i = 0; i < numScanNetworks; ++i) {
      if (numNetworks < MAX_NETWORKS) {
        wifiNetworks[numNetworks] = WiFi.SSID(i);
        numNetworks++;
      } else {
        Serial.println("Exceeded max number of networks");
        break;
      }
    }
  }
}

// Hàm kết nối WiFi
bool connectToWiFi() {
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting Wifi");
  lcd.setCursor(0, 1);
  lcd.print(WIFI_SSID);
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());
  String dot = "";
  int timer = 0;
  bool iscnt = true;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    timer++;
    dot += ".";
    if (dot.length() == 4) {
      dot = "";
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Connecting Wifi");
    }
    lcd.setCursor(0, 1);
    lcd.print(WIFI_SSID + dot);
    Serial.print(".");
    if (timer == 30) {
      iscnt = false;
      //WiFi.disconnect(true);
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Unable to/nconnect WiFi");
      delay(2000);
      lcd.clear();
      break;
    }
  }
  if (iscnt) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi connected");
    lcd.setCursor(0, 1);
    lcd.print("IP: ");
    lcd.print(WiFi.localIP());
    delay(2000);
    lcd.clear();
    return true;
  }
  return false;  // Trả về false nếu không kết nối được WiFi
}

// ------------------------ Đọc/Ghi EEPROM ----------------------------- //
bool hasCharacters(String str) {
  return str.length() > 0;
}

// Hàm kiểm tra thông tin PassDoor
bool checkPassDoorInfo() {
  eeprom.begin("my-app", true);
  bool check = eeprom.isKey("pass") && eeprom.getString("pass").length() > 0;
  if (check) {
    PASS = eeprom.getString("pass");  // Gán giá trị từ EEPROM cho biến PASS
  }
  eeprom.end();
  return check;
}

// Hàm thiết lập thông tin PassDoor
bool setPassDoorInfo(String pass) {
  if (hasCharacters(pass)) {
    eeprom.begin("my-app", false);
    eeprom.putString("pass", pass);
    eeprom.end();
    PASS = pass;  // Cập nhật giá trị mới cho biến PASS
    return true;
  } else {
    return false;
  }
}

// Hàm thiết lập thông tin WiFi
bool setWiFiInfo() {
  if (hasCharacters(WIFI_SSID) && hasCharacters(WIFI_PASSWORD)) {
    eeprom.begin("my-app", false);
    eeprom.putString("ssid", WIFI_SSID);
    eeprom.putString("password", WIFI_PASSWORD);
    eeprom.end();
    Serial.println("ok");
    return true;
  } else {
    Serial.println("not ok");
    return false;
  }
}

// Hàm kiểm tra thông tin WiFi
bool checkWifiInfo() {
  eeprom.begin("my-app", true);
  bool check = eeprom.isKey("ssid") && eeprom.isKey("password") && eeprom.getString("ssid").length() > 0 && eeprom.getString("password").length() > 0;
  if (check) {
    WIFI_SSID = eeprom.getString("ssid");
    WIFI_PASSWORD = eeprom.getString("password");
  }
  eeprom.end();
  return check;
}

// ------------------------ Đọc/ghi danh sách thẻ ------------------ //

bool checkFile() {
  return LittleFS.exists("/cards.json");
}

bool createFile() {
  File file = LittleFS.open("/cards.json", "w");
  if (!file) {
    return false;
  } else {
    file.close();
    return true;
  }
}

bool addCardToFile(String id, String name) {
  File file = LittleFS.open("/cards.json", "a");
  if (file) {
    StaticJsonDocument<128> doc;
    doc["id"] = id;
    doc["name"] = name;
    serializeJson(doc, file);
    file.println();
    file.close();
    Serial.println("Đã thêm thẻ mới vào file!");
    return true;
  } else {
    return false;
  }
}

bool checkCardById(String id) {
  File file = LittleFS.open("/cards.json", "r");
  if (!file) {
    Serial.println("Không mở được file cards.json để đọc!");
    return false;
  } else {
    while (file.available()) {
      String line = file.readStringUntil('\n');
      StaticJsonDocument<128> doc;
      DeserializationError err = deserializeJson(doc, line);
      if (!err) {
        if (doc["id"].as<String>() == id) {
          CARD_NAME = doc["name"].as<String>();
          if (CARD_NAME == "guest") {
            IS_GUEST = true;
          } else {
            IS_GUEST = false;
          }
          file.close();
          return true;
        }
      }
    }
    file.close();
    return false;
  }
}

bool removeCardById(String id) {
  File file = LittleFS.open("/cards.json", "r");
  if (!file) return false;
  String newContent = "";
  while (file.available()) {
    String line = file.readStringUntil('\n');
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, line);
    if (!err) {
      if (doc["id"].as<String>() != id) {
        newContent += line + "\n";
      }
    }
  }
  file.close();
  file = LittleFS.open("/cards.json", "w");
  if (!file) return false;
  file.print(newContent);
  file.close();
  return true;
}

void readAllId() {
  File file = LittleFS.open("/cards.json", "r");
  if (file) {
    Serial.println("Danh sách thẻ:");
    while (file.available()) {
      String line = file.readStringUntil('\n');
      StaticJsonDocument<128> docRead2;
      DeserializationError err = deserializeJson(docRead2, line);
      if (!err) {
        Serial.print("ID: ");
        Serial.print(docRead2["id"].as<const char *>());
        Serial.print(" | Name: ");
        Serial.println(docRead2["name"].as<const char *>());
      }
    }
    file.close();
  }
}

// -----------------------Hàm đăng nhập -----------------------//
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

bool createAccessLog(String status) {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/access-logs/";
  String payload = "{";
  payload += "\"cardNumber\":\"" + CARD_ID + "\",";
  payload += "\"accessType\":\"" + ACCESS_TYPE + "\",";
  payload += "\"status\":\"" + status + "\"";
  if (IS_GUEST) {
    payload += ",\"isGuest\":true";
  }
  payload += "}";
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + ACCESS_TOKEN);
  int httpCode = http.POST(payload);
  String res = http.getString();
  Serial.println("AccessLog response: " + res);
  http.end();
  return (httpCode == 200);
}

bool addCardUser(String employeeId) {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/users/employee/" + employeeId;
  String payload = "{\"cardNumber\":\"" + CARD_ID + "\"}";
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + ACCESS_TOKEN);
  int httpCode = http.PUT(payload);
  String res = http.getString();
  Serial.println("Update user response: " + res);
  if (httpCode == 200) {
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, res);
    if (!err && doc["name"].is<String>()) {
      CARD_NAME = doc["name"].as<String>();
      Serial.println("CARD_NAME: " + CARD_NAME);
    }
  }
  http.end();
  return (httpCode == 200);
}

bool getUser(String cardNumber) {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/users/card/" + cardNumber;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + ACCESS_TOKEN);
  int httpCode = http.GET();
  String res = http.getString();
  Serial.println("Get user response: " + res);
  if (httpCode == 200) {
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, res);
    if (!err && doc["name"].is<String>()) {
      CARD_NAME = doc["name"].as<String>();
      Serial.println("CARD_NAME: " + CARD_NAME);
    }
  }
  http.end();
  return (httpCode == 200);
}

bool removeCardUser(String cardNumber) {
  HTTPClient http;
  String serverUrl = "http://192.168.1.40:8080/api/v1/users/card/" + cardNumber;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + ACCESS_TOKEN);
  int httpCode = http.PUT("");
  String res = http.getString();
  Serial.println("Remove card from user response: " + res);
  http.end();
  return (httpCode == 200 || httpCode == 404);
}

void connectSocketIo() {
  String serverHost = "192.168.1.40";  // Đổi IP server cho phù hợp
  int serverPort = 8080;
  socket.begin(serverHost.c_str(), serverPort);
  socket.on("connect", [](const char *payload, size_t length) {
    Serial.println("SocketIO đã kết nối!");
    String roomIdJson = "\"" + ROOM_ID + "\"";
    socket.emit("joinRoom", roomIdJson.c_str());
  });
  socket.on("serverMessage", [](const char *payload, size_t length) {
    Serial.print("Nhận serverMessage: ");
    Serial.println(payload);
  });
  socket.on("notification", [](const char *payload, size_t length) {
    Serial.print("Nhận notification: ");
    Serial.println(payload);
  });
  socket.on("user-action", [](const char *payload, size_t length) {
    Serial.print("Nhận user-action: ");
    Serial.println(payload);
    // Parse JSON để lấy cardNumber và action
    StaticJsonDocument<128> doc;
    DeserializationError err = deserializeJson(doc, payload);
    if (!err) {
      String action = doc["action"].as<String>();
      String cardNumber = doc["cardNumber"].as<String>();
      if (action == "delete" && cardNumber.length() > 0) {
        if (removeCardById(cardNumber)) {
          Serial.println("Đã xóa thẻ: " + cardNumber);
        } else {
          Serial.println("Lỗi xóa thẻ: " + cardNumber);
        }
      }
      if (action == "restore" && cardNumber.length() > 0) {
        if (getUser(cardNumber)) {
          if (addCardToFile(cardNumber, CARD_NAME)) {
            Serial.println("Đã khôi phục thẻ: " + cardNumber);
          } else {
            Serial.println("Lỗi khôi phục thẻ: " + cardNumber);
          }
        } else {
          Serial.println("Lỗi khôi phục thẻ ở server: " + cardNumber);
        }
        CARD_NAME = "";
      }
    }
  });
  socket.on("disconnect", [](const char *payload, size_t length) {
    Serial.println("SocketIO ngắt kết nối!");
  });
}

void connect() {
  bool ok = connectToWiFi();
  if (ok) {
    ACCESS_TOKEN = login();
    if (ACCESS_TOKEN != "") {
      connectSocketIo();
      digitalWrite(LED_ONL, HIGH);
      digitalWrite(LED_OFF, LOW);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_ONL, OUTPUT);
  pinMode(LED_OFF, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  sv.attach(SERVO_PIN, 500, 2400);
  sv.write(180);
  lcd.init();
  lcd.backlight();
  lcd.begin(16, 2);
  lcd.print("Huy");
  lcd.setCursor(0, 1);
  lcd.print("PHENIKAA");
  delay(2000);
  lcd.clear();
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
  } else {
    readAllId();
  }
  if (checkWifiInfo()) {
    connect();
  } else {
    digitalWrite(LED_ONL, LOW);
    digitalWrite(LED_OFF, HIGH);
  }
  if (!checkPassDoorInfo()) {
    setPassDoorInfo("12345678");
  }

  SPI.begin();      // Init SPI bus
  rfid.PCD_Init();  // Init MFRC522

  Serial.println(F("This code scan the RFID NUID."));
}

void loop() {
  socket.loop();
  door();
  //   readCard();
}

void readCard() {
  if (!rfid.PICC_IsNewCardPresent())
    return;
  if (!rfid.PICC_ReadCardSerial())
    return;
  char hexStr[20] = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    sprintf(hexStr + strlen(hexStr), "%02X", rfid.uid.uidByte[i]);
  }
  CARD_ID = String(hexStr);
  digitalWrite(BUZZER, HIGH);
  delay(200);
  digitalWrite(BUZZER, LOW);
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

void door() {
  static String str = "";
  static String new_pass = "";
  static String selectedSSID = "";
  static String passWifi = "";
  static bool isClose = true;
  static bool isOpen = false;
  static bool isMode = false;
  static bool isChangePassword = false;
  static bool isConnect = false;
  static bool isCard = false;
  static bool isAddCard = false;
  static bool isRemoveCard = false;
  static bool isWifi = false;
  static bool isScanWifi = false;
  static bool isSelected = false;
  static bool isPassTrue = false;
  static String hidden = "";
  static int x = 0;
  static int i = 0;
  static int k = 47;
  static unsigned long t;
  static const char *modeList[3] = { "Connect", "Card", "Change Password" };
  static int modeIndex = 0;
  static const char *wifiList[2] = { "Scan Wifi", "Disconnect" };
  static int wifiIndex = 0;
  static const char *connectList[2] = { "Wifi", "Bluetooth" };
  static int connectIndex = 0;
  static const char *cardList[2] = { "Add Card", "Remove Card" };
  static int cardIndex = 0;
  static bool isSelectType = false;
  static int typeIndex = 0;
  static bool isInputEmp = false;
  static String empCode = "";
  static bool isCardScanned = false;
  static bool isConfirmRemove = false;
  static unsigned long pressedTime = 0;
  static int lastButtonState = HIGH;
  if (isClose) {
    int buttonState = digitalRead(BUTTON_PIN);
    lcd.setCursor(0, 0);
    lcd.print("Enter Password:");
    char temp = keypad.getKey();
    readCard();
    if (CARD_ID.length() > 0) {
      if (checkCardById(CARD_ID)) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Card Accepted");
        lcd.setCursor(0, 1);
        lcd.print("Welcome " + CARD_NAME);
        for (int vitri = 180; vitri >= 90; vitri--) {
          sv.write(vitri);
        }
        ACCESS_TYPE = "in";
        createAccessLog("accepted");
        delay(2000);
        isClose = false;
        isOpen = true;
        IS_GUEST = false;
        CARD_ID = "";
        CARD_NAME = "";
        ACCESS_TYPE = "";
        t = millis();
        lcd.clear();
      } else {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Card Denied");
        lcd.setCursor(0, 1);
        lcd.print("Unknown Card");
        ACCESS_TYPE = "in";
        createAccessLog("rejected");
        delay(2000);
        ACCESS_TYPE = "";
        CARD_ID = "";
        CARD_NAME = "";
        lcd.clear();
      }
      CARD_ID = "";
    }

    // Kiểm tra giữ nút BUTTON_PIN để mở cửa
    if (lastButtonState == HIGH && buttonState == LOW) {
      pressedTime = millis();
    }
    if (buttonState == LOW && pressedTime > 0) {
      long holdDuration = millis() - pressedTime;
      if (holdDuration >= 1000) {
        CARD_ID = "MANUAL_OPEN";
        ACCESS_TYPE = "out";
        createAccessLog("accepted");
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Open");
        for (int vitri = 180; vitri >= 90; vitri--) {
          sv.write(vitri);
        }
        CARD_ID = "";
        ACCESS_TYPE = "";
        isClose = false;
        isOpen = true;
        pressedTime = 0;
        t = millis();
        lcd.clear();
        // Đợi nhả nút
        while (digitalRead(BUTTON_PIN) == LOW) {
          delay(10);
        }
      }
    }
    lastButtonState = buttonState;
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
        if (str.length() == 8 && str == PASS) {
          delay(600);
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Open");
          for (int vitri = 180; vitri >= 90; vitri--) {
            sv.write(vitri);
          }
          isClose = false;
          isOpen = true;
          str = "";
          hidden = "";
          x = 0;
          t = millis();
          lcd.clear();
        } else if (str.length() == 8 && str != PASS) {
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
        for (int vitri = 90; vitri <= 180; vitri++) {
          sv.write(vitri);
        }
        isOpen = false;
        isClose = true;
        lcd.clear();
      }
    }
  }
  if (isMode) {
    lcd.setCursor(0, 0);
    lcd.print("Setting:");
    lcd.setCursor(0, 1);
    lcd.print(String(modeIndex + 1) + ":" + modeList[modeIndex]);
    char temp = keypad.getKey();
    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp == '6') {  // Next chức năng
        modeIndex++;
        if (modeIndex > 2) modeIndex = 0;
        lcd.clear();
      }
      if ((char)temp == '4') {  // Previous chức năng
        modeIndex--;
        if (modeIndex < 0) modeIndex = 2;
        lcd.clear();
      }
      if ((char)temp == '5') {  // Chọn chức năng
        if (modeIndex == 0) {   // Connect
          isMode = false;
          isConnect = true;
        } else if (modeIndex == 1) {  // Card
          isMode = false;
          isCard = true;
        } else if (modeIndex == 2) {  // Change Password
          isMode = false;
          isChangePassword = true;
        }
        lcd.clear();
      }
      if ((char)temp == 'B') {  // Thoát menu
        isMode = false;
        isClose = true;
        isOpen = false;
        lcd.clear();
      }
    }
  }
  if (isConnect) {
    lcd.setCursor(0, 0);
    lcd.print("Connect:");
    lcd.setCursor(0, 1);
    lcd.print(String(connectIndex + 1) + ":" + connectList[connectIndex]);
    char temp = keypad.getKey();
    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp == '6') {  // Next
        connectIndex++;
        if (connectIndex > 1) connectIndex = 0;
        lcd.clear();
      }
      if ((char)temp == '4') {  // Previous
        connectIndex--;
        if (connectIndex < 0) connectIndex = 1;
        lcd.clear();
      }
      if ((char)temp == '5') {    // Chọn
        if (connectIndex == 0) {  // Wifi
          isWifi = true;
          isConnect = false;
        } else if (connectIndex == 1) {  // Bluetooth
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("null");
          delay(2000);
        }
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
    lcd.print("Wifi:");
    lcd.setCursor(0, 1);
    lcd.print(String(wifiIndex + 1) + ":" + wifiList[wifiIndex]);
    char temp = keypad.getKey();
    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp == '6') {  // Next
        wifiIndex++;
        if (wifiIndex > 1) wifiIndex = 0;
        lcd.clear();
      }
      if ((char)temp == '4') {  // Previous
        wifiIndex--;
        if (wifiIndex < 0) wifiIndex = 1;
        lcd.clear();
      }
      if ((char)temp == '5') {  // Chọn
        if (wifiIndex == 0) {   // Scan Wifi
          isScanWifi = true;
          isWifi = false;
        } else if (wifiIndex == 1) {  // Disconnect
          // Xử lý disconnect nếu cần
        }
        lcd.clear();
      }
      if ((char)temp == 'B') {
        isConnect = true;
        isWifi = false;
        lcd.clear();
      }
    }
  }
  if (isScanWifi) {
    if (WiFi.status() != WL_CONNECTED && numNetworks == 0) {
      WiFi.disconnect(true);
    }
    if (numNetworks == 0) {
      scanWifi();
    }
    char temp = keypad.getKey();
    if (!isSelected) {
      lcd.setCursor(0, 0);
      lcd.print("Select Wifi:");
      lcd.setCursor(0, 1);
      lcd.print(wifiNetworks[i]);
      if ((int)keypad.getState() == PRESSED) {
        if ((char)temp == '6') {
          lcd.clear();
          i++;
          if (i == numNetworks) {
            i = 0;
            lcd.setCursor(0, 1);
            lcd.print(wifiNetworks[i]);
          } else {
            lcd.setCursor(0, 1);
            lcd.print(wifiNetworks[i]);
          }
        }
        if ((char)temp == '4') {
          lcd.clear();
          i--;
          if (i < 0) {
            i = numNetworks - 1;
            lcd.setCursor(0, 1);
            lcd.print(wifiNetworks[i]);
          } else {
            lcd.setCursor(0, 1);
            lcd.print(wifiNetworks[i]);
          }
        }
        if ((char)temp == '5') {
          WIFI_SSID = wifiNetworks[i];
          Serial.println(WIFI_SSID);
          isSelected = true;
          lcd.clear();
        }
        if ((char)temp == 'B') {
          isScanWifi = false;
          isWifi = true;
          numNetworks = 0;
          lcd.clear();
        }
      }
    }
    if (isSelected) {
      lcd.setCursor(0, 0);
      lcd.print("Enter password:");
      if ((int)keypad.getState() == PRESSED) {
        if ((char)temp == '2') {
          k++;
          if (k > 122) {
            k = 48;
          }
          lcd.setCursor(passWifi.length(), 1);
          lcd.print(char(k));
        }
        if ((char)temp == '8') {
          k--;
          if (k < 48) {
            k = 122;
          }
          lcd.setCursor(passWifi.length(), 1);
          lcd.print(char(k));
        }
        if ((char)temp == '5') {
          if (k >= 48 && k <= 122) {
            passWifi += char(k);
            k = 47;
          }
          lcd.setCursor(0, 1);
          lcd.print(passWifi + "_");
        }
        if ((char)temp == 'C') {
          if (passWifi.length() > 0) {
            passWifi.remove(passWifi.length() - 1);
            lcd.clear();
          }
          lcd.setCursor(0, 1);
          lcd.print(passWifi + "_");
        }
        if ((char)temp == 'B') {
          isSelected = false;
          numNetworks = 0;
          lcd.clear();
        }
        if ((char)temp == 'A') {
          WIFI_PASSWORD = passWifi;
          passWifi = "";
          Serial.println(WIFI_PASSWORD);
          bool a = connectToWiFi();
          if (a) {
            setWiFiInfo();
          }

          delay(2000);
          isSelected = false;
          numNetworks = 0;
          isWifi = true;
          isScanWifi = false;
          lcd.clear();
        }
      }
    }
  }
  if (isCard) {
    lcd.setCursor(0, 0);
    lcd.print("Card:");
    lcd.setCursor(0, 1);
    lcd.print(String(cardIndex + 1) + ":" + cardList[cardIndex]);
    char temp = keypad.getKey();
    if ((int)keypad.getState() == PRESSED) {
      if ((char)temp == '6') {  // Next
        cardIndex++;
        if (cardIndex > 1) cardIndex = 0;
        lcd.clear();
      }
      if ((char)temp == '4') {  // Previous
        cardIndex--;
        if (cardIndex < 0) cardIndex = 1;
        lcd.clear();
      }
      if ((char)temp == '5') {  // Chọn
        if (cardIndex == 0) {   // Add Card
          isAddCard = true;
          isCard = false;
        } else if (cardIndex == 1) {  // Remove Card
          isRemoveCard = true;
          isCard = false;
        }
        lcd.clear();
      }
      if ((char)temp == 'B') {
        isMode = true;
        isCard = false;
        lcd.clear();
      }
    }
  }
  if (isAddCard) {
    if (!isCardScanned) {
      lcd.setCursor(0, 0);
      lcd.print("Tap to add!");
      char temp = keypad.getKey();
      if ((int)keypad.getState() == PRESSED) {
        if ((char)temp == 'B') {
          isCard = true;
          isAddCard = false;
          empCode = "";
          CARD_ID = "";
          lcd.clear();
        }
      }
      readCard();
      if (CARD_ID.length() > 0) {
        if (checkCardById(CARD_ID)) {
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Card exists!");
          delay(1500);
          lcd.clear();
          CARD_ID = "";
        } else {
          isCardScanned = true;
          lcd.clear();
        }
      }
    } else if (!isSelectType) {
      lcd.setCursor(0, 0);
      lcd.print("Select card type:");
      lcd.setCursor(0, 1);
      lcd.print(typeIndex == 0 ? "1:Employee" : "2:Guest");
      char temp = keypad.getKey();
      if ((int)keypad.getState() == PRESSED) {
        if ((char)temp == '6' || (char)temp == '4') {
          typeIndex = 1 - typeIndex;
          lcd.clear();
        }
        if ((char)temp == '5') {
          isSelectType = true;
          lcd.clear();
        }
        if ((char)temp == 'B') {
          isCard = true;
          isAddCard = false;
          isCardScanned = false;
          isSelectType = false;
          isInputEmp = false;
          empCode = "";
          CARD_ID = "";
          lcd.clear();
        }
      }
    } else if (typeIndex == 0 && !isInputEmp) {
      lcd.setCursor(0, 0);
      lcd.print("Employee ID:");
      lcd.setCursor(0, 1);
      lcd.print(empCode + "_");
      char temp = keypad.getKey();
      if ((int)keypad.getState() == PRESSED) {
        if (temp >= '0' && temp <= '9' && empCode.length() < 4) {
          empCode += temp;
          lcd.clear();
        }
        if (temp == 'C' && empCode.length() > 0) {
          empCode.remove(empCode.length() - 1);
          lcd.clear();
        }
        if (temp == 'A' && empCode.length() == 4) {
          if (addCardUser(empCode)) {
            addCardToFile(CARD_ID, CARD_NAME);
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Save success!");
            delay(1500);
          } else {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Save failed!");
            delay(1500);
          }
          isCard = true;
          isAddCard = false;
          isCardScanned = false;
          isSelectType = false;
          isInputEmp = false;
          empCode = "";
          CARD_ID = "";
          CARD_NAME = "";
          lcd.clear();
        }
        if (temp == 'B') {
          isCard = true;
          isAddCard = false;
          isCardScanned = false;
          isSelectType = false;
          isInputEmp = false;
          empCode = "";
          CARD_ID = "";
          lcd.clear();
        }
      }
    } else if (typeIndex == 1 && isSelectType) {
      // Thẻ khách
      addCardToFile(CARD_ID, "guest");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Save success!");
      delay(1500);
      isCard = true;
      isAddCard = false;
      isCardScanned = false;
      isSelectType = false;
      isInputEmp = false;
      empCode = "";
      CARD_ID = "";
      lcd.clear();
    }
  }
  if (isRemoveCard) {
    if (!isCardScanned) {
      lcd.setCursor(0, 0);
      lcd.print("Tap to remove!");
      char temp = keypad.getKey();
      if ((int)keypad.getState() == PRESSED) {
        if ((char)temp == 'B') {
          isCard = true;
          isRemoveCard = false;
          lcd.clear();
        }
      }
      readCard();
      if (CARD_ID.length() > 0) {
        if (!checkCardById(CARD_ID)) {
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Card not exists!");
          delay(1500);
          lcd.clear();
          CARD_ID = "";
        } else {
          isCardScanned = true;
          lcd.clear();
        }
      }
    } else if (!isConfirmRemove) {
      lcd.setCursor(0, 0);
      lcd.print("Remove card?");
      lcd.setCursor(0, 1);
      lcd.print("5:Yes  B:No");
      char temp = keypad.getKey();
      if ((int)keypad.getState() == PRESSED) {
        if ((char)temp == '5') {
          if (removeCardUser(CARD_ID)) {
            removeCardById(CARD_ID);
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Remove success!");
            delay(1500);
          } else {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Remove failed!");
            delay(1500);
          }
          isCard = true;
          isRemoveCard = false;
          isCardScanned = false;
          isConfirmRemove = false;
          CARD_ID = "";
          lcd.clear();
        }
        if ((char)temp == 'B') {
          isCard = true;
          isRemoveCard = false;
          isCardScanned = false;
          isConfirmRemove = false;
          CARD_ID = "";
          lcd.clear();
        }
      }
    }
  }
  if (isChangePassword) {
    char temp = keypad.getKey();
    if (!isPassTrue) {
      lcd.setCursor(0, 0);
      lcd.print("Old Password:");
      if ((int)keypad.getState() == PRESSED) {
        if ((char)temp != 'A' && (char)temp != 'B' && (char)temp != 'C' && (char)temp != 'B' && temp != 0) {
          new_pass += temp;
          Serial.println(new_pass);
          hidden += "*";
          lcd.setCursor(x++, 1);
          lcd.print(temp);
          delay(250);
          lcd.setCursor(0, 1);
          lcd.print(hidden);
        }
        if (temp == 'B' && temp != 0) {
          isChangePassword = false;
          isMode = true;
          new_pass = "";
          hidden = "";
          x = 0;
          lcd.clear();
        }
        if (temp == 'C' && temp != 0) {
          if (new_pass.length() > 0) {
            str.remove(new_pass.length() - 1);
            hidden.remove(hidden.length() - 1);
            x--;
            lcd.clear();
          }
          lcd.setCursor(0, 1);
          lcd.print(hidden);
        }
        if (temp == 'A' && temp != 0 && new_pass == PASS) {
          new_pass = "";
          isPassTrue = true;
          hidden = "";
          x = 0;
          lcd.clear();
        } else if (temp == 'A' && temp != 0 && new_pass != PASS) {
          new_pass = "";
          hidden = "";
          x = 0;
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("incorect");
          lcd.setCursor(0, 1);
          lcd.print("password");
          delay(2000);
          lcd.clear();
        }
      }
    }
    if (isPassTrue) {
      lcd.setCursor(0, 0);
      lcd.print("New Password:");
      if ((int)keypad.getState() == PRESSED) {
        if ((char)temp != 'A' && (char)temp != 'B' && (char)temp != 'C' && (char)temp != 'B' && temp != 0) {
          new_pass += temp;
          Serial.println(new_pass);
          hidden += "*";
          lcd.setCursor(x++, 1);
          lcd.print(temp);
          delay(250);
          lcd.setCursor(0, 1);
          lcd.print(hidden);
        }
        if (temp == 'B' && temp != 0) {
          isChangePassword = false;
          isMode = true;
          new_pass = "";
          hidden = "";
          x = 0;
          lcd.clear();
        }
        if (temp == 'C' && temp != 0) {
          if (new_pass.length() > 0) {
            str.remove(new_pass.length() - 1);
            hidden.remove(hidden.length() - 1);
            x--;
            lcd.clear();
          }
          lcd.setCursor(0, 1);
          lcd.print(hidden);
        }
        if (temp == 'A' && temp != 0 && new_pass.length() == 8) {
          PASS = new_pass;
          setPassDoorInfo(new_pass);
          isPassTrue = false;
          isChangePassword = false;
          isMode = true;
          hidden = "";
          x = 0;
          delay(500);
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("Password is");
          lcd.setCursor(0, 1);
          lcd.print("change complete");
          new_pass = "";
          delay(2000);
          lcd.clear();
        }
      }
    }
  }
}

// ------------------Sơ đồ mạch:-------------------- //

// MFRC522      ESP32
// SDA   ----   D5
// SCK   ----   D18
// MOSI  ----   D23
// MISO  ----   D19
// RST   ----   D0

// LCD I2C      ESP32
// SDA   ----   D21
// SCL   ----   D22

// Keypad       ESP32
// Row_pin ---- D13, D12, D14, D27
// Col_pin ---- D26, D25, D33, D32

// Servo        ESP32
// Signal ----  D15

// Buzzer       ESP32
// Signal ----  D4

// LED_ONL      ESP32
// Signal ----  D2

// LED_OFF      ESP32
// Signal ----  D16

// BUTTON_PIN   ESP32
// Signal ----  D17