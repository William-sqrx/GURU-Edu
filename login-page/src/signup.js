import React, { useState } from "react";

const Signup = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "User registered successfully") {
            console.log("✅ Account created:", data);
            setSuccess("Sign up sucessful!");
            setError(""); // Clear error
            // onNavigate("login"); // Redirect to login page after successful signup
          } else {
            setError(data.message); // Show backend error message
          }
        })
        .catch((err) => {
          console.error("❌ Signup error:", err);
          setError("An error occurred. Please try again.");
        });
  };

  return (
    <div>
        <h2 className="text-center mb-4">Sign Up</h2>
        {success && <p className="text-success text-sm">{success}</p>}
        {error && <p className="text-danger small">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-100 p-3 border rounded"
            />
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-100 p-3 border rounded mt-2"
            />
            <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-100 p-3 border rounded mt-2"
            />

            <button type="submit" className="btn btn-outline-dark mt-4 w-100">
            Sign Up
            </button>
        </form>

        <button
            className="btn btn-outline-dark mt-2 w-100"
            onClick={() => onNavigate("welcome")}
        >
            Back
        </button>

        {/* Switch to Login */}
            <p className="text-center mt-4">
                Already have an account?{" "}
                <span className="d-block text-primary text-decoration-underline cursor-pointer" onClick={() => onNavigate("login")} style={{ cursor: "pointer" }}>
                    Login
                </span>
            </p>
    </div>
  );
};

export default Signup;
