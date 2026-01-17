# BARAQA_BIN Backend API

## Database Setup

Create the MySQL database and tables:

```sql
CREATE DATABASE smart_dustbin_pro;
USE smart_dustbin_pro;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rfid_uid VARCHAR(50) UNIQUE NOT NULL,
    current_points INT DEFAULT 0,
    total_recycled_items INT DEFAULT 0,
    carbon_saved_g FLOAT DEFAULT 0,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Smart bins table
CREATE TABLE smart_bins (
    bin_id INT AUTO_INCREMENT PRIMARY KEY,
    bin_name VARCHAR(100) NOT NULL,
    max_capacity INT NOT NULL,
    current_fill_level INT DEFAULT 0,
    status ENUM('active', 'full', 'maintenance') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waste logs table
CREATE TABLE waste_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bin_id INT NOT NULL,
    waste_type VARCHAR(50) NOT NULL,
    waste_count INT NOT NULL,
    points_earned INT NOT NULL,
    image_path VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (bin_id) REFERENCES smart_bins(bin_id)
);

-- Insert sample admin user
INSERT INTO users (full_name, username, password, rfid_uid, role)
VALUES ('Admin User', 'admin', 'admin123', 'RFID-00001', 'admin');

-- Insert sample bins
INSERT INTO smart_bins (bin_name, max_capacity, current_fill_level, status)
VALUES 
    ('North Gate Bin', 100, 0, 'active'),
    ('Cafeteria Bin', 150, 0, 'active'),
    ('Library Bin', 100, 0, 'active');
```

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Configure database in `app.py`:
```python
DB_CONFIG = {
    "user": "root",
    "password": "your_password",
    "host": "localhost",
    "database": "smart_dustbin_pro",
}
```

## Running the Server

```bash
python app.py
```

Server will start on `http://0.0.0.0:5000`

## API Endpoints

### Hardware Endpoints

**POST /api/detect**
- Process waste disposal with object detection
- Parameters: `image` (file), `rfid` (string), `bin_id` (int)
- Returns: Detection results, points earned, voice command

### Authentication

**POST /api/login**
- Body: `{"username": "...", "password": "..."}`
- Returns: User info and authentication status

**POST /api/register**
- Body: `{"full_name": "...", "username": "...", "password": "...", "rfid_uid": "..."}`
- Returns: Registration status

### User Endpoints

**GET /api/user/:user_id/stats**
- Returns: User statistics (points, items, carbon)

**GET /api/user/:user_id/history**
- Query params: `limit` (default: 10)
- Returns: Recent disposal history

**GET /api/leaderboard**
- Query params: `limit` (default: 10)
- Returns: Top users by points

### Admin Endpoints

**GET /api/admin/bins**
- Returns: All smart bins with status

**POST /api/admin/reset-bin**
- Body: `{"bin_id": 1}`
- Returns: Reset confirmation

### Legacy Endpoint

**POST /detect**
- Basic detection without database integration
- Parameters: `image` (file), `rfid` (string)

## Configuration

- **Points per item:** 10 points
- **Carbon per item:** 50 grams
- **Timezone:** Asia/Dhaka (UTC+6)
- **Image hosting:** FreeImage.host API
- **Object detection:** MediaPipe EfficientDet Lite0
