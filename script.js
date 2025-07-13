const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const fileNameEl = document.getElementById('file-name');
const processingMessage = document.getElementById('processing-message');
const summarySection = document.getElementById('summary-section');
const summaryContent = document.getElementById('summary-content');
const interactionSection = document.getElementById('interaction-section');
const chatBox = document.getElementById('chat-box');
const askModeBtn = document.getElementById('ask-mode-btn');
const challengeModeBtn = document.getElementById('challenge-mode-btn');
const askInputContainer = document.getElementById('ask-input-container');
const challengeInputContainer = document.getElementById('challenge-input-container');
const userQuestionInput = document.getElementById('user-question');
const sendQuestionBtn = document.getElementById('send-question-btn');
const generateChallengeBtn = document.getElementById('generate-challenge-btn');

let documentText = '';
let currentMode = 'ask';
let chatHistory = [];
let challengeState = { questions: [], currentQuestionIndex: 0, awaitingAnswer: false };

const API_KEY = "Paste your API Key here ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
});

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('bg-indigo-50', 'dark:bg-indigo-900/20');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('bg-indigo-50', 'dark:bg-indigo-900/20');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('bg-indigo-50', 'dark:bg-indigo-900/20');
    if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
});

askModeBtn.addEventListener('click', () => switchMode('ask'));
challengeModeBtn.addEventListener('click', () => switchMode('challenge'));
sendQuestionBtn.addEventListener('click', handleInteraction);
userQuestionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleInteraction();
});
generateChallengeBtn.addEventListener('click', handleGenerateChallenge);

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    if (isDark) document.documentElement.classList.add('dark');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    themeIcon.classList.toggle('fa-sun', isDark);
    themeIcon.classList.toggle('fa-moon', !isDark);
}

function handleFileUpload(file) {
    if (!file) return;
    if (API_KEY === "") {
        alert("Please add your Gemini API Key to script.js");
        return;
    }
    resetUI();
    fileNameEl.textContent = file.name;
    fileInfo.classList.remove('hidden');
    processingMessage.classList.remove('hidden');

    if (file.type === 'text/plain') extractTextFromTxt(file);
    else if (file.type === 'application/pdf') extractTextFromPdf(file);
    else {
        displayMessage('bot', { answer: 'Unsupported file type. Please upload a PDF or TXT file.' });
        processingMessage.classList.add('hidden');
    }
}

function extractTextFromTxt(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        documentText = e.target.result;
        onDocumentProcessed();
    };
    reader.readAsText(file);
}

async function extractTextFromPdf(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;
            const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map(item => item.str).join(' ') + '\n\n';
            }
            documentText = textContent;
            onDocumentProcessed();
        } catch (error) {
            console.error('Error processing PDF:', error);
            displayMessage('bot', { answer: 'Error processing PDF file. It might be corrupted or protected.' });
            processingMessage.classList.add('hidden');
        }
    };
    reader.readAsArrayBuffer(file);
}

function onDocumentProcessed() {
    processingMessage.classList.add('hidden');
    if (documentText.length > 50) {
        generateSummary();
        interactionSection.classList.remove('hidden', 'fade-in');
        void interactionSection.offsetWidth;
        interactionSection.classList.add('fade-in');
        addInitialBotMessage();
    } else {
        displayMessage('bot', { answer: 'Could not extract sufficient text from the document.' });
    }
}

async function generateSummary() {
    summaryContent.innerHTML = '<div class="flex items-center justify-center"><div class="loader"></div><span class="ml-3">Generating summary...</span></div>';
    summarySection.classList.remove('hidden', 'fade-in');
    void summarySection.offsetWidth;
    summarySection.classList.add('fade-in');

    const prompt = `Provide a concise, professional summary of the following document in no more than 150 words. \n\nDOCUMENT:\n"""\n${documentText.substring(0, 15000)}\n"""`;

    try {
        const summary = await callGeminiAPI(prompt);
        summaryContent.innerHTML = summary.replace(/\n/g, '<br>');
    } catch {
        summaryContent.textContent = 'Could not generate summary.';
    }
}

function switchMode(mode) {
    currentMode = mode;
    chatHistory = [];
    challengeState.awaitingAnswer = false;

    askModeBtn.classList.toggle('text-indigo-600', mode === 'ask');
    askModeBtn.classList.toggle('border-indigo-600', mode === 'ask');
    askModeBtn.classList.toggle('text-gray-500', mode !== 'ask');
    challengeModeBtn.classList.toggle('text-green-600', mode === 'challenge');
    challengeModeBtn.classList.toggle('border-green-600', mode === 'challenge');
    challengeModeBtn.classList.toggle('text-gray-500', mode !== 'challenge');

    askInputContainer.classList.toggle('hidden', mode !== 'ask');
    challengeInputContainer.classList.toggle('hidden', mode !== 'challenge');
    chatBox.innerHTML = '';
    if (mode === 'challenge') {
        displayMessage('bot', { answer: 'Welcome to Challenge Mode! Click "Generate New Challenge" to test your understanding.' });
    } else {
        addInitialBotMessage();
    }
}

function handleInteraction() {
    if (currentMode === 'ask') handleAskAnything();
    else if (challengeState.awaitingAnswer) handleChallengeAnswer();
}

async function handleAskAnything() {
    const question = userQuestionInput.value.trim();
    if (!question) return;

    displayMessage('user', question);
    userQuestionInput.value = '';
    showTypingIndicator();

    const prompt = `You are a research assistant. Based on the provided document, answer in JSON with "answer" and "snippet". \nDOCUMENT:\n"""\n${documentText.substring(0, 15000)}\n"""\nQUESTION: "${question}"`;

    try {
        const responseText = await callGeminiAPI(prompt);
        removeTypingIndicator();
        const cleaned = responseText.replace(/```json\n?|```/g, '').trim();
        const responseObject = JSON.parse(cleaned);
        displayMessage('bot', responseObject);
        chatHistory.push({ role: 'user', parts: [{ text: question }] });
        chatHistory.push({ role: 'model', parts: [{ text: JSON.stringify(responseObject) }] });
    } catch {
        removeTypingIndicator();
        displayMessage('bot', { answer: 'Could not process the question. Please try again.' });
    }
}

async function handleGenerateChallenge() {
    chatBox.innerHTML = '';
    displayMessage('bot', { answer: 'Generating new challenge questions...' });
    showTypingIndicator();

    const prompt = `Based on the document, generate 3 deep questions. Return JSON: ["Q1", "Q2", "Q3"]\n\nDOCUMENT:\n"""\n${documentText.substring(0, 15000)}\n"""`;

    try {
        const response = await callGeminiAPI(prompt);
        removeTypingIndicator();
        const questions = JSON.parse(response.replace(/```json\n?|```/g, '').trim());
        challengeState.questions = questions;
        challengeState.currentQuestionIndex = 0;
        challengeState.awaitingAnswer = true;
        askNextChallengeQuestion();
    } catch {
        removeTypingIndicator();
        displayMessage('bot', { answer: 'Could not generate challenges.' });
    }
}

function askNextChallengeQuestion() {
    if (challengeState.currentQuestionIndex < challengeState.questions.length) {
        const question = challengeState.questions[challengeState.currentQuestionIndex];
        displayMessage('bot', { answer: `**Challenge ${challengeState.currentQuestionIndex + 1}:**\n\n${question}` });
        askInputContainer.classList.remove('hidden');
        challengeInputContainer.classList.add('hidden');
        userQuestionInput.placeholder = 'Type your answer to the challenge...';
        userQuestionInput.focus();
    } else {
        displayMessage('bot', { answer: '**Challenge complete!** You can generate a new one or switch modes.' });
        challengeState.awaitingAnswer = false;
        askInputContainer.classList.add('hidden');
        challengeInputContainer.classList.remove('hidden');
    }
}

async function handleChallengeAnswer() {
    const answer = userQuestionInput.value.trim();
    if (!answer) return;

    displayMessage('user', answer);
    userQuestionInput.value = '';
    userQuestionInput.placeholder = 'Type your question...';
    askInputContainer.classList.add('hidden');
    showTypingIndicator();

    const question = challengeState.questions[challengeState.currentQuestionIndex];
    const prompt = `Evaluate user's answer based on this document.\n\nDOCUMENT:\n"""\n${documentText.substring(0, 15000)}\n"""\nQUESTION: "${question}"\nANSWER: "${answer}"`;

    try {
        const evaluation = await callGeminiAPI(prompt);
        removeTypingIndicator();
        displayMessage('bot', { answer: evaluation });
        challengeState.currentQuestionIndex++;
        askNextChallengeQuestion();
    } catch {
        removeTypingIndicator();
        displayMessage('bot', { answer: 'Could not evaluate. Try again.' });
    }
}

async function callGeminiAPI(prompt) {
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function displayMessage(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('mb-4', 'flex', 'fade-in');
    if (sender === 'user') {
        messageDiv.classList.add('justify-end');
        messageDiv.innerHTML = `<div class="bg-indigo-600 text-white rounded-xl py-2 px-4 max-w-md shadow">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;
    } else {
        const formattedAnswer = content.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        let snippet = '';
        if (content.snippet?.trim()) {
            snippet = `<div class="mt-3 pt-3 border-t text-xs italic"><strong class="not-italic">Reference:</strong><p class="mt-1">“${content.snippet}”</p></div>`;
        }
        messageDiv.classList.add('justify-start');
        messageDiv.innerHTML = `<div class="flex items-start gap-3"><div class="bg-gray-200 dark-mode-input text-gray-800 dark-mode-text rounded-xl py-2 px-4 max-w-md shadow">${formattedAnswer}${snippet}</div></div>`;
    }
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.id = 'typing-indicator';
    indicatorDiv.classList.add('mb-4', 'flex', 'justify-start');
    indicatorDiv.innerHTML = `<div class="flex items-start gap-3"><div class="bg-gray-200 dark-mode-input rounded-xl py-3 px-4 shadow"><div class="flex items-center space-x-1.5"><span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span><span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0.2s;"></span><span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0.4s;"></span></div></div></div>`;
    chatBox.appendChild(indicatorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function addInitialBotMessage() {
    chatBox.innerHTML = '';
    displayMessage('bot', { answer: 'Your document is ready. How can I help you?' });
}

function resetUI() {
    documentText = '';
    chatHistory = [];
    challengeState = { questions: [], currentQuestionIndex: 0, awaitingAnswer: false };
    summarySection.classList.add('hidden');
    interactionSection.classList.add('hidden');
    summaryContent.innerHTML = '';
    chatBox.innerHTML = '';
    fileNameEl.textContent = '';
    fileInfo.classList.add('hidden');
    processingMessage.classList.add('hidden');
    switchMode('ask');
}

document.addEventListener('DOMContentLoaded', initializeTheme);
