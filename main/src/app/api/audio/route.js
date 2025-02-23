import connectToDatabase from "../../../../lib/mongodb";
import Audio from "../../../../models/Audio";

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    let { title, description, audio_url, flashcards } = body;

    // Ensure flashcards is an array
    if (!Array.isArray(flashcards)) {
      return Response.json(
        { success: false, error: "Flashcards must be an array of objects." },
        { status: 400 }
      );
    }

    const newAudio = new Audio({
      title,
      description,
      audio_url,
      flashcards, // Ensure embedded objects, not ObjectIds
    });

    await newAudio.save();
    return Response.json({ success: true, audio: newAudio }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectToDatabase();
    const audios = await Audio.find();

    return Response.json({ success: true, audios });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
