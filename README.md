Main readme
# IELTS Speaking Test Simulation Tool

This project is a web application that simulates a real-time IELTS Speaking Test. It allows users to practice their English speaking skills and receive detailed performance feedback based on IELTS criteria such as fluency, grammar, pronunciation, and vocabulary. Users can also generate a PDF report summarizing their test performance.

---

## Features

### Backend (FastAPI)
- **Feedback Generation**: Uses Cohere's AI model to evaluate user responses based on IELTS criteria.
- **PDF Report Generation**: Generates a downloadable report summarizing feedback for the test.
- **WebSocket Support**: Enables real-time communication for speech-to-text conversion.

### Frontend (React)
- **Real-Time Speech Input**: Utilizes the browser's speech recognition capabilities via the `react-speech-recognition` library.
- **Practice Mode**: Users can input responses and receive feedback for individual answers.
- **Test Mode**: Simulates all three parts of the IELTS Speaking Test (Introduction, Cue Card, and Two-Way Discussion) and provides feedback for each section.
- **Dynamic Test Progression**: Automatically advances through the three sections of the IELTS Speaking Test.
- **Feedback Display**: Displays detailed feedback for each section of the test in real-time.
- **PDF Report Download**: Allows users to download a PDF report of their performance.

---

## Technologies Used

### Backend
- **FastAPI**: Framework for building the API.
- **Cohere API**: AI-based language model for generating feedback.
- **Google Cloud Speech-to-Text API**: Converts audio input to text.
- **ReportLab & FPDF**: Generates PDF reports for test feedback.
- **CORS Middleware**: Enables cross-origin communication between the frontend and backend.

### Frontend
- **React**: Library for building the user interface.
- **Material-UI**: Styling and component library for the frontend.
- **Axios**: For making HTTP requests to the backend.
- **UUID**: Generates unique session IDs for test tracking.
- **React Speech Recognition**: Enables speech input functionality.

---

## Setup Instructions

### Prerequisites
Ensure you have the following installed:
- Python 3.8+
- Node.js 16+
- Google Cloud account with Speech-to-Text enabled.
- Cohere API account with an active API key.

### Backend Setup

1. **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2. **Set Up a Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install Dependencies**:
    ```bash
    pip install -r fastapi cohere uvicorn re uuid
    ```
4. **Run the Backend Server**:
    ```bash
    uvicorn main:app --reload
    ```

5. **Backend Endpoint**:
    The backend will run on `http://localhost:8000` by default.

### Frontend Setup

1. **Navigate to the Frontend Directory**:
    ```bash
    cd frontend
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Start the Frontend**:
    ```bash
    npm start
    ```

4. **Frontend URL**:
    The frontend will run on `http://localhost:3000` by default.

---

## Usage

1. Navigate to `http://localhost:3000` in your web browser.
2. Choose between Practice Mode or Test Mode:
    - **Practice Mode**: Input responses and receive immediate feedback.
    - **Test Mode**: Go through the three sections of the IELTS Speaking Test.
3. Use the "Start Recording" button to provide spoken responses.
4. View feedback and download your PDF report after completing the test.

---

## File Structure

### Backend
```
backend/
|-- main.py            # Main API logic
|-- requirements.txt   # Backend dependencies
|-- .env               # Environment variables
```

### Frontend
```
frontend/
|-- src/
    |-- components/
        |-- replyArea.js    # Component for displaying feedback
    |-- App.js              # Main application logic
    |-- TestMode.js         # IELTS Test Mode UI
    |-- PracticeMode.js    
|-- package.json          # Frontend dependencies
```

---

## APIs

### Backend Endpoints

1. **POST `/practice`**:
   - **Description**: Evaluates practice responses.
   - **Request Body**:
     ```json
     {
       "input": "Your response here"
     }
     ```
   - **Response**:
     ```json
     {
       "feedback": "Detailed feedback here"
     }
     ```

2. **POST `/test`**:
   - **Description**: Handles test responses for each section.
   - **Request Body**:
     ```json
     {
       "session_id": "unique-session-id",
       "input": "User input",
       "section": 1
     }
     ```
   - **Response**:
     ```json
     {
       "feedback": "Detailed feedback here",
       "complete": false
     }
     ```

3. **POST `/generate-report`**:
   - **Description**: Generates a PDF report based on user feedback.
   - **Request Body**:
     ```json
     {
       "session_id": "unique-session-id",
       "final": "Compiled feedback"
     }
     ```

4. **WebSocket `/ws/speech-to-text`**:
   - **Description**: Real-time speech-to-text conversion.

---

## Future Enhancements
- Add support for other languages in speech recognition.
- Improve feedback accuracy using additional AI models.
- Add user authentication and session tracking.
- Enhance UI for better usability and accessibility.

---

## Contributions
Contributions are welcome! Please submit a pull request or create an issue for any feature requests or bugs.

---

## Acknowledgments
- **Cohere**: For providing the AI-based feedback generation model.
- **Google Cloud**: For the speech-to-text API.
- **React-Speech-Recognition**: For seamless speech recognition integration.

---

## Contact
For questions or support, please contact Ryan Isaacs at [isaacsryan.00@gmail.com].
