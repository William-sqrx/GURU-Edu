import connectToDatabase from "../../../../lib/mongodb";
import User from "../../../../models/User";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing fields" }),
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email, password }); // ⚠️ No hashing, just a basic match
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Login successful" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
