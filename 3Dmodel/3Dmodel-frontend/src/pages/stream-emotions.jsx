import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

function StreamEmotions() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: async (imageBlob) => {
      const formData = new FormData();
      formData.append("image", imageBlob, "capture.jpg");

      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Network response was not ok");
      }

      const data = await response.json();
      console.log("Response data:", data);
      return data;
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  useEffect(() => {
    // Start webcam
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
    setupCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let intervalId;

    if (stream && !isAnalyzing) {
      intervalId = window.setInterval(async () => {
        if (videoRef.current) {
          setIsAnalyzing(true);

          // Create canvas and draw video frame
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(videoRef.current, 0, 0);

          // Convert to blob
          canvas.toBlob(async (blob) => {
            if (blob) {
              try {
                await analyzeMutation.mutateAsync(blob);
              } catch (error) {
                console.error("Analysis error:", error);
              } finally {
                setIsAnalyzing(false);
              }
            }
          }, "image/jpeg");
        }
      }, 7000); // Every 7 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, isAnalyzing]);

  return (
    <>
      <h1>Live Emotion Analysis</h1>
      <div className="card">
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", maxWidth: "640px" }}
          />
        </div>

        {analyzeMutation.isPending && <div>Analyzing...</div>}
        {analyzeMutation.isError && (
          <div>Error: {analyzeMutation.error.message}</div>
        )}
        {analyzeMutation.isSuccess && (
          <div className="results">
            <h2>Current Emotion:</h2>
            <pre>
              {JSON.stringify(analyzeMutation.data.dominant_emotion, null, 2)}
            </pre>
            <div className="emotion"></div>
            <div className="detailed-results">
              <h3>All Emotions:</h3>
              <pre>{JSON.stringify(analyzeMutation.data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default StreamEmotions;
