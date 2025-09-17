'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant tags for leads based on the notes entered by a user.
 *
 * - suggestLeadTags - A function that takes lead notes as input and returns an array of suggested tags.
 * - SuggestLeadTagsInput - The input type for the suggestLeadTags function.
 * - SuggestLeadTagsOutput - The return type for the suggestLeadTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLeadTagsInputSchema = z.object({
  notes: z.string().describe('The notes entered for a lead.'),
});
export type SuggestLeadTagsInput = z.infer<typeof SuggestLeadTagsInputSchema>;

const SuggestLeadTagsOutputSchema = z.array(z.string()).describe('An array of suggested tags for the lead.');
export type SuggestLeadTagsOutput = z.infer<typeof SuggestLeadTagsOutputSchema>;

export async function suggestLeadTags(input: SuggestLeadTagsInput): Promise<SuggestLeadTagsOutput> {
  return suggestLeadTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLeadTagsPrompt',
  input: {schema: SuggestLeadTagsInputSchema},
  output: {schema: SuggestLeadTagsOutputSchema},
  prompt: `You are an expert sales and marketing AI assistant.

  Based on the following notes for a lead, suggest up to 5 relevant tags to categorize the lead.
  Return the tags as a JSON array of strings.

  Notes: {{{notes}}}
  `,
});

const suggestLeadTagsFlow = ai.defineFlow(
  {
    name: 'suggestLeadTagsFlow',
    inputSchema: SuggestLeadTagsInputSchema,
    outputSchema: SuggestLeadTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
