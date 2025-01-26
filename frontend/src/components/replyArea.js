import { Box, Typography, Paper } from "@mui/material";

const Message = ({ text, isUserMessage }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUserMessage ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: "75%",
          p: 2,
          borderRadius: "20px",
          backgroundColor: isUserMessage ? "#1976d2" : "#f1f1f1",
          color: isUserMessage ? "white" : "black",
        }}
      >
        <Typography variant="body1">{text}</Typography>
      </Paper>
    </Box>
  );
};

const ReplyArea = ({ listMessages }) => {
  return (
    <Box sx={{ p: 2, maxHeight: "400px", overflowY: "auto" }}>
      {listMessages.map((message, index) => (
        <Message
          key={index}
          text={message.text}
          isUserMessage={message.isUserMessage}
        />
      ))}
    </Box>
  );
};

export default ReplyArea;
