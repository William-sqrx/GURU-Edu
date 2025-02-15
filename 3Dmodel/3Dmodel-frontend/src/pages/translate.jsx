import React, { useState } from "react";

export default function Translate() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      const result = await response.json();
      setTranslation(result);
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Chinese text:
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <button type="submit">Translate</button>
      </form>
      <div>
        <h3>Translation:</h3>
        <ul>
          {Object.entries(translation).map(([char, translatedChar]) => (
            <li key={char}>
              {char}: {translatedChar}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
