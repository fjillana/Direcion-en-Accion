
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting debriefing questions and pedagogical suggestions based on simulation results.
 *
 * - suggestDebriefingQuestions - A function that takes simulation results as input and returns suggested debriefing questions and pedagogical suggestions.
 * - SuggestDebriefingQuestionsInput - The input type for the suggestDebriefingQuestions function.
 * - SuggestDebriefingQuestionsOutput - The return type for the suggestDebriefingQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDebriefingQuestionsInputSchema = z.object({
  simulationResults: z
    .string()
    .describe(
      'The simulation results, including team performance, market conditions, and student decisions.'
    ),
});
export type SuggestDebriefingQuestionsInput = z.infer<
  typeof SuggestDebriefingQuestionsInputSchema
>;

const SuggestDebriefingQuestionsOutputSchema = z.object({
  debriefingQuestions: z
    .array(z.string())
    .describe('A list of 3-4 thought-provoking mayeutic questions.'),
  pedagogicalSuggestions: z
    .string()
    .describe('Pedagogical suggestions for the teacher.'),
});
export type SuggestDebriefingQuestionsOutput = z.infer<
  typeof SuggestDebriefingQuestionsOutputSchema
>;

export async function suggestDebriefingQuestions(
  input: SuggestDebriefingQuestionsInput
): Promise<SuggestDebriefingQuestionsOutput> {
  return suggestDebriefingQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDebriefingQuestionsPrompt',
  input: {schema: SuggestDebriefingQuestionsInputSchema},
  output: {schema: SuggestDebriefingQuestionsOutputSchema},
  prompt: `You are an experienced business educator. Based on the following simulation results, suggest 3-4 thought-provoking mayeutic questions and pedagogical suggestions for the teacher.

The questions should be open-ended and encourage students to reflect on their decisions, analyze the consequences, and connect them to business management concepts.

Simulation Results: {{{simulationResults}}}

Debriefing Questions: (list 3-4 questions)
Pedagogical Suggestions: (Provide suggestions on how the teacher can use the simulation results to improve their teaching methods)`,
});

const suggestDebriefingQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestDebriefingQuestionsFlow',
    inputSchema: SuggestDebriefingQuestionsInputSchema,
    outputSchema: SuggestDebriefingQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    