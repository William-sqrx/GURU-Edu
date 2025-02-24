import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Welcome({ onNavigate }) {
  return (
    <div>
      <h1>Welcome!</h1>
      <button
        className="btn btn-outline-dark mt-4 w-100"
        onClick={() => onNavigate("login")}
      >
        Login
      </button>
      <button
        className="btn btn-outline-dark mt-3 w-100"
        onClick={() => onNavigate("signup")}
      >
        Sign Up
      </button>
    </div>
  );
}

export default Welcome;
