import type { StaticImageData } from 'next/image';

import vinayCover from '@/assets/journal/vinay-cover.jpg';
import vinayPortrait from '@/assets/journal/vinay-portrait.jpg';

export const series = {
  name: 'In the In-Between',
  description:
    'A library of human stories from everyday athletes navigating work, life, stress, and the quiet moments in between.',
};

/**
 * Story body, top to bottom. Inline `**bold**` marks words the original sets
 * in bold; `_text_` is set quieter (e.g. "he says" inside a pull quote).
 */
export type Block =
  /** Running text; each entry is its own line. `lead` sets the opening paragraph larger. */
  | { type: 'p'; lines: string[]; lead?: boolean }
  /** Spoken words the original sets in bold, shown as a pull quote. */
  | { type: 'quote'; lines: string[] }
  /** Short lines that stand alone, set large. `accent` colors the last line. */
  | { type: 'statement'; lines: string[]; accent?: boolean }
  /** Lines that light up word by word while the section is pinned. */
  | { type: 'scroll'; lines: string[] }
  /** Full-width photo break. */
  | { type: 'image'; src: StaticImageData; alt: string }
  /** The closing line of the story. */
  | { type: 'closing'; text: string };

export type Post = {
  slug: string;
  number: number;
  title: string;
  /** The person the story is about, set as the headline. */
  subject: string;
  /** Card / listing summary. */
  excerpt: string;
  /** Search and social description. */
  description: string;
  author: string;
  published: string;
  updated?: string;
  readingMinutes: number;
  cover: StaticImageData;
  portrait: StaticImageData;
  coverAlt: string;
  body: Block[];
};

// Newest first.
export const posts: Post[] = [
  {
    slug: 'in-the-in-between-vinay-jose',
    number: 1,
    title: 'In the In-Between: Vinay Jose',
    subject: 'Vinay Jose',
    excerpt:
      'Vinay didn’t come back because of a big moment — just a quiet decision to become himself again, one honest step at a time.',
    description:
      'At 22, Vinay moved from Bangalore to London and faced the silence, struggle, and rebuilding that comes with starting over. This is the raw, honest story of finding strength, discipline, and belief again.',
    author: 'Monish Mj',
    published: '2025-11-25',
    updated: '2025-11-26',
    readingMinutes: 3,
    cover: vinayCover,
    portrait: vinayPortrait,
    coverAlt: 'Vinay Jose on a floodlit football pitch at night',
    body: [
      {
        type: 'p',
        lead: true,
        lines: ['When Vinay moved from Bangalore to London at 22, everything changed — fast.'],
      },
      {
        type: 'p',
        lines: [
          'The noise, the people, the comfort of home… it all disappeared at once.',
          'What replaced it wasn’t excitement.',
        ],
      },
      { type: 'statement', lines: ['It was silence.'] },
      {
        type: 'p',
        lines: [
          'The heavy kind — the kind that forces you to face yourself.',
          '“Everything actually,” he says, when asked what changed after moving.',
        ],
      },
      {
        type: 'p',
        lines: [
          '“You learn to be self-reliant, and that helped me take action for myself. The way I saw things changed. I focused on doing more than speaking. It wasn’t exactly the right way in the start… but I made sure it was something, if not nothing.”',
        ],
      },
      { type: 'p', lines: ['But change doesn’t land softly.'] },
      {
        type: 'p',
        lines: [
          'Some days, he felt like he was doing all this because he had to, not because he wanted to.',
          'Some days, the discipline he knew back home felt far away.',
        ],
      },
      {
        type: 'p',
        lines: [
          'And some days, he caught himself remembering a version of himself he wasn’t proud of — the one he never wanted to become again.',
        ],
      },
      {
        type: 'p',
        lines: [
          'He doesn’t call it pain, but you can hear it between his words — the fight with his thoughts, the weight of expectation, the pressure of building yourself alone at 22 in a city that doesn’t slow down for anyone.',
        ],
      },
      {
        type: 'p',
        lines: [
          'Then there was a moment. Not a dramatic one — a simple evening after balancing classes and a part-time job. He says:',
        ],
      },
      { type: 'quote', lines: ['“I just needed to do this. It was something I always did back home.”'] },
      {
        type: 'p',
        lines: [
          'Fitness wasn’t just a routine for him — it was a reminder of who he used to be, and who he could still become.',
        ],
      },
      {
        type: 'p',
        lines: [
          'Living away from home wasn’t “hard,” he says.',
          '“It has been tough,” he admits, “but I just kept at it. Never thought too much about anything and took the important decisions when they were supposed to be taken.”',
        ],
      },
      { type: 'p', lines: ['The part he struggled with wasn’t the distance. It was himself.'] },
      {
        type: 'quote',
        lines: [
          '“The accountability mindset is something I still have trouble with,” _he says._',
          '“But it’s getting better.”',
        ],
      },
      { type: 'image', src: vinayCover, alt: 'Vinay Jose under the floodlights after a football session' },
      {
        type: 'scroll',
        lines: [
          'This is the part people don’t see.',
          'Not the gym photos.',
          'Not the football sessions.',
          'Not the days where he shows up.',
        ],
      },
      {
        type: 'p',
        lines: [
          'But the days in between — the ones where he’s fighting memories of who he was, and the fear of becoming him again.',
        ],
      },
      { type: 'statement', lines: ['That’s the pain.', 'That’s the work.', 'That’s the real comeback.'], accent: true },
      { type: 'p', lines: ['Showing up today looks different for him.'] },
      {
        type: 'p',
        lines: [
          '“Workouts in the gym, football sessions, self improvement… upskilling, faith in God,” he says.',
          '“Doing all of this every week, day in and day out — that’s my way of showing up.”',
        ],
      },
      {
        type: 'p',
        lines: [
          'But what he doesn’t say outright — and what you feel — is that every rep, every session, every morning he decides to get up…',
          'is him choosing **not** to slide back.',
        ],
      },
      {
        type: 'p',
        lines: [
          'Choosing not to become the old version of himself.',
          'Choosing the uncomfortable growth of a new city instead of the comfort of drifting.',
        ],
      },
      {
        type: 'p',
        lines: [
          'This isn’t a story about someone who has figured it out.',
          'It’s a story about someone in the middle of the fight — the place where most people actually are.',
        ],
      },
      { type: 'statement', lines: ['The in-between.'] },
      {
        type: 'p',
        lines: [
          'And if someone reading this is struggling, feeling lost, or trying to rebuild themselves in a place far from home, Vinay’s story says one thing clearly:',
        ],
      },
      {
        type: 'closing',
        text: 'You don’t have to have it all together to begin. You just have to begin — even when it hurts.',
      },
    ],
  },
];

export const journalPath = (post: Post) => `/journal/${post.slug}`;

export function findPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function formatPostDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
