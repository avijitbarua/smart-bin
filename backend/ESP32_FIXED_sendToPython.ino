String sendToPython(uint8_t* jpeg_buf, size_t jpeg_len, const String& rfid_uid) {
    HTTPClient http;
    if (!http.begin(PYTHON_SERVER_URL)) {
        Serial.println("HTTP connection failed");
        return "{\"error\":\"Connection failed\"}";
    }

    String boundary = "----ESP32Boundary" + String(millis());

    // ── Prepare multipart/form-data ────────────────────────────────
    String head = 
        "--" + boundary + "\r\n"
        "Content-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\n"
        "Content-Type: image/jpeg\r\n\r\n";

    String imageEnd = "\r\n";  // ← CRITICAL: Need this after binary image data

    String rfid_part = 
        "--" + boundary + "\r\n"
        "Content-Disposition: form-data; name=\"rfid_uid\"\r\n\r\n" +
        rfid_uid + "\r\n";

    String tail = "--" + boundary + "--\r\n";

    // Calculate total length
    size_t totalLen = 
        head.length() +
        jpeg_len +
        imageEnd.length() +  // ← Add this line
        rfid_part.length() +
        tail.length();

    http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

    uint8_t* payload = (uint8_t*)malloc(totalLen);
    if (!payload) {
        Serial.println("Malloc failed for payload");
        http.end();
        return "{\"error\":\"Malloc failed\"}";
    }

    // Build payload in correct order
    size_t offset = 0;

    // 1. Image header
    memcpy(payload + offset, head.c_str(), head.length());
    offset += head.length();

    // 2. Image binary data
    memcpy(payload + offset, jpeg_buf, jpeg_len);
    offset += jpeg_len;

    // 3. Line break after image (CRITICAL FIX)
    memcpy(payload + offset, imageEnd.c_str(), imageEnd.length());
    offset += imageEnd.length();

    // 4. RFID part
    memcpy(payload + offset, rfid_part.c_str(), rfid_part.length());
    offset += rfid_part.length();

    // 5. Closing boundary
    memcpy(payload + offset, tail.c_str(), tail.length());

    Serial.println("Sending POST with payload size: " + String(totalLen));
    Serial.println("RFID_UID being sent: " + rfid_uid);

    int httpCode = http.POST(payload, totalLen);
    free(payload);

    String response;
    if (httpCode > 0) {
        Serial.printf("HTTP Response code: %d\n", httpCode);
        response = http.getString();
    } else {
        Serial.printf("HTTP POST failed, error: %s\n", http.errorToString(httpCode).c_str());
        response = "{\"error\":\"HTTP Error " + String(httpCode) + "\"}";
    }

    http.end();
    return response;
}
