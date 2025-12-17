import { config } from 'dotenv';
config();

console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

import '@/ai/flows/generate-round-report.ts';
import '@/ai/flows/suggest-debriefing-questions.ts';
