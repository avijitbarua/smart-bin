from datetime import datetime
import os
import cv2
import numpy as np
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ── Important: Bangladesh timezone ───────────────────────────────
from zoneinfo import ZoneInfo

BD_TZ = ZoneInfo("Asia/Dhaka")   # UTC+6, no DST

# ── Database Helper ──────────────────────────────────────────────
from db_helper import (
    DatabaseHelper, get_user_by_rfid, get_user_by_credentials,
    get_user_stats, create_user, update_user_stats,
    insert_waste_log, get_user_history, get_leaderboard,
    get_all_bins, get_bin_by_id, update_bin_fill_level,
    reset_bin_fill_level, update_bin_status
)

# ================================================================

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# --- DATABASE CONFIGURATION ---
DB_CONFIG = {
    "user": "root",
    "password": "Avijit@12#12",
    "host": "localhost",
    "database": "smart_dustbin_pro",
}

db = DatabaseHelper(DB_CONFIG)

# --- GAMIFICATION SETTINGS ---
POINTS_PER_ITEM = 10
CARBON_PER_ITEM_G = 50  # 50 grams per item

# --- FREEIMAGE CONFIGURATION ---
FREEIMAGE_API_KEY = "6d207e02198a847aa98d0a2a901485a5"
FREEIMAGE_URL = "https://freeimage.host/api/1/upload"

current_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(current_dir, 'model', 'efficientdet_lite0.tflite')

base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.ObjectDetectorOptions(
    base_options=base_options,
    score_threshold=0.5
)
detector = vision.ObjectDetector.create_from_options(options)


def upload_to_freeimage(image_bytes):
    """Uploads binary image data to freeimage.host and returns the URL."""
    try:
        payload = {
            'key': FREEIMAGE_API_KEY,
            'action': 'upload',
            'format': 'json'
        }
        files = {'source': ('capture.jpg', image_bytes, 'image/jpeg')}
        
        response = requests.post(FREEIMAGE_URL, data=payload, files=files, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status_code') == 200:
                return data['image']['url']
        print("Upload failed:", response.text)
    except Exception as e:
        print(f"Upload exception: {e}")
    return None


@app.route('/api/detect', methods=['POST'])
def detect_objects():
    """
    Hardware endpoint: Process waste disposal with object detection.
    Input: image (file), rfid_uid (string), bin_id (int)
    """
    print("=" * 60)
    print("📸 /api/detect request received")
    print(f"Files in request: {list(request.files.keys())}")
    print(f"Form data: {dict(request.form)}")
    print("=" * 60)
    
    if 'image' not in request.files:
        print("❌ ERROR: No image in request.files")
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    rfid_uid = request.form.get('rfid_uid', '').strip()
    bin_id = request.form.get('bin_id', '').strip()

    print(f"✓ Image file: {file.filename if file.filename else 'no filename'}")
    print(f"✓ RFID UID: {rfid_uid}")
    print(f"✓ Bin ID: {bin_id}")

    if not file or not rfid_uid or not bin_id:
        print(f"❌ ERROR: Missing parameters - file:{bool(file)}, rfid:{bool(rfid_uid)}, bin:{bool(bin_id)}")
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        bin_id = int(bin_id)
        print(f"✓ Bin ID converted to int: {bin_id}")
    except ValueError as e:
        print(f"❌ ERROR: Invalid bin_id - {e}")
        return jsonify({"error": "Invalid bin_id"}), 400

    try:
        # ── Step 1: Validate User ──────────────────────────────────
        print(f"🔍 Looking up user with RFID: {rfid_uid}")
        user = get_user_by_rfid(db, rfid_uid)
        if not user:
            print(f"❌ ERROR: User not found with RFID: {rfid_uid}")
            return jsonify({
                "status": "error",
                "message": "Unknown User. Please register your RFID.",
                "voice_command": "Access denied. Unknown user."
            }), 403

        print(f"✓ User found: {user['full_name']} (ID: {user['user_id']})")

        # ── Step 2: Validate Bin ───────────────────────────────────
        print(f"🔍 Looking up bin with ID: {bin_id}")
        bin_info = get_bin_by_id(db, bin_id)
        if not bin_info:
            print(f"❌ ERROR: Bin not found with ID: {bin_id}")
            return jsonify({"error": "Invalid bin_id"}), 400

        print(f"✓ Bin found: {bin_info['bin_name']}")

        # ── Step 3: Image Processing ───────────────────────────────
        print("📷 Reading image bytes...")
        file_bytes = file.read()
        print(f"✓ Image size: {len(file_bytes)} bytes")
        
        nparr = np.frombuffer(file_bytes, np.uint8)
        image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image_bgr is None:
            print("❌ ERROR: Failed to decode image")
            return jsonify({"error": "Invalid image format"}), 400

        print(f"✓ Image decoded: {image_bgr.shape}")
        
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

        # Run detection
        print("🤖 Running object detection...")
        detection_result = detector.detect(mp_image)
        detection_result = detector.detect(mp_image)

        # Prepare detections list
        detections_list = []
        for detection in detection_result.detections:
            category = detection.categories[0]
            bbox = detection.bounding_box
            detections_list.append({
                "label": category.category_name,
                "confidence": round(float(category.score), 3),
                "box": [bbox.origin_x, bbox.origin_y, bbox.width, bbox.height]
            })

        detected_count = len(detections_list)

        if detected_count == 0:
            return jsonify({
                "status": "no_detection",
                "message": "No waste items detected",
                "voice_command": "No items detected. Please try again."
            }), 200

        # ── Step 4: Upload Image ───────────────────────────────────
        now_bd = datetime.now(BD_TZ)
        print(f"[{now_bd.strftime('%Y-%m-%d %H:%M:%S %Z')}] "
              f"Objects detected! Uploading... ({detected_count} found)")
        
        hosted_url = upload_to_freeimage(file_bytes)
        if not hosted_url:
            hosted_url = "upload_failed"

        # ── Step 5: Gamification Calculations ──────────────────────
        points_earned = detected_count * POINTS_PER_ITEM
        carbon_saved = detected_count * CARBON_PER_ITEM_G

        # Determine primary waste type (most common label)
        waste_type = "Mixed"
        if detections_list:
            labels = [d['label'] for d in detections_list]
            waste_type = max(set(labels), key=labels.count)

        # ── Step 6: Database Transaction ───────────────────────────
        try:
            # Insert waste log
            insert_waste_log(db, user['user_id'], bin_id, waste_type, 
                           detected_count, points_earned, hosted_url)
            
            # Update user stats
            update_user_stats(db, user['user_id'], points_earned, 
                            detected_count, carbon_saved)
            
            # Update bin fill level (increment by detected items)
            update_bin_fill_level(db, bin_id, detected_count)
            
            # Check if bin is full (assume 100% threshold)
            updated_bin = get_bin_by_id(db, bin_id)
            if updated_bin and updated_bin['current_fill_level'] >= updated_bin['max_capacity']:
                update_bin_status(db, bin_id, 'full')

        except Exception as db_error:
            print(f"Database error: {db_error}")
            return jsonify({
                "status": "error",
                "message": "Database error occurred"
            }), 500

        # ── Step 7: Get Updated User Stats ─────────────────────────
        updated_user = get_user_stats(db, user['user_id'])
        
        # ── Step 8: Prepare Response ───────────────────────────────
        voice_message = (
            f"Thank you {user['full_name'].split()[0]}, "
            f"you earned {points_earned} points. "
            f"Your total is now {updated_user['current_points']} points."
        )

        response_data = {
            "status": "success",
            "detections": detections_list,
            "count": detected_count,
            "waste_type": waste_type,
            "points_earned": points_earned,
            "carbon_saved_g": carbon_saved,
            "user": {
                "name": user['full_name'],
                "total_points": updated_user['current_points'],
                "total_recycled": updated_user['total_recycled_items'],
                "total_carbon_saved_g": updated_user['carbon_saved_g']
            },
            "image_url": hosted_url,
            "voice_command": voice_message,
            "timestamp": now_bd.isoformat(),
            "timestamp_human": now_bd.strftime("%Y-%m-%d %H:%M:%S %Z")
        }

        return jsonify(response_data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ═════════════════════════════════════════════════════════════════
# FRONTEND API ENDPOINTS
# ═════════════════════════════════════════════════════════════════

@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate user with username and password."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    try:
        user = get_user_by_credentials(db, username, password)
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        return jsonify({
            "status": "success",
            "user": {
                "user_id": user['user_id'],
                "full_name": user['full_name'],
                "username": user['username'],
                "role": user['role'],
                "current_points": user['current_points']
            }
        })
    
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": "Login failed"}), 500


@app.route('/api/register', methods=['POST'])
def register():
    """Create a new student account."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    full_name = data.get('full_name', '').strip()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    rfid_uid = data.get('rfid_uid', '').strip()
    
    if not all([full_name, username, password, rfid_uid]):
        return jsonify({"error": "All fields required"}), 400
    
    try:
        # Check if username or RFID already exists
        existing = get_user_by_credentials(db, username, "")
        if existing:
            return jsonify({"error": "Username already exists"}), 400
        
        existing_rfid = get_user_by_rfid(db, rfid_uid)
        if existing_rfid:
            return jsonify({"error": "RFID already registered"}), 400
        
        # Create user
        user_id = create_user(db, full_name, username, password, rfid_uid)
        
        return jsonify({
            "status": "success",
            "message": "Account created successfully",
            "user_id": user_id
        }), 201
    
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500


@app.route('/api/user/<int:user_id>/stats', methods=['GET'])
def user_stats(user_id):
    """Get user statistics."""
    try:
        user = get_user_stats(db, user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "status": "success",
            "user": {
                "user_id": user['user_id'],
                "full_name": user['full_name'],
                "username": user['username'],
                "current_points": user['current_points'],
                "total_recycled_items": user['total_recycled_items'],
                "carbon_saved_g": user['carbon_saved_g'],
                "role": user['role']
            }
        })
    
    except Exception as e:
        print(f"Stats error: {e}")
        return jsonify({"error": "Failed to fetch stats"}), 500


@app.route('/api/user/<int:user_id>/history', methods=['GET'])
def user_history(user_id):
    """Get user's recent waste disposal history."""
    try:
        limit = request.args.get('limit', 10, type=int)
        history = get_user_history(db, user_id, limit)
        
        return jsonify({
            "status": "success",
            "history": history
        })
    
    except Exception as e:
        print(f"History error: {e}")
        return jsonify({"error": "Failed to fetch history"}), 500


@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    """Get top users ranked by points."""
    try:
        limit = request.args.get('limit', 10, type=int)
        leaders = get_leaderboard(db, limit)
        
        return jsonify({
            "status": "success",
            "leaderboard": leaders
        })
    
    except Exception as e:
        print(f"Leaderboard error: {e}")
        return jsonify({"error": "Failed to fetch leaderboard"}), 500


@app.route('/api/admin/bins', methods=['GET'])
def admin_bins():
    """Get all smart bins status (Admin)."""
    try:
        bins = get_all_bins(db)
        
        return jsonify({
            "status": "success",
            "bins": bins
        })
    
    except Exception as e:
        print(f"Bins fetch error: {e}")
        return jsonify({"error": "Failed to fetch bins"}), 500


@app.route('/api/admin/reset-bin', methods=['POST'])
def admin_reset_bin():
    """Reset bin fill level after cleaning (Admin)."""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    bin_id = data.get('bin_id')
    
    if not bin_id:
        return jsonify({"error": "bin_id required"}), 400
    
    try:
        bin_id = int(bin_id)
        
        # Check if bin exists
        bin_info = get_bin_by_id(db, bin_id)
        if not bin_info:
            return jsonify({"error": "Bin not found"}), 404
        
        # Reset bin
        reset_bin_fill_level(db, bin_id)
        
        return jsonify({
            "status": "success",
            "message": f"Bin {bin_id} has been reset"
        })
    
    except Exception as e:
        print(f"Reset bin error: {e}")
        return jsonify({"error": "Failed to reset bin"}), 500


# ═════════════════════════════════════════════════════════════════
# LEGACY ENDPOINT (Backward Compatibility)
# ═════════════════════════════════════════════════════════════════

@app.route('/detect', methods=['POST'])
def detect_objects_legacy():
    """
    Legacy endpoint for basic detection without database integration.
    Kept for backward compatibility.
    Expects: image (file), rfid_uid (string)
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    rfid_uid = request.form.get('rfid_uid', '').strip()

    print(f"rfid_uid: {rfid_uid}")

    if not file:
        return jsonify({"error": "Empty image file"}), 400

    try:
        file_bytes = file.read()

        # ── Image processing ───────────────────────────────────────
        nparr = np.frombuffer(file_bytes, np.uint8)
        image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image_bgr is None:
            return jsonify({"error": "Invalid image format"}), 400

        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

        # Run detection
        detection_result = detector.detect(mp_image)

        # Prepare detections list
        detections_list = []
        for detection in detection_result.detections:
            category = detection.categories[0]
            bbox = detection.bounding_box
            detections_list.append({
                "label": category.category_name,
                "confidence": round(float(category.score), 3),
                "box": [bbox.origin_x, bbox.origin_y, bbox.width, bbox.height]
            })

        # ── Upload only if objects were detected ──────────────────
        hosted_url = None
        if len(detections_list) > 0:
            print(f"[{datetime.now(BD_TZ).strftime('%Y-%m-%d %H:%M:%S %Z')}] "
                  f"Object detected! Uploading... ({len(detections_list)} found)")
            hosted_url = upload_to_freeimage(file_bytes)
            print(f"Image hosted at: {hosted_url}")

        # ── Bangladesh time for response ───────────────────────────
        now_bd = datetime.now(BD_TZ)

        # Prepare response
        response_data = {
            "status": "ok",
            "detections": detections_list,
            "count": len(detections_list),
            "rfid_uid": rfid_uid,
            "image_url": hosted_url,
            "timestamp": now_bd.isoformat(),
            "timestamp_human": now_bd.strftime("%Y-%m-%d %H:%M:%S %Z")
        }

        return jsonify(response_data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("BARAQA_BIN Smart Waste Management API Server")
    print("=" * 60)
    print(f"Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}")
    print(f"Timezone: {BD_TZ}")
    print(f"Model: {MODEL_PATH}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)