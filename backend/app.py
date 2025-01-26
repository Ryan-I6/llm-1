from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import cohere
from fastapi.middleware.cors import CORSMiddleware
import os
from google.cloud import speech
from fpdf import FPDF
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

co = cohere.ClientV2(api_key="cSHGgaDAPVrFkWjEAnXN9n66sOtt3CaNCwozvYcd")
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

test_sessions = {}
all_feedback = []
reponse_part3 = {} 

class PracticeRequest(BaseModel):
    input: str

class TestRequest(BaseModel):
    session_id: str
    input: str
    section: int

class PDFRequest(BaseModel):
    session_id: str
    final: str


def generate_feedback(user_input: str):
    system_prompt = "You are an IELTS examiner evaluating a practice response."
    prompt = f"{system_prompt}\n\nUser: {user_input}.\n\nGive detailed feedback on fluency, vocabulary, grammar, and pronunciation."

    try:
        response = co.chat(model="command-r-plus-08-2024",
                 messages=[{"role": "user",
                            "content": prompt,
            }])
        return response.message.content[0].text 
    except Exception as e:
        return f"Error generating feedback: {str(e)}"
    

def generate_feedback_test(user_input: str, section: int = None, session_id: str = None):
    section_prompts = {
        1: "You are an IELTS examiner asking introductory questions.",
        2: "You are an IELTS examiner giving a cue card topic for the user to discuss."
    }

    system_prompt = section_prompts.get(section, "You are an IELTS examiner evaluating a practice response.")
    prompt = f"{system_prompt}\n\nUser: {user_input}\n\nGive detailed feedback on fluency, vocabulary, grammar, and pronunciation."

    try:
        test_sessions[session_id]["history"].append({"role": "user", "content": prompt})

        response = co.chat(model="command-r-plus-08-2024",
                 messages=test_sessions[session_id]["history"])
        
        test_sessions[session_id]["history"].append({"role": "system", "content": response.message.content[0].text})

        return response.message.content[0].text
    except Exception as e:
        return f"Error generating feedback: {str(e)}"
    
def generate_feedback_test_part3(user_input, session_id: str = None):
    try:
        user_answer = test_sessions[session_id]['history'][2]['content'].split('\n\n')[1]
    except (IndexError, KeyError, AttributeError):
        user_answer = "No input"
    
    user_prompt = "You are an IELTS examiner having a two-way discussion on a topic."
    topic_prompt = f"The topic was to describe a memorable holiday. My answer was: {user_answer}. Ask two questions on the topic. but one question at a time"
    
    if not any(entry["content"] == user_prompt for entry in reponse_part3[session_id]["history"]):
        reponse_part3[session_id]["history"].append({"role": "user", "content": user_prompt})

    if not any(entry["content"] == topic_prompt for entry in reponse_part3[session_id]["history"]):
        reponse_part3[session_id]["history"].append({"role": "user", "content": topic_prompt})


    reponse_part3[session_id]["history"].append({"role": "user", "content": user_input})
    messages = reponse_part3[session_id]["history"]

    if reponse_part3[session_id]["question_counter"] == 2:
        lastPrompt = "Give detailed feedback on fluency, vocabulary, grammar, and pronunciation. Include ratings out of 10 for each category."
        reponse_part3[session_id]["history"].append({"role": "user", "content": lastPrompt})
        test_sessions[session_id]["history"].extend(reponse_part3[session_id]["history"])
        messages = test_sessions[session_id]["history"]


    try:
        reponse_part3[session_id]["question_counter"] += 1
        response = co.chat(model="command-r-plus-08-2024",
                           messages=messages)

        reponse_part3[session_id]["history"].append({"role": "system", "content": response.message.content[0].text})
        return response.message.content[0].text
    except Exception as e:
        return f"Error generating feedback: {str(e)}"
    
def pdf(request: PDFRequest):

    input_text = request.final

    # pattern = r"\*\*(.*?)\:\*\* (.*?)\n"
    # matchHeading = re.findall(pattern, input_text, re.DOTALL)

    # Define styles
    styles = getSampleStyleSheet()
    title_style = styles["Heading1"]
    subtitle_style = styles["Heading2"]
    body_style = styles["BodyText"]

    # File name for the generated PDF
    file_name = "IELTS_Report.pdf"

    # Create a PDF document
    pdf = SimpleDocTemplate(file_name, pagesize=letter)

    # Prepare PDF elements
    elements = []

    # Add a title
    elements.append(Paragraph("Extracted IELTS Feedback", title_style))
    elements.append(Spacer(1, 12))  # Add spacing

    elements.append(Paragraph("Feedback:", subtitle_style))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(input_text.strip(), body_style))
    elements.append(Spacer(1, 12))
    # Add each feedback section
    # for heading, bodytext in matchHeading:
        # elements.append(Paragraph(f"**{heading.strip()}**", subtitle_style))
        # elements.append(Spacer(1, 6))
        # elements.append(Paragraph(bodytext.strip(), body_style))
        # elements.append(Spacer(1, 12))

    # Generate the PDF
    pdf.build(elements)

    print(f"PDF '{file_name}' generated successfully!")
    return FileResponse(file_name, media_type="application/pdf", filename=file_name)

@app.post("/practice")
async def practice_mode(request: PracticeRequest):
    feedback = generate_feedback(request.input)
    return {"feedback": feedback}


@app.post("/test")
async def test_mode(request: TestRequest):
    section = request.section
    session_id = request.session_id

    # Check if the session ID exists
    if session_id not in test_sessions:
        test_sessions[session_id] = {"history": [], "complete": False}
        reponse_part3[session_id] = {"history": [], "complete": False, "question_counter": 0}

        print("Created new session:", session_id)

    try:
        print("Generating feedback for section", section)
        response = None
        if section == 3: 
            response = generate_feedback_test_part3(request.input, session_id)
        else:
            response = generate_feedback_test(request.input, section, session_id)

        test_sessions[session_id]["complete"] = True
        all_feedback.append(response)
        print("Generating feedback for section complete", section)
        if section == 3 and reponse_part3[session_id]["question_counter"] == 3:
            return {"feedback": "\n\n".join(all_feedback), "complete": True}
        if section == 3 and reponse_part3[session_id]["question_counter"] < 3:
            return {"feedback": response, "complete": False}
    
        return {"message": "Response received for section {section} saved. Continue to the next section."}

    except Exception as e:
        print("Error generating feedback:", str(e))
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/generate-report")
async def generate_report(request: PDFRequest):
    return pdf(request)


@app.websocket("/ws/speech-to-text")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client = speech.SpeechClient()

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
    )

    streaming_config = speech.StreamingRecognitionConfig(config=config)
    requests = []

    try:
        async for message in websocket.iter_text():
            # Handle incoming audio data (not implemented in detail for simplicity)
            requests.append(speech.StreamingRecognizeRequest(audio_content=message))
            responses = client.streaming_recognize(streaming_config, iter(requests))
            for response in responses:
                for result in response.results:
                    if result.is_final:
                        await websocket.send_text(result.alternatives[0].transcript)
    except Exception as e:
        await websocket.send_text(f"Error: {str(e)}")
