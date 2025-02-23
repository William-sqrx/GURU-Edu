from flask import Flask, request, jsonify
from deepface import DeepFace
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import numpy as np
from deep_translator import GoogleTranslator
import jieba

import whisperx
import json
import re
from openai import OpenAI
# from translate import Translator

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


UPLOAD_FOLDER = 'uploads-flask'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, mode=0o777)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER



def combine_emotion_data(emotion_data):
    # Define ranking factors based on provided calculations
    engagement = (emotion_data['neutral'] * 0.2 + emotion_data['happy'] * 0.8) / 2
    confusion = (emotion_data['fear'] + emotion_data['surprise']) / 2
    frustration = (emotion_data['angry'] + emotion_data['sad']) / 2
    curiosity = (emotion_data['surprise'] * 0.8 + emotion_data['neutral'] * 0.05) / 2
    boredom = emotion_data['neutral'] * 0.8
    confidence = (emotion_data['neutral'] - frustration) * 0.5
    surprise = emotion_data['surprise']
    hesitation = (emotion_data['fear'] + emotion_data['neutral'] * 0.1) / 2

    # Create a dictionary to store calculated engagement values
    combined_emotions = {
        "engagement": float(engagement),
        "confusion": float(confusion),
        "frustration": float(frustration),
        "curiosity": float(curiosity),
        "boredom": float(boredom),
        "confidence": float(confidence),
        "surprise": float(surprise),
        "hesitation": float(hesitation),
        "neutral": float(emotion_data['neutral']),
        "happy": float(emotion_data['happy']),
    }

    # Determine the dominant combined emotion
    sorted_emotions = sorted(combined_emotions.items(), key=lambda item: item[1], reverse=True)
    dominant_combined_emotion = sorted_emotions[0][0]
    top_3_emotions = {emotion: value for emotion, value in sorted_emotions[:3]}

    # Return the structured combined emotion data
    return {
        "combined_emotions": combined_emotions,
        "dominant_combined_emotion": dominant_combined_emotion,
        "top_3_emotions": top_3_emotions
    }

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
    return combine_emotion_data(emotion_data)

@app.route('/')
def home():
    return jsonify({"message": "Hello, World!"})

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
        translator = GoogleTranslator(source='zh-CN', target='id')
        # translator = Translator(to_lang='id', from_lang='zh')
        res = {}
        words = jieba.lcut(text)
        for word in words:
            try:
                res[word] = translator.translate(word)
            except Exception as translation_error:
                res[word] = ""
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

def transcribe_audio(audio_file):
    device = "cpu" 
    # audio_file = "test.mp3"
    batch_size = 16 # reduce if low on GPU mem
    compute_type = "int8" # change to "int8" if low on GPU mem (may reduce accuracy)

    # 1. Transcribe with original whisper (batched)
    model = whisperx.load_model("large-v2", device, compute_type=compute_type)

    # save model to local path (optional)
    # model_dir = "/path/"
    # model = whisperx.load_model("large-v2", device, compute_type=compute_type, download_root=model_dir)

    audio = whisperx.load_audio(audio_file)
    result1 = model.transcribe(audio, language="en" ,batch_size=batch_size)
    # print(result1["segments"]) # before alignment

    # delete model if low on GPU resources
    # import gc; gc.collect(); torch.cuda.empty_cache(); del model

    # 2. Align whisper output
    model_a, metadata = whisperx.load_align_model(language_code=result1["language"], device=device)
    result1 = whisperx.align(result1["segments"], model_a, metadata, audio, device, return_char_alignments=False)

    # print(result1["segments"]) # after alignment

    # delete model if low on GPU resources
    # import gc; gc.collect(); torch.cuda.empty_cache(); del model_a

    # 3. Assign speaker labels
    diarize_model = whisperx.DiarizationPipeline(use_auth_token="", device=device)

    # add min/max number of speakers if known
    diarize_segments = diarize_model(audio)
    # diarize_model(audio, min_speakers=min_speakers, max_speakers=max_speakers)

    result1 = whisperx.assign_word_speakers(diarize_segments, result1)
    # print(diarize_segments)
    # print(result1["segments"]) # segments are now assigned speaker IDs

    combined_text = " ".join(item['text'].strip() for item in result1["segments"])
    print(combined_text)
    # translated_text = translator.translate(combined_text, src="en", dest="id").text
    # print(translated_text)
    return(combined_text)


def create_flashcards(transcript):
    client = OpenAI(api_key="")

    completion = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """You are a helpful assistant that outputs JSON responses.
                Always respond with a JSON object containing an array of flashcards under the 'flashcards' key.
                Each flashcard must have exactly three fields: 'chinese', 'english', and 'explanation'."""
            },
            {
                "role": "user",
                "content": f"""Extract and explain Chinese words from this transcript: {transcript}
                
                Structure the response as:
                {{
                    "flashcards": [
                        {{
                            "chinese": "捐赠, juān zèng",
                            "english": "donate",
                            "explanation": "To give money or goods for a cause. 捐款或捐赠物品给有需要的人或组织。"
                        }},
                        // more flashcards...
                    ]
                }}
                
                For each word:
                - Chinese field must include characters and pinyin (format: '捐赠, juān zèng')
                - English field should have the translation
                - Explanation should be in both English and Chinese
                
                Only include words with clear context and complete explanations."""
            }
        ]
    )

    print(completion.choices[0].message.content)
    api_response = completion.choices[0].message.content

    # Use regex to extract the JSON-like content
    match = re.search(r'\[.*\]', api_response, re.DOTALL)
    if match:
        json_data = match.group(0)  # Extract JSON part
        extracted_data = json.loads(json_data)  # Convert to Python dictionary
        print(extracted_data)
        return extracted_data
    else:
        print("No valid JSON data found!")


@app.route('/create-flashcards', methods=['POST'])
def create_flashcards_from_audio():
    try:
        if 'audio_file' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        file = request.files['audio_file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        # Save the uploaded file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            transcript = transcribe_audio(filepath)
            extracted_data = create_flashcards(transcript)
            
            # Clean up the temporary file
            os.remove(filepath)
            
            return jsonify(extracted_data)
            
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)