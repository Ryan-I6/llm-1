# API ackend

This is a backend project built using [FastAPI](https://fastapi.tiangolo.com/), a modern Python web framework for building APIs. The project runs with [Uvicorn](https://www.uvicorn.org/), a lightning-fast ASGI server.

## Features

- **FastAPI Framework**: High performance, easy to use, and intuitive.
- **Uvicorn Server**: Fast and lightweight ASGI server for serving your app.
- **Async Support**: Fully asynchronous for high performance.

---

## Prerequisites

- Python 3.8 or newer
- Pip (Python Package Manager)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install the depedencies
```bash
pip install fastapi uvicorn pydantic motor pymongo 
```

## Running the Application

### 1. Start the Development Server
Run the following command to start the server with Uvicorn:

```bash
uvicorn app:app --reload
```

### 2. Access the API
Open your browser and visit http://127.0.0.1:8000

