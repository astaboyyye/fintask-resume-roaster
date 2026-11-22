import { z } from 'zod';

const shortText = z.string().trim().min(1).max(1200);

export const roastSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  roast_summary: z.string().trim().min(10).max(1600),
  sections: z.array(z.object({
    name: z.string().trim().min(1).max(100),
    score: z.number().int().min(0).max(10),
    roast: shortText,
    fix: shortText,
  }).strict()).min(1).max(10),
  top_strengths: z.array(shortText).max(10),
  top_weaknesses: z.array(shortText).max(10),
  cringe_phrases: z.array(shortText).max(10),
  action_items: z.array(shortText).min(1).max(10),
}).strict();

export type RoastResult = z.infer<typeof roastSchema>;
