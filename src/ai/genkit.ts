import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyBhag1GZA3IftYKUT1JCx2nkKbZxnpqFKQ" })],
  model: 'googleai/gemini-2.5-flash',
});
