import connectToDatabase from "../../../../lib/mongodb";
import FlashCardStatic from "../../../../models/FlashCardStatic";

export async function GET(req) {
  try {
    await connectToDatabase();
    const flashcards = await FlashCardStatic.find();
    console.log(flashcards);
    return Response.json({ success: true, flashcards });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json(); // Fix: Parse JSON correctly
    const {
      chineseCharacter,
      englishTranslation,
      indonesianTranslation,
      pinyin,
    } = body;

    const newFlashcard = new FlashCardStatic({
      chineseCharacter,
      englishTranslation,
      indonesianTranslation,
      pinyin,
    });

    await newFlashcard.save();
    return Response.json(
      { success: true, flashcard: newFlashcard },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
