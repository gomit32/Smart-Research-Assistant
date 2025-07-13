# 📚 Smart Research Assistant

Welcome! This is my personal project—a web-based AI assistant that helps you **summarize, question, and interact with your PDF or TXT documents** in a modern, responsive interface.  
I built this to make reading, understanding, and exploring documents much easier and more interactive.

## 🚀 Features

- **Upload PDF/TXT**: Drag & drop or browse for your document.
- **Instant Summarization**: Get a concise summary right after upload.
- **Ask Anything**: Chat with your document—ask questions and get context-aware answers.
- **Challenge Mode**: Generate and answer logic-based questions from your document.
- **Dark/Light Mode**: Switch themes with a single click—your preference is saved.
- **Loading Spinners**: Visual feedback during file processing and AI response.
- **Mobile Friendly**: Looks and works great on any device.

## 🛠️ Tech Stack

- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **PDF Extraction**: [PDF.js](https://mozilla.github.io/pdf.js/)
- **AI Model**: OpenAI GPT-3.5, Google Gemini, or any compatible API (configurable)
- **Icons**: Font Awesome

  ## 📸 Previw and Demo :

> 📽️ **Demo Video:**  
> [![Watch the demo](https://img.youtube.com/vi/5A8v6MBVp5o/hqdefault.jpg)](https://youtu.be/IKb-lF-b3zc?si=HCRI7WYTlO83Dea6)

> 🖼️ **Images :**  
<img width="1738" height="949" alt="image" src="https://github.com/user-attachments/assets/336425f0-c1f7-468d-9d1b-90f6c495f2d4" />
<img width="1134" height="932" alt="image" src="https://github.com/user-attachments/assets/def5f5f5-d4d5-46d2-9275-97055956c4c4" />


## 🧑‍💻 Why I Made This

Reading long documents can be overwhelming. I wanted a tool where I could just upload a file and:
- Get a quick, accurate summary
- Ask questions and get answers based on the actual content
- Test my understanding with logic-based challenges

This project is my solution—a single-page app that brings AI-powered document interaction to everyone.


## ⚙️ How It Works

1. **Upload**: You can upload a PDF or TXT file (drag & drop or click).
2. **Extraction**: The app uses PDF.js to extract text from PDFs, or reads TXT files directly.
3. **Summarization**: The extracted text is sent to an AI model (OpenAI, Gemini, etc.) for a summary.
4. **Interaction**: You can chat with the document (Ask Anything) or switch to Challenge Mode for AI-generated questions.
5. **Theme**: Toggle between light and dark mode; your choice is remembered.
6. **Loading**: Spinners appear during file processing and AI response, so you always know what’s happening.

## 🏃‍♂️ How to Run Locally

1. **Clone this repo**
    ```
    git clone https://github.com/yourusername/smart-research-assistant.git
    cd smart-research-assistant
    ```

2. **Add your AI API key**
    - Get a free API key from [OpenAI](https://platform.openai.com/signup) or [Google Gemini](https://aistudio.google.com/app/apikey).
    - Open `script.js` and replace:
      ```
      const API_KEY = "PASTE YOUR API KEY HERE";
      ```
      with your actual API key.

3. **Open the app**
    - Just double-click `index.html` (no server or build step needed).

4. **Use it**
    - Upload your document, wait for the spinner, and start exploring!

## ✏️ Customization

- **Switch AI Model**: Swap between OpenAI, Gemini, or any compatible API by changing the endpoint and key in `script.js`.
- **Styling**: Tweak `style.css` or use Tailwind classes in the HTML for your own look.
- **File Types**: By default, PDF and TXT are supported. You can extend extraction logic for more formats if needed.

## ⚠️ Notes & Limitations

- **API Key**: For demo purposes, the API key is used client-side. For production, use a backend to keep your key secure.
- **API Limits**: Free tiers have usage limits—upgrade if you need more.
- **PDF Extraction**: PDF.js works for most PDFs, but scanned/image-based PDFs may need OCR for full support.

## 🙏 Thank You

