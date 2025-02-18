import numpy as np
import librosa
import librosa.display
import tensorflow as tf
import sounddevice as sd
import soundfile as sf
from matplotlib import pyplot as plt
import matplotlib.cm as cm

# Constants
SAMPLE_RATE = 22050  # Librosa default
DURATION = 1  # Record for 2 seconds
MFCC_PAD = 60  # Must match what was used in training
NUM_CLASSES = 4  # 4 tones (1-4)
MODEL_PATH = "tone_cnn.keras"
OUTPUT_AUDIO = "recorded_audio.mp3"

# Load the trained model
model = tf.keras.models.load_model(MODEL_PATH)

def record_audio(output_file=OUTPUT_AUDIO, duration=DURATION, sample_rate=SAMPLE_RATE):
    """Records audio using sounddevice and saves it to a file."""
    print("🎙️ Speak now...")
    audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='float32')
    sd.wait()
    print("✅ Recording finished!")
    sf.write(output_file, audio, sample_rate)

def extract_mfcc(file_path, max_pad=MFCC_PAD):
    """Extracts MFCC features from an audio file."""
    audio, sample_rate = librosa.load(file_path, sr=SAMPLE_RATE)
    mfcc = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=60)

    # Ensure consistent MFCC shape (pad or truncate)
    pad_width = max(0, max_pad - mfcc.shape[1])
    mfcc = np.pad(mfcc, pad_width=((0, 0), (0, pad_width)), mode='constant')[:, :max_pad]

    return mfcc

def predict_tone():
    """Records audio, extracts MFCC, and predicts the tone."""
    # Step 1: Record audio
    #record_audio()

    # Step 2: Extract MFCC features
    #mfcc = extract_mfcc(OUTPUT_AUDIO)
    mfcc = extract_mfcc("an4_FV3_MP3.mp3")
    plt.imshow(mfcc, aspect='auto', cmap=cm.viridis)
    plt.show()

    # Step 3: Reshape to match model input
    mfcc = mfcc.reshape(1, mfcc.shape[0], mfcc.shape[1], 1)  # (1, 60, max_pad, 1)

    # Step 4: Predict tone
    predictions = model.predict(mfcc)
    predicted_tone = np.argmax(predictions, axis=1) + 1  # Convert [0,1,2,3] → [1,2,3,4]

    print(f"🔍 Raw Prediction Probabilities: {predictions}")
    print(f"🎵 Predicted Tone: {predicted_tone}", flush=True)
    return predicted_tone

if __name__ == "__main__":
    predict_tone()
