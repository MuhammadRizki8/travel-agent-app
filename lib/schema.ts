import { z } from 'zod';

// Schema for search parameters to be extracted from the chat
export const searchParametersSchema = z
  .object({
    origin: z.string().optional().describe("The origin city or country. Example: 'Jakarta', 'Singapore', 'Bali'"),
    destination: z.string().optional().describe("The destination city or country. Example: 'Bali', 'Japan'"),
    startDate: z.string().optional().describe("The start date of the trip in YYYY-MM-DD format. If the user mentions 'today', 'tomorrow', or 'this weekend', convert it to the corresponding date. Today is November 23, 2025."),
    endDate: z.string().optional().describe("The end date of the trip in YYYY-MM-DD format. If the user mentions 'today', 'tomorrow', or 'this weekend', convert it to the corresponding date. Today is November 23, 2025."),
    numTravelers: z.number().optional().describe('The number of people traveling.'),
    budget: z.number().optional().describe('The maximum budget for the hotel per night.'),
    hotelRequirements: z.string().optional().describe('Any specific hotel requirements mentioned by the user. Example: "near the beach", "with free breakfast", or maybe "no need for a hotel".'),
    activityType: z
      .union([z.enum(['adventure', 'culinary', 'shopping', 'culture', 'relax']), z.string()])
      .optional()
      .describe('The type of activity of interest. Prefer one of: adventure, culinary, shopping, culture, relax. Synonyms accepted.'),
  })
  .passthrough();

// Type helper for use in the frontend
export type SearchParameters = z.infer<typeof searchParametersSchema>;
