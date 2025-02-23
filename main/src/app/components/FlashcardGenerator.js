"use client";
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import Flashcard from "./Flashcard";
import styles from "./FlashcardGenerator.module.css";

const generateFlashcards = async (audioFile) => {
  const formData = new FormData();
  formData.append("audio_file", audioFile);

  const response = await fetch("http://127.0.0.1:5000/create-flashcards", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to generate flashcards");
  }

  return response.json();
};

const FlashcardGenerator = () => {
  const [audioFile, setAudioFile] = useState(null);

  const mutation = useMutation({
    mutationFn: generateFlashcards,
    onError: (error) => {
      console.error("Error generating flashcards:", error);
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = () => {
    if (!audioFile) return;
    mutation.mutate(audioFile);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.uploadCard}>
          <div className={styles.uploadContent}>
            <div className={styles.uploadControls}>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className={styles.fileInput}
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className={styles.uploadButton}>
                <Upload className="w-5 h-5" />
                Select Audio File
              </label>
              {audioFile && (
                <span className={styles.fileName}>{audioFile.name}</span>
              )}
              <button
                onClick={handleSubmit}
                disabled={!audioFile || mutation.isPending}
                className={styles.generateButton}
              >
                {mutation.isPending ? "Generating..." : "Generate Flashcards"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.flashcardsGrid}>
          {mutation.data?.map((card, index) => (
            <Flashcard
              key={index}
              chineseCharacter={card.chinese.split(",")[0]}
              pinyin={card.chinese.split(",")[1]}
              englishTranslation={card.english}
              indonesianTranslation={JSON.stringify(card.explanation)}
            />
          ))}
        </div>

        {mutation.isPending && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Generating flashcards...</p>
          </div>
        )}

        {mutation.isError && (
          <div className={styles.errorMessage}>
            Error generating flashcards. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardGenerator;
