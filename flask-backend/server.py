from flask import Flask, request, jsonify
from deepface import DeepFace
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import numpy as np
# from deep_translator import GoogleTranslator
from translate import Translator

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


UPLOAD_FOLDER = 'uploads-flask'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, mode=0o777)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def convert_np_to_normal(dictionary):
    emotion_data = dictionary['emotion']
    dominant_emotion = dictionary['dominant_emotion']
    for key, value in emotion_data.items():
        # print(key, value)
        if isinstance(value, (np.float64, np.float32)):
            emotion_data[key] = float(value)
        else:
            emotion_data[key] = value
    if isinstance(dominant_emotion, (np.float64, np.float32)):
        dominant_emotion = float(dominant_emotion)
    emotion_data['dominant_emotion'] = dominant_emotion
    return emotion_data

@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/analyze-emotions', methods=['POST'])
def analyze_emotions():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Save the uploaded file locally for now
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        print(f"File saved to: {filepath}")
        
        # Analyze the image
        try:
            results = DeepFace.analyze(
                img_path=filepath,
                actions=['emotion'],
                enforce_detection=False
            )
            print("Analysis completed successfully")
        except Exception as analysis_error:
            print(f"DeepFace analysis error: {str(analysis_error)}")
            raise analysis_error
        
        # Clean up - remove uploaded file after analysis
        os.remove(filepath)
        
        print("Returning results:", results) 
        return jsonify(convert_np_to_normal(results[0]))  # NOTE: changed from results to results[0]
    
    except Exception as e:
        import traceback
        print(f"Error in /analyze: {str(e)}")
        print(traceback.format_exc())  # Print full traceback
        # Clean up in case of error
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500

@app.route('/verify-face', methods=['POST'])
def verify_face():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Save the uploaded file locally for now
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        print(f"File saved to: {filepath}")
        
        # Analyze the image
        try:
            results = DeepFace.verify(
                img1_path=filepath,
                img2_path="",
                model_name="Facenet",
                enforce_detection=False
            )
            print("Analysis completed successfully")
        except Exception as analysis_error:
            print(f"DeepFace analysis error: {str(analysis_error)}")
            raise analysis_error
        
        # Clean up - remove uploaded file after analysis
        os.remove(filepath)
        
        print("Returning results:", results) 
        return jsonify(results)
    
    except Exception as e:
        import traceback
        print(f"Error in /analyze: {str(e)}")
        print(traceback.format_exc())  # Print full traceback
        # Clean up in case of error
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    try:
        data = request.json
        text = data['text']
        print(f"Translating text: {text}")
        # translator = GoogleTranslator(source='zh-CN', target='id')
        translator = Translator(to_lang='id', from_lang='zh')
        res = {}
        for c in text:
            try:
                res[c] = translator.translate(c)
            except Exception as translation_error:
                res[c] = ""
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)