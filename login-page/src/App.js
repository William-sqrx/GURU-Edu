import Login from './login';
import './App.css';
import Spline from '@splinetool/react-spline';
import Welcome from './welcome';
import React, { useState } from "react";
import Signup from './signup';

function App() {
  const [currentPage, setCurrentPage] = useState("welcome"); // Default page

  return (
    <div className="App">
      <div className='container'>
        <div className='spline-container'>
          <Spline 
            scene="https://prod.spline.design/ZCLA7cXZ95aBo0pU/scene.splinecode" 
          />
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

export default App;
