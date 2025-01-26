import React, { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
import { Button, Box, Typography } from "@mui/material";

const PracticeMode = () => {
  const [response, setResponse] = useState("");
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  const startListening = () => SpeechRecognition.startListening({ continuous: true });
  const stopListening = () => {
    SpeechRecognition.stopListening();
    sendResponse(transcript);
    resetTranscript();
  };

  const sendResponse = async (userInput) => {
    try {
      const res = await axios.post("http://localhost:8000/practice", { input: userInput });
      setResponse(res.data.feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Practice Mode</Typography>
      <Typography variant="body1" sx={{ marginY: 2 }}>
        Speak into the microphone, and receive instant feedback after stopping.
      </Typography>
      <Box sx={{ marginBottom: 2 }}>
        <Button variant="contained" onClick={startListening} disabled={listening}>
          Start Speaking
        </Button>
        <Button
          variant="contained"
          onClick={stopListening}
          sx={{ marginLeft: 2 }}
          disabled={!listening}
        >
          Stop & Analyze
        </Button>
      </Box>
      <Typography variant="body2">Transcript: {transcript}</Typography>
      {response && (
        <Box sx={{ marginTop: 2, padding: 2, border: "1px solid #ccc", borderRadius: 2 }}>
          <Typography variant="h6">Feedback</Typography>
          <Typography variant="body1">{response}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default PracticeMode;
