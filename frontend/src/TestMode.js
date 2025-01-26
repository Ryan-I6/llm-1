import React, { use, useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ReplyArea from "./components/replyArea";

const TestMode = () => {
  const [section, setSection] = useState(1);
  const [response, setResponse] = useState("");
  const [messages, setMessages] = useState([]);
  const [testSessionId] = useState(uuidv4());
  const [testComplete, setTestComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true });
  const stopListening = async () => {
    SpeechRecognition.stopListening();
    setMessages([...messages, { text: transcript, isUserMessage: true }]);
    await startSection(transcript);
    resetTranscript();
  };

  const sections = {
    1: "Part 1: Introduction - Talk about yourself and your background.",
    2: "Part 2: Long Turn - Here's your cue card topic: Describe a memorable holiday.",
    3: "Part 3: Two-Way Discussion - Let's discuss related previous topic in detail.",
  };

  const startSection = async (userInput) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/test", {
        session_id: testSessionId,
        input: userInput,
        section,
      });

      if (section === 3) {
        setTestComplete(res.data.complete);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: res.data.feedback, isUserMessage: false },
        ]);
      }
      if (section !== 3) {
        nextSection();
      }
    } catch (error) {
      console.error("Error fetching test feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSection = () => {
    if (section < 3) {
      setSection(section + 1);
      setResponse("");
    }
    if (section < 2) {
      resetTranscript();
    }
    setMessages([]);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/generate-report",
        {
          session_id: testSessionId,
          final: messages[messages.length - 1].text,
        },
        { responseType: "blob" }
      );

      console.log("Report generated:", res.data);

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `IELTS_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error fetching test feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {loading && <CircularProgress />}
      {
        <Box>
          <Typography variant="h6">Test Mode</Typography>
          <Typography variant="body1" sx={{ marginY: 2 }}>
            {sections[section]}
          </Typography>
          {section === 3 && (
            <Typography>
              Your answer in previous section: {transcript}
            </Typography>
          )}
        </Box>
      }
      {(section === 1 || section === 2) && (
        <Box>
          <Typography variant="body1" sx={{ marginY: 2 }}>
            Speak into the microphone
          </Typography>
          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="contained"
              onClick={startListening}
              disabled={listening}
            >
              Start Recoding
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
        </Box>
      )}
      {section === 3 && (
        <>
          {messages.length > 0 && <ReplyArea listMessages={messages} />}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Recording will show here..."
              value={transcript}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={startListening}
              disabled={listening || testComplete}
              sx={{ marginLeft: 2 }}
            >
              Start Recoding
            </Button>
            <Button
              variant="contained"
              onClick={stopListening}
              sx={{ marginLeft: 2 }}
              disabled={!listening}
            >
              Stop & Send
            </Button>
            <Button
              variant="contained"
              onClick={generateReport}
              disabled={false}
              sx={{ marginLeft: 2 }}
            >
              Generate Report
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TestMode;
