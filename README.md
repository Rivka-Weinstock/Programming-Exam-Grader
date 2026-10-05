# 📝 Programming Exam Grader

An AI-powered tool for automatically grading handwritten programming exams. Upload a photo of a student's exam, extract the code via OCR, and get instant AI-driven feedback based on a fully customizable grading rubric.

Built with **React**, **TypeScript**, **Vite**, **Express**, and **Google Gemini AI**.

---

## ✨ Features

- 📷 **Handwritten Code OCR** — Upload exam photos and extract code using EasyOCR (Python microservice) or the built-in fallback engine
- 🤖 **AI-Powered Analysis** — Gemini AI analyzes the reconstructed code for logical, syntax, spelling, redundant, and efficiency errors
- 📋 **Customizable Rubric** — Define grading categories, deductions per error, and maximum caps per category
- 🧑‍🏫 **Teacher Review** — Accept, ignore, or manually add errors before finalizing the grade
- 📊 **Dual Reports** — Generate a detailed teacher report and a student-facing feedback report
- 🗂️ **Exam History** — Browse and reopen all previously graded submissions

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- *(Optional)* Python 3.8+ for the EasyOCR microservice

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:3000
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐍 Optional: EasyOCR Python Microservice

For higher-accuracy OCR on real handwritten exams:

```bash
cd python
pip install -r requirements.txt
python easyocr_server.py
```

The server runs on `http://127.0.0.1:5050`. The app will automatically use it if available, otherwise it falls back to the built-in engine.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | Express, Node.js |
| AI | Google Gemini (`gemini-2.0-flash`) |
| OCR | EasyOCR (Python) / Built-in fallback |
| Build | Vite 5 |

---

## 📁 Project Structure

```
├── src/
│   ├── components/     # React UI components
│   ├── services/       # OCR, AI, and grading logic
│   ├── types/          # TypeScript type definitions
│   └── data/           # Default rubric and demo exam
├── python/
│   ├── easyocr_server.py   # Python OCR microservice
│   └── requirements.txt
└── server.ts           # Express backend + Gemini API proxy
```

---

## 📄 License

MIT
