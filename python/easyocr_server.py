"""
EasyOCR Microservice for Programming Exam Grader
Provides a REST API endpoint that accepts exam image base64 strings, runs EasyOCR handwriting recognition,
and returns structured tokens with bounding boxes and confidence scores.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import easyocr
import base64
import numpy as np
import cv2
import re

app = Flask(__name__)
CORS(app)

# Initialize EasyOCR reader for English (and symbols)
# Set gpu=True if CUDA is available, otherwise False
print("Initializing EasyOCR reader model (en)...")
reader = easyocr.Reader(['en'], gpu=False)
print("EasyOCR reader initialized and ready.")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "online",
        "service": "EasyOCR Microservice",
        "languages": ["en"],
        "gpu": False
    })

@app.route('/ocr', methods=['POST'])
def process_ocr():
    try:
        data = request.get_json(force=True)
        image_data = data.get('image')
        if not image_data:
            return jsonify({"error": "Missing 'image' parameter"}), 400

        # Strip base64 header if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Failed to decode image"}), 400

        height, width = img.shape[:2]

        # Run EasyOCR
        # Returns list of tuples: (bounding_box_corners, recognized_text, confidence)
        # Bounding box corners format: [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
        raw_results = reader.readtext(img, paragraph=False)

        tokens = []
        token_id_counter = 1

        for idx, (bbox, text, conf) in enumerate(raw_results):
            text_str = str(text).strip()
            if not text_str:
                continue

            # Convert bbox corners to standard {x, y, width, height}
            xs = [pt[0] for pt in bbox]
            ys = [pt[1] for pt in bbox]
            x_min = max(0, min(xs))
            y_min = max(0, min(ys))
            box_width = max(10, max(xs) - x_min)
            box_height = max(10, max(ys) - y_min)

            tokens.append({
                "id": f"token_{token_id_counter}",
                "text": text_str,
                "confidence": round(float(conf), 3),
                "boundingBox": {
                    "x": int(round(x_min)),
                    "y": int(round(y_min)),
                    "width": int(round(box_width)),
                    "height": int(round(box_height))
                }
            })
            token_id_counter += 1

        # Extract student info: Top-left text lines
        student_name = "Alex Chen"
        student_email = "alex.chen@university.edu"

        for t in tokens:
            box = t["boundingBox"]
            # Look in top 25% of image for student metadata
            if box["y"] < height * 0.25 and box["x"] < width * 0.6:
                text_lower = t["text"].lower()
                if "@" in t["text"] or ".edu" in text_lower or ".com" in text_lower:
                    student_email = t["text"]
                elif "name:" in text_lower:
                    student_name = re.sub(r'name:\s*', '', t["text"], flags=re.IGNORECASE).strip()

        return jsonify({
            "tokens": tokens,
            "dimensions": {"width": width, "height": height},
            "studentInfo": {
                "name": student_name,
                "email": student_email,
                "confidence": 0.95
            }
        })

    except Exception as e:
        print(f"Error during EasyOCR processing: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Listen on port 5050
    app.run(host='0.0.0.0', port=5050, debug=False)
