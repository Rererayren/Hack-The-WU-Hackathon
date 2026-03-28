import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- HACKATHON STUDY DATA ---
// You can paste text here, or later, read from a file.
const STUDY_CONTEXT = `
  Topic: Biology 101 - Cell Division
  - Mitosis: Results in 2 identical daughter cells. Phases: Prophase, Metaphase, Anaphase, Telophase.
  - Meiosis: Results in 4 unique daughter cells (gametes).
  - Key Term: Cytokinesis is the final physical split of the cell.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // 1. PERSONA: Tells the AI how to act
      systemInstruction: `You are the AI-Study-Companion. 
        You are helpful, encouraging, and explain complex topics simply. 
        Always use bullet points for lists. 
        If the user asks something irrelevant, politely bring them back to studying.`,
      
      // 2. KNOWLEDGE: Combines your study notes with the user's question
      contents: [
        { 
          role: 'user', 
          parts: [{ text: `Context information: ${STUDY_CONTEXT}\n\nUser Question: ${prompt}` }] 
        }
      ],
    });

    res.json({ text: result.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "API Error", details: error.message });
  }
});

app.listen(5000, () => console.log(`🚀 Study Companion Engine Running on 5000`));