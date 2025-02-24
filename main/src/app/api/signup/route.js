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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: "User already exists" }),
        { status: 400 }
      );
    }

    const newUser = new User({ email, password, username: "" });
    await newUser.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully",
      }),
      {
        status: 201,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
