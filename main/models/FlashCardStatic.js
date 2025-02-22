import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema({
  chineseCharacter: { type: String, required: true },
  englishTranslation: { type: String, required: true },
  indonesianTranslation: { type: String, required: true },
  pinyin: { type: String, required: true },
});

// Ensure Mongoose doesn't redefine the model
export default mongoose.models.FlashCardStatic ||
  mongoose.model("FlashCardStatic", FlashcardSchema, "flashcard-static"); // <-- Explicit collection name
