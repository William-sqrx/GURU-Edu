const mongoose = require("mongoose");

const { Schema } = mongoose;

const FlashcardSchema = new mongoose.Schema({
  chineseCharacter: { type: String, required: true },
  pinyin: { type: String, required: true },
  englishTranslation: { type: String, required: true },
  explanation: { type: String, required: true },
});

const audioSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    flashcards: { type: [FlashcardSchema], default: [] },
    audio_url: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Audio ||
  mongoose.model("Audio", audioSchema, "audio"); // <-- Explicit collection name
