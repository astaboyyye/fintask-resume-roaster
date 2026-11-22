import type { RoastResult } from '@/lib/roast-schema';

/** Useful, deterministic preview feedback when no Groq key is configured. */
export function generateLocalRoast(text: string): RoastResult {
  const words = text.split(/\s+/).filter(Boolean);
  const hasMetrics = /\b\d+(?:[.,]\d+)?\s*%|\b\d+\s*(?:users|customers|clients|projects|people|hours|days)\b/i.test(text);
  const hasSections = /\b(experience|education|skills|projects)\b/i.test(text);
  const hasActionVerbs = /\b(led|built|created|improved|launched|developed|managed|designed)\b/i.test(text);
  const score = Math.min(85, Math.max(35, 52 + (hasMetrics ? 14 : 0) + (hasSections ? 9 : 0) + (hasActionVerbs ? 10 : 0) - (words.length < 180 ? 8 : 0)));

  return {
    overall_score: score,
    roast_summary: hasMetrics
      ? 'Your resume has some real evidence behind it. Now make every bullet as specific as the strongest one.'
      : 'Your resume has potential, but the impact is playing hide and seek. Add numbers and outcomes so a recruiter can see what changed because of your work.',
    sections: [
      {
        name: 'Impact', score: hasMetrics ? 8 : 4,
        roast: hasMetrics ? 'Some numbers made it to the party, but a few bullets still sound like job descriptions.' : 'Lots of activity, not enough proof of results.',
        fix: 'For each major role, add one measurable result: time saved, revenue gained, users helped, or a before-and-after comparison.',
      },
      {
        name: 'Clarity', score: hasActionVerbs ? 7 : 5,
        roast: hasActionVerbs ? 'Your action verbs help, though the strongest work could lead each bullet.' : 'Your accomplishments deserve stronger verbs than a vague list of responsibilities.',
        fix: 'Start bullets with a specific action verb, then state what you did and why it mattered.',
      },
      {
        name: 'Structure', score: hasSections ? 8 : 5,
        roast: hasSections ? 'The main sections are easy to spot. Keep the most relevant proof near the top.' : 'The section headings could use a clearer map for a quick scan.',
        fix: 'Use clear Experience, Education, Skills, and Projects headings where relevant. Put your strongest evidence first.',
      },
    ],
    top_strengths: [hasSections ? 'Recognizable resume sections' : 'A starting point to organize your experience', hasActionVerbs ? 'Some action-oriented wording' : 'Experience to build stronger bullets around'],
    top_weaknesses: [hasMetrics ? 'Not every claim is backed by a result' : 'Too few measurable outcomes', words.length < 180 ? 'The resume may be too brief to show your impact' : 'Some bullets may be more concise'],
    cringe_phrases: [],
    action_items: ['Rewrite your top three bullets as action + measurable result.', 'Move the most relevant achievement into the first half of the page.', 'Read each bullet aloud and cut filler words.'],
  };
}
