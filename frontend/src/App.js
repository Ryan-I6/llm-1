import React, { useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import PracticeMode from "./PracticeMode";
import TestMode from "./TestMode";
import { useSpeechRecognition } from "react-speech-recognition";

const App = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { resetTranscript } = useSpeechRecognition();

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    resetTranscript();
  };

  return (
    <Box>
      <Typography variant="h4" align="center" sx={{ marginBottom: 2 }}>
        IELTS Speaking Test Simulator
      </Typography>
      <Tabs value={selectedTab} onChange={handleTabChange} centered>
        <Tab label="Practice Mode" />
        <Tab label="Test Mode" />
      </Tabs>
      <Box sx={{ padding: 3 }}>
        {selectedTab === 0 && <PracticeMode />}
        {selectedTab === 1 && <TestMode />}
      </Box>
    </Box>
  );
};

export default App;


