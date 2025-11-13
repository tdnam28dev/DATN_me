/*
 * This ESP32 code is created by esp32io.com
 *
 * This ESP32 code is released in the public domain
 *
 * For more detail (instruction and wiring diagram), visit https://esp32io.com/tutorials/esp32-button-long-press-short-press
 */

#define BUTTON_PIN 22         // GPIO22 pin kết nối nút thường
#define BOOT_PIN   0          // GPIO0 pin kết nối nút BOOT
#define LONG_PRESS_TIME 5000  // 5000 milliseconds (5 giây)
#define BOARD_LED_PIN 2  // GPIO2 là đèn có sẵn trên mạch

// Variables will change:
int lastState = LOW;  // the previous state from the input pin
int currentState;     // the current reading from the input pin
unsigned long pressedTime = 0;
unsigned long releasedTime = 0;
bool ledState = LOW;  // trạng thái hiện tại của đèn

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BOOT_PIN, INPUT_PULLUP); // cấu hình nút BOOT
  pinMode(BOARD_LED_PIN, OUTPUT);         // cấu hình chân đèn trên mạch là OUTPUT
  digitalWrite(BOARD_LED_PIN, ledState);  // khởi tạo trạng thái đèn trên mạch
}

void loop() {
  // Đọc trạng thái của cả hai nút
  int buttonState = digitalRead(BUTTON_PIN);
  int bootState = digitalRead(BOOT_PIN);
  // Nếu một trong hai nút được nhấn thì coi như nút đang nhấn
  currentState = (buttonState == LOW || bootState == LOW) ? LOW : HIGH;

  if (lastState == HIGH && currentState == LOW) {  // button is pressed
    pressedTime = millis();
  }

  // Nếu đang giữ nút (nút đang LOW) và đã nhấn đủ 5 giây thì đèn tự sáng
  if (currentState == LOW && pressedTime > 0) {
    long holdDuration = millis() - pressedTime;
    if (holdDuration >= LONG_PRESS_TIME) {
      // Đảo trạng thái đèn mỗi lần giữ đủ 5 giây
      ledState = !ledState;
      digitalWrite(BOARD_LED_PIN, ledState);
      if (ledState == HIGH) {
        Serial.println("Đã giữ nút đủ 5 giây, đèn tự sáng");
      } else {
        Serial.println("Đã giữ nút đủ 5 giây, đèn đã tắt");
      }
      // Đợi nhả nút mới cho phép lần nhấn tiếp theo
      while (digitalRead(BUTTON_PIN) == LOW || digitalRead(BOOT_PIN) == LOW) {
        delay(10);
      }
      pressedTime = 0;
    }
  }

  // Nếu nhả nút trước 5 giây thì đèn không sáng
  if (lastState == LOW && currentState == HIGH) {
    if (pressedTime > 0 && ledState == LOW) {
      long pressDuration = millis() - pressedTime;
      if (pressDuration < LONG_PRESS_TIME) {
        Serial.println("Nhả nút trước 5 giây, đèn không sáng");
        ledState = LOW;
        digitalWrite(BOARD_LED_PIN, ledState);  // tắt đèn trên mạch
      }
    }
    pressedTime = 0;  // reset thời gian nhấn
  }

  // save the the last state
  lastState = currentState;
}
