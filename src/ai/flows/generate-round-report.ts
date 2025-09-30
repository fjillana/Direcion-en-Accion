'use server';

/**
 * @fileOverview A round report generation AI agent.
 *
 * - generateRoundReport - A function that handles the round report generation process.
 * - GenerateRoundReportInput - The input type for the generateRoundReport function.
 * - GenerateRoundReportOutput - The return type for the generateRoundReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoundReportInputSchema = z.object({
  gameId: z.string().describe('The ID of the game.'),
  roundNumber: z.number().describe('The round number for which to generate the report.'),
  teamPerformanceData: z.string().describe('The performance data of each team in the round.'),
  marketConditions: z.string().describe('A summary of the market conditions during the round.'),
});
export type GenerateRoundReportInput = z.infer<typeof GenerateRoundReportInputSchema>;

const GenerateRoundReportOutputSchema = z.object({
  report: z.string().describe('The comprehensive report for the round.'),
  mayeuticQuestions: z.string().describe('A list of mayeutic questions for the teacher to use.'),
  pedagogicalSuggestions: z.string().describe('Pedagogical suggestions for the teacher.'),
});
export type GenerateRoundReportOutput = z.infer<typeof GenerateRoundReportOutputSchema>;

export async function generateRoundReport(input: GenerateRoundReportInput): Promise<GenerateRoundReportOutput> {
  return generateRoundReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoundReportPrompt',
  input: {schema: GenerateRoundReportInputSchema},
  output: {schema: GenerateRoundReportOutputSchema},
  prompt: `You are an AI assistant helping teachers to evaluate team performance in a business simulation game.

You will receive game data, market conditions, and team performance data for a specific round.
Your task is to generate a comprehensive report that includes:
- An overview of each team's performance, highlighting their strengths and weaknesses.
- An analysis of the decisions made by each team and their impact on their KPIs.
- Mayeutic questions that the teacher can use to guide students' reflection on their decisions.
- Pedagogical suggestions for the teacher to improve student learning.

Here is the game data:
Game ID: {{{gameId}}}
Round Number: {{{roundNumber}}}
Market Conditions: {{{marketConditions}}}
Team Performance Data: {{{teamPerformanceData}}}

Format your response as follows:
Report: [Comprehensive report]
Mayeutic Questions: [A list of mayeutic questions]
Pedagogical Suggestions: [Pedagogical suggestions]`,
});

const generateRoundReportFlow = ai.defineFlow(
  {
    name: 'generateRoundReportFlow',
    inputSchema: GenerateRoundReportInputSchema,
    outputSchema: GenerateRoundReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
