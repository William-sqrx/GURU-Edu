import React, { useState } from "react";

const Login = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Email and password are required");
      setSuccess("");
      return;
    }

    fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Login successful") {
            console.log("✅ Logged in successfully:", data);
            setSuccess("Login successful!");
            setError(""); // Clear error
            // onNavigate("dashboard"); // Redirect to a dashboard or another page
          } else {
            setError(data.message); // Show error message from backend
            setSuccess("");
          }
        })
        .catch((err) => {
          console.error("❌ Login error:", err);
          setError("An error occurred. Please try again.");
        });
  };

  return (
    <div>
        <h2 className="text-center mb-4">Login</h2>
        {success && <p className="text-success text-sm">{success}</p>}
        {error && <p className="text-danger text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
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

            <button type="submit" className="btn btn-outline-dark mt-4 w-100">
            Login
            </button>
        </form>

        <button
            className="btn btn-outline-dark mt-2 w-100"
            onClick={() => onNavigate("welcome")}
        >
            Back
        </button>

        {/* Switch to Signup */}
        <p className="text-center mt-4">
            Don't have an account?{" "}
            <span className="d-block text-primary text-decoration-underline cursor-pointer" onClick={() => onNavigate("signup")} style={{ cursor: "pointer" }}>
                Create an account
            </span>
        </p>
    </div>
  );
};

export default Login;
