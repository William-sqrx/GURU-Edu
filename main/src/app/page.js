"use client";
import React, { useState } from "react";
// import dynamic from "next/dynamic";
import Spline from "@splinetool/react-spline";
import Login from "./_components/login";
import Welcome from "./_components/welcome";
import Signup from "./_components/signup";
import "./page.css";

export default function Home() {
  const [currentPage, setCurrentPage] = useState("welcome");

  return (
    <div className="App">
      <div className="container">
        <div className="spline-container">
          <Spline scene="https://prod.spline.design/ZCLA7cXZ95aBo0pU/scene.splinecode" />
        </div>

        <div className={`${currentPage}-container`}>
          {currentPage === "welcome" && <Welcome onNavigate={setCurrentPage} />}
          {currentPage === "login" && <Login onNavigate={setCurrentPage} />}
          {currentPage === "signup" && <Signup onNavigate={setCurrentPage} />}
        </div>
      </div>
    </div>
  );
}
