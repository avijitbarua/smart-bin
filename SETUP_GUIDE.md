# Full Stack Setup Guide - BARAQA_BIN

Complete guide to run both frontend and backend together.

## 🎯 Prerequisites

- Python 3.9+
- Node.js 18+
- MySQL 8.0+
- Git

## 📦 Step 1: Database Setup

1. Start MySQL server

2. Create database and tables:
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

-- Insert sample data
INSERT INTO users (full_name, username, password, rfid_uid, role, current_points, total_recycled_items, carbon_saved_g)
VALUES 
    ('Admin User', 'admin', 'admin123', 'RFID-00001', 'admin', 0, 0, 0),
    ('Aaliyah Rahman', 'aaliyah.r', 'password123', 'RFID-88421', 'user', 1280, 342, 18400),
    ('Kai Abdullah', 'kai.a', 'password123', 'RFID-77411', 'user', 1120, 297, 16250),
    ('Maya Aziz', 'maya.az', 'password123', 'RFID-66312', 'user', 980, 255, 14120);

INSERT INTO smart_bins (bin_name, max_capacity, current_fill_level, status)
VALUES 
    ('North Gate Bin', 100, 42, 'active'),
    ('Cafeteria Bin', 150, 76, 'active'),
    ('Library Bin', 100, 64, 'maintenance'),
    ('Sports Complex Bin', 140, 86, 'full');

-- Insert sample logs
INSERT INTO waste_logs (user_id, bin_id, waste_type, waste_count, points_earned, image_path, timestamp)
VALUES 
    (2, 1, 'Plastic', 6, 60, 'https://example.com/image1.jpg', '2026-01-18 09:30:00'),
    (2, 1, 'Paper', 4, 40, 'https://example.com/image2.jpg', '2026-01-18 08:15:00'),
    (2, 2, 'Metal', 3, 45, 'https://example.com/image3.jpg', '2026-01-17 19:20:00'),
    (3, 1, 'Glass', 2, 24, 'https://example.com/image4.jpg', '2026-01-17 12:40:00'),
    (3, 3, 'Plastic', 5, 50, 'https://example.com/image5.jpg', '2026-01-17 08:55:00'),
    (4, 2, 'Paper', 7, 70, 'https://example.com/image6.jpg', '2026-01-16 17:32:00');
```

## 🔧 Step 2: Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Update database credentials in `app.py` if needed:
```python
DB_CONFIG = {
    "user": "root",
    "password": "YOUR_PASSWORD_HERE",
    "host": "localhost",
    "database": "smart_dustbin_pro",
}
```

5. Start Flask server:
```bash
python app.py
```

You should see:
```
============================================================
BARAQA_BIN Smart Waste Management API Server
============================================================
Database: smart_dustbin_pro@localhost
Timezone: Asia/Dhaka
Model: E:\project\flask_for_object_detection\backend\model\efficientdet_lite0.tflite
============================================================
 * Running on http://0.0.0.0:5000
```

## 🎨 Step 3: Frontend Setup

1. Open new terminal and navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Verify `.env` file exists with:
```env
VITE_API_BASE_URL=http://localhost:5000
```

4. Start development server:
```bash
npm run dev
```

You should see:
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## ✅ Step 4: Test the Connection

1. Open browser: `http://localhost:5173`

2. Login with:
   - Username: `admin`
   - Password: `admin123`

3. You should see:
   - Dashboard with real data from database
   - Leaderboard showing top users
   - Bin status showing live fill levels
   - History showing waste disposal logs

## 🧪 Testing Endpoints

Test backend directly with curl or Postman:

```bash
# Test login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test leaderboard
curl http://localhost:5000/api/leaderboard

# Test bins
curl http://localhost:5000/api/admin/bins

# Test user stats
curl http://localhost:5000/api/user/2/stats
```

## 🔍 Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Find process
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F
```

**Database connection error:**
- Check MySQL is running
- Verify credentials in `app.py`
- Ensure database exists: `SHOW DATABASES;`

**Module not found:**
```bash
pip install -r requirements.txt
```

### Frontend Issues

**CORS error in browser console:**
- Ensure backend has `flask-cors` installed
- Check backend is running on port 5000
- Verify `.env` has correct API URL

**Dependencies error:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build fails:**
```bash
npm run build
# Check for TypeScript errors
```

### Connection Issues

**Frontend can't reach backend:**
1. Check backend is running: `http://localhost:5000/api/leaderboard`
2. Check CORS is enabled in Flask
3. Check `.env` file in frontend
4. Open browser DevTools → Network tab to see failed requests

**Data not loading:**
1. Open browser console (F12)
2. Look for red errors
3. Check Network tab for failed API calls
4. Verify database has sample data

## 🚀 Production Deployment

### Backend
```bash
# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend
```bash
# Build for production
npm run build

# Serve with nginx or deploy to:
# - Vercel
# - Netlify
# - Cloudflare Pages
```

## 📊 Architecture Overview

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────┐
│   React Frontend│ ←─────────────────→ │  Flask Backend   │
│  (Port 5173)    │                     │  (Port 5000)     │
└─────────────────┘                     └──────────────────┘
                                                  │
                                                  ↓
                                        ┌──────────────────┐
                                        │   MySQL Database │
                                        │  smart_dustbin   │
                                        └──────────────────┘
```

## 🎯 Next Steps

1. ✅ Test user registration: `/api/register`
2. ✅ Test hardware detection: `/api/detect`
3. ✅ Add more sample data to database
4. ✅ Configure ESP32-CAM to send images
5. ✅ Deploy to production server
6. ✅ Set up SSL certificates
7. ✅ Configure backup strategy

## 📞 Support

If you encounter issues:
1. Check both terminal outputs for errors
2. Review browser console (F12)
3. Test backend endpoints directly with curl
4. Verify database contains data
5. Check network tab in browser DevTools
