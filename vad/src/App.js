import React, { useEffect, useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react";

function App() {
  const [talking, setTalking] = useState(false);
  // 1. Use the hook
  const vad = useMicVAD({
    onSpeechEnd: (audio) => {
      console.log("User stopped talking");
      setTalking(false);
      console.log(audio);
      // 'audio' contains PCM data from the user’s last speech segment, if needed
    },
    onSpeechStart: () => {
      console.log("Speech start detected");
      setTalking(true);
    },
    redemptionFrames: 20,
  });

  useEffect(() => {
    vad.start();
  }, []);

  // 2. Render a status message based on whether the user is speaking
  return (
    <div style={{ margin: 20 }}>
      <h1>Mic VAD Demo</h1>
      {talking ? (
        <p style={{ color: "green" }}>User is speaking...</p>
      ) : (
        <p style={{ color: "gray" }}>User is not speaking</p>
      )}
    </div>
  );
}

export default App;
