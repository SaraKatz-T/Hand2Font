# Hand2Font

A Full-Stack AI-powered system for generating a personalized digital font from handwriting.

**Hand2Font** was developed as a final academic project as part of a Software Engineering Practical Engineer program and received a final grade of **97 – Outstanding Excellence**.

## How It Works

1. **Handwriting Upload** – The user uploads handwriting images to the system.
2. **Processing, Character Extraction & Recognition** – The images are processed, and individual characters are extracted and recognized.
3. **Average Variant Selection** – For each character, the representative average variant is selected from the handwriting samples.
4. **Vectorization** – The character representation is converted from raster to vector format.
5. **Font Generation** – The vectorized characters are assembled into a digital font and exported as a font file.
6. **Handwriting Characterization** – The handwriting is analyzed based on its shape, content, and style to extract features describing its characteristics.

## Architecture

The system is based on a distributed architecture consisting of:

```text
React Frontend
      │
      │ REST API
      ▼
Java Spring Boot Backend
      │
      ├──────────► PostgreSQL
      │
      └──────────► RabbitMQ
                       │
                       ▼
                 Python Worker
              AI / CV / Font Processing
```

The Java Backend serves as the central orchestration layer, managing communication between system components, data, authentication, and authorization. The Python Worker is responsible for image processing, AI tasks, and font generation.

## Tech Stack

* **Backend orchestration:** Java 17, Spring Boot, Spring Data JPA, Hibernate, Spring Security, JWT
* **Frontend:** React, Vite, JavaScript
* **Messaging:** RabbitMQ
* **Database:** PostgreSQL
* **AI & Computer Vision:** Python, EfficientNet, BART, LaVA-NeXT
* **Shape Representation:** SDF (Signed Distance Fields)
* **Vectorization:** Schneider's Algorithm, Bézier Curves, Raster-to-Vector
* **Font Generation:** FontForge

## Project Structure

```text
Hand2Font/
├── java-backend/       # Java Spring Boot backend
├── react-frontend/     # React frontend
├── python-worker/      # AI and image-processing worker
└── .github/
    └── workflows/      # GitHub Actions
```

## Running Locally

**Prerequisites:** Java 17, Node.js, Python 3.10+, PostgreSQL, RabbitMQ

```bash
# Python worker
cd python-worker
pip install -r requirements.txt
python core/main_worker.py

# Java backend (port 8443, HTTPS)
cd java-backend
.\gradlew bootRun

# React frontend (port 5173)
cd react-frontend
npm install
npm run dev
```

Configure the required environment variables before running the backend:

```text
DB_PASSWORD
SSL_KEYSTORE_PASSWORD
JWT_SECRET
```

Python dependencies are managed in [`python-worker/requirements.txt`](python-worker/requirements.txt).
