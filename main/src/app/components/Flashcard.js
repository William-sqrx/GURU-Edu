"use client";

import { useState, useRef, useEffect } from "react";
import "./Flashcard.css"; // Import CSS file

const Flashcard = ({
  chineseCharacter,
  pinyin,
  englishTranslation,
  indonesianTranslation,
  number,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null); // Reference for the flashcard

  // Close popup when clicking anywhere outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsClicked(false); // Close popup
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  return (
    <div
      ref={cardRef}
      className={`flashcard ${isHovered ? "hovered" : ""} ${
        isClicked ? "clicked" : ""
      }`}
      onClick={() => setIsClicked(!isClicked)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="character">{chineseCharacter}</span>

      {isClicked && (
        <div className="popup">
          <div className="pinyin">{pinyin}</div>
          <div className="translation">{englishTranslation}</div>
          <div className="translation">{indonesianTranslation}</div>
          {number !== undefined && <div className="number">{number}</div>}
        </div>
      )}
    </div>
  );
};

export default Flashcard;
