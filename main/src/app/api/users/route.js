import connectToDatabase from "../../../../lib/mongodb";
import User from "../../../../models/User";
export async function GET(req) {
  try {
    await connectToDatabase();
    const users = await User.find({});
    return new Response(JSON.stringify({ success: true, users }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json(); // parse the request body

    const { username, email, password } = body;
    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing fields" }),
        { status: 400 }
      );
    }

    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    return new Response(JSON.stringify({ success: true, user: newUser }), {
      status: 201,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
