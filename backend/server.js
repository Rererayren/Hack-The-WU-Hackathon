import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
// IMPORTANT: Increased limit for webcam/image data
app.use(express.json({ limit: '10mb' })); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, image, mode } = req.body;
    
    // Custom prompts for different buttons
    const prompts = {
      quiz: "Generate 3 multiple choice questions based on the provided material. Format: Question, then A/B/C/D. List the answer key at the end.",
      detect: "Look at this webcam frame. Is the student's hand or a tool (like a pen) touching or pointing at something specific? Explain what they are interacting with.",
      chat: prompt || "Analyze these study materials."
    };

    let parts = [{ text: prompts[mode] || prompts.chat }];

    if (image) {
      // Clean the Base64 string from the frontend
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];
      parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
    }

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', 
      systemInstruction: "You are a professional Study Companion. You help students by explaining diagrams, generating quizzes, and detecting what they are pointing at in their books via webcam.",
      contents: [{ role: 'user', parts: parts }],
    });

    res.json({ text: result.text });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "API Failure", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Study Engine Live on ${PORT}`));