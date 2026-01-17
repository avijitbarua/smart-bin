// #include <WiFi.h>
// #include <WebServer.h>
// #include <HTTPClient.h>
// #include "esp_camera.h"
// #include "img_converters.h"
// #include <SPI.h>
// #include <MFRC522.h>

// // ── WiFi & Server Config ────────────────────────────────────────────────
// const char* ssid     = "Creative house";
// const char* password = "#123456#12";
// String PYTHON_SERVER_URL = "http://192.168.0.230:5000/api/detect";  // ← Using /api/detect for database storage

// // ── Smart Bin Configuration ─────────────────────────────────────────────
// const int DEFAULT_BIN_ID = 1;  // Change this for each physical bin (1, 2, 3, etc.)

// // ── Camera Pins (AI-Thinker ESP32-CAM) ──────────────────────────────────
// #define PWDN_GPIO_NUM     32
// #define RESET_GPIO_NUM    -1
// #define XCLK_GPIO_NUM      0
// #define SIOD_GPIO_NUM     26
// #define SIOC_GPIO_NUM     27
// #define Y9_GPIO_NUM       35
// #define Y8_GPIO_NUM       34
// #define Y7_GPIO_NUM       39
// #define Y6_GPIO_NUM       36
// #define Y5_GPIO_NUM       21
// #define Y4_GPIO_NUM       19
// #define Y3_GPIO_NUM       18
// #define Y2_GPIO_NUM        5
// #define VSYNC_GPIO_NUM    25
// #define HREF_GPIO_NUM     23
// #define PCLK_GPIO_NUM     22
// #define FLASH_GPIO_NUM     4

// // ── RFID Pins ───────────────────────────────────────────────────────────
// #define SS_PIN   15
// #define RST_PIN   2
// #define SCK_PIN  14
// #define MOSI_PIN 13
// #define MISO_PIN 12

// #define FRAME_SIZE    FRAMESIZE_VGA
// #define JPEG_QUALITY  10

// // ── Objects ─────────────────────────────────────────────────────────────
// WebServer server(80);
// MFRC522 mfrc522(SS_PIN, RST_PIN);

// // ─────────────────────────────────────────────────────────────────────────
// //                          CAMERA FUNCTIONS
// // ─────────────────────────────────────────────────────────────────────────

// bool initCamera() {
//     camera_config_t config;
//     config.ledc_channel = LEDC_CHANNEL_0;
//     config.ledc_timer = LEDC_TIMER_0;
//     config.pin_d0 = Y2_GPIO_NUM;
//     config.pin_d1 = Y3_GPIO_NUM;
//     config.pin_d2 = Y4_GPIO_NUM;
//     config.pin_d3 = Y5_GPIO_NUM;
//     config.pin_d4 = Y6_GPIO_NUM;
//     config.pin_d5 = Y7_GPIO_NUM;
//     config.pin_d6 = Y8_GPIO_NUM;
//     config.pin_d7 = Y9_GPIO_NUM;
//     config.pin_xclk = XCLK_GPIO_NUM;
//     config.pin_pclk = PCLK_GPIO_NUM;
//     config.pin_vsync = VSYNC_GPIO_NUM;
//     config.pin_href = HREF_GPIO_NUM;
//     config.pin_sscb_sda = SIOD_GPIO_NUM;
//     config.pin_sscb_scl = SIOC_GPIO_NUM;
//     config.pin_pwdn = PWDN_GPIO_NUM;
//     config.pin_reset = RESET_GPIO_NUM;
//     config.xclk_freq_hz = 20000000;
//     config.pixel_format = PIXFORMAT_JPEG;

//     if(psramFound()){
//         config.frame_size = FRAME_SIZE;
//         config.jpeg_quality = JPEG_QUALITY;
//         config.fb_count = 2;
//     } else {
//         config.frame_size = FRAMESIZE_QVGA;
//         config.jpeg_quality = 12;
//         config.fb_count = 1;
//     }

//     esp_err_t err = esp_camera_init(&config);
//     if (err != ESP_OK) {
//         Serial.printf("Camera init failed with error 0x%x\n", err);
//         return false;
//     }
//     return true;
// }

// String sendToPython(uint8_t* jpeg_buf, size_t jpeg_len, const String& rfid_uid, int bin_id) {
//     HTTPClient http;
//     if (!http.begin(PYTHON_SERVER_URL)) {
//         Serial.println("HTTP connection failed");
//         return "{\"error\":\"Connection failed\"}";
//     }

//     String boundary = "----ESP32Boundary" + String(millis());

//     // ── Prepare multipart/form-data ────────────────────────────────
//     String head = 
//         "--" + boundary + "\r\n"
//         "Content-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\n"
//         "Content-Type: image/jpeg\r\n\r\n";

//     String imageEnd = "\r\n";  // CRITICAL: Need this after binary image data

//     String rfid_part = 
//         "--" + boundary + "\r\n"
//         "Content-Disposition: form-data; name=\"rfid_uid\"\r\n\r\n" +
//         rfid_uid + "\r\n";

//     String bin_part = 
//         "--" + boundary + "\r\n"
//         "Content-Disposition: form-data; name=\"bin_id\"\r\n\r\n" +
//         String(bin_id) + "\r\n";

//     String tail = "--" + boundary + "--\r\n";

//     // Calculate total length
//     size_t totalLen = 
//         head.length() +
//         jpeg_len +
//         imageEnd.length() +
//         rfid_part.length() +
//         bin_part.length() +
//         tail.length();

//     http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

//     uint8_t* payload = (uint8_t*)malloc(totalLen);
//     if (!payload) {
//         Serial.println("Malloc failed for payload");
//         http.end();
//         return "{\"error\":\"Malloc failed\"}";
//     }

//     // Build payload in correct order
//     size_t offset = 0;

//     // 1. Image header
//     memcpy(payload + offset, head.c_str(), head.length());
//     offset += head.length();

//     // 2. Image binary data
//     memcpy(payload + offset, jpeg_buf, jpeg_len);
//     offset += jpeg_len;

//     // 3. Line break after image
//     memcpy(payload + offset, imageEnd.c_str(), imageEnd.length());
//     offset += imageEnd.length();

//     // 4. RFID part
//     memcpy(payload + offset, rfid_part.c_str(), rfid_part.length());
//     offset += rfid_part.length();

//     // 5. Bin ID part
//     memcpy(payload + offset, bin_part.c_str(), bin_part.length());
//     offset += bin_part.length();

//     // 6. Closing boundary
//     memcpy(payload + offset, tail.c_str(), tail.length());

//     Serial.println("────── Sending Data ──────");
//     Serial.println("Payload size: " + String(totalLen));
//     Serial.println("RFID_UID: " + rfid_uid);
//     Serial.println("BIN_ID: " + String(bin_id));
//     Serial.println("──────────────────────────");

//     int httpCode = http.POST(payload, totalLen);
//     free(payload);

//     String response;
//     if (httpCode > 0) {
//         Serial.printf("HTTP Response code: %d\n", httpCode);
//         response = http.getString();
//     } else {
//         Serial.printf("HTTP POST failed, error: %s\n", http.errorToString(httpCode).c_str());
//         response = "{\"error\":\"HTTP Error " + String(httpCode) + "\"}";
//     }

//     http.end();
//     return response;
// }

// // ─────────────────────────────────────────────────────────────────────────
// //                          RFID + PHOTO TRIGGER
// // ─────────────────────────────────────────────────────────────────────────

// void doCaptureAndDetect() {
//     Serial.println("RFID detected → Taking photo...");

//     // Get RFID UID as nice formatted string
//     String rfid_uid = "";
//     for (byte i = 0; i < mfrc522.uid.size; i++) {
//         if (mfrc522.uid.uidByte[i] < 0x10) rfid_uid += "0";
//         rfid_uid += String(mfrc522.uid.uidByte[i], HEX);
//         if (i < mfrc522.uid.size - 1) rfid_uid += ":";
//     }
//     rfid_uid.toUpperCase();

//     Serial.print("Sending RFID: ");
//     Serial.println(rfid_uid);
//     Serial.print("Using Bin ID: ");
//     Serial.println(DEFAULT_BIN_ID);

//     digitalWrite(FLASH_GPIO_NUM, HIGH);
//     delay(120);

//     camera_fb_t *fb = esp_camera_fb_get();
//     digitalWrite(FLASH_GPIO_NUM, LOW);

//     if (!fb) {
//         Serial.println("Camera capture failed!");
//         return;
//     }

//     Serial.println("Sending image + RFID + Bin ID to AI server...");
//     String result = sendToPython(fb->buf, fb->len, rfid_uid, DEFAULT_BIN_ID);

//     Serial.println("────── Result from Python ──────");
//     Serial.println(result);
//     Serial.println("────────────────────────────────");

//     esp_camera_fb_return(fb);
// }

// // ─────────────────────────────────────────────────────────────────────────
// //                             SETUP & LOOP
// // ─────────────────────────────────────────────────────────────────────────

// void setup() {
//     Serial.begin(115200);
//     delay(300);

//     pinMode(FLASH_GPIO_NUM, OUTPUT);
//     digitalWrite(FLASH_GPIO_NUM, LOW);

//     // SPI for RFID
//     SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
//     mfrc522.PCD_Init();

//     Serial.print("RFID Reader version: 0x");
//     Serial.println(mfrc522.PCD_ReadRegister(mfrc522.VersionReg), HEX);

//     // WiFi
//     WiFi.begin(ssid, password);
//     Serial.print("Connecting WiFi");
//     unsigned long startAttemptTime = millis();
//     while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
//         delay(400);
//         Serial.print(".");
//     }
//     if (WiFi.status() != WL_CONNECTED) {
//         Serial.println("\nWiFi connection failed! Halting...");
//         while(1) delay(1000);
//     }
//     Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

//     // Camera
//     if (!initCamera()) {
//         Serial.println("Camera init failed! → halting...");
//         while(1) delay(1000);
//     }

//     Serial.println("════════════════════════════════");
//     Serial.println("  BARAQA_BIN Smart Waste System");
//     Serial.println("════════════════════════════════");
//     Serial.println("Server: " + PYTHON_SERVER_URL);
//     Serial.println("Bin ID: " + String(DEFAULT_BIN_ID));
//     Serial.println("Waiting for RFID card...");
//     Serial.println("════════════════════════════════");
// }

// void loop() {
//     if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
//         Serial.print("Card UID: ");
//         for (byte i = 0; i < mfrc522.uid.size; i++) {
//             Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
//             Serial.print(mfrc522.uid.uidByte[i], HEX);
//         }
//         Serial.println();

//         doCaptureAndDetect();

//         mfrc522.PICC_HaltA();
//         delay(800);
//     }

//     delay(50);
// }
