"use client";
import React, { useState } from "react";
import { Upload } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Flashcard from "./Flashcard";
import styles from "./FlashcardGenerator.module.css";

// Upload new audio to database
const uploadAudio = async (audioData) => {
  const response = await fetch("/api/audio", {
    method: "POST",
    body: JSON.stringify(audioData),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to upload audio");
  }

  return response.json();
};

// Fetch all uploaded audios
const fetchAudios = async () => {
  const response = await fetch("/api/audio");
  if (!response.ok) {
    throw new Error("Failed to fetch audios");
  }
  return response.json();
};

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
  const [selectedAudio, setSelectedAudio] = useState(null);
  const mutation = useMutation({
    mutationFn: generateFlashcards,
    onError: (error) => {
      console.error("Error generating flashcards:", error);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadAudio,
    onError: (error) => {
      console.error("Error uploading audio:", error);
    },
  });
  const { data: audioData, refetch } = useQuery({
    queryKey: ["audios"],
    queryFn: fetchAudios,
  });
  console.log(
    "audiodata",
    audioData?.audios?.map((audio) => audio.flashcards)
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) return;
    const flashcardData = await mutation.mutateAsync(audioFile);

    console.log("Generated flashcards:", flashcardData);
    // Upload audio metadata to DB
    const audioMetadata = {
      title: audioFile.name,
      description: "Generated audio file",
      audio_url: URL.createObjectURL(audioFile), // Store URL for now
      flashcards: flashcardData,
    };

    console.log("Uploading audio metadata:", audioMetadata);

    await uploadMutation.mutateAsync(audioMetadata);
    refetch(); // Refresh audio list
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Audio Upload Section */}
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
                {mutation.isPending
                  ? "Generating..."
                  : "Generate & Upload Audio"}
              </button>
            </div>
          </div>
        </div>

        {/* Audio List Section */}
        <div className={styles.audioList}>
          <h2>Select an Audio</h2>
          {audioData?.audios.map((audio) => (
            <button
              key={audio._id}
              onClick={() => setSelectedAudio(audio)}
              className={styles.audioButton}
            >
              {audio.title}
            </button>
          ))}
        </div>

        {/* Flashcards Display Section */}
        {selectedAudio && (
          <>
            <h2>Flashcards for {selectedAudio.title}</h2>
            <div className={styles.flashcardsGrid}>
              {selectedAudio.flashcards.map((card, index) => (
                <Flashcard
                  key={index}
                  chineseCharacter={card.chineseCharacter}
                  pinyin={card.pinyin}
                  englishTranslation={card.englishTranslation}
                  explanation={JSON.stringify(card.explanation)}
                />
              ))}
            </div>
          </>
        )}

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
