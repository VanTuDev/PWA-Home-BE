import { GoogleGenAI } from '@google/genai';

const MODELS = ['gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

let ai = null;
const getAI = () => {
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
};

export const ask = async (prompt, modelIndex = 0) => {
  const model = MODELS[modelIndex] ?? MODELS[0];
  try {
    const response = await getAI().models.generateContent({ model, contents: prompt });
    return response.text ?? '';
  } catch (err) {
    if ((err?.status === 429 || String(err?.message).includes('429')) && modelIndex < MODELS.length - 1) {
      return ask(prompt, modelIndex + 1);
    }
    throw err;
  }
};

export const parseJSON = (raw) => {
  const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

export const hasApiKey = () => !!process.env.GEMINI_API_KEY;
