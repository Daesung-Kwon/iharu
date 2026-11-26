/**
 * 하루 해님 geometry, locked 11/23.
 * Body, rays, and the five faces match brand/expressions.py.
 * The mascot is an illustration, not an ih-* icon.
 */

export const HARU_VIEWBOX = 128;

export const HARU_COLORS = {
  body: '#FFD25E',
  outline: '#F2A93B',
  ray: '#FFB547',
  cheek: '#FF9B9B',
  ink: '#2D3436',
  highlight: '#FFF9F0',
} as const;

export const HARU_BODY = {
  cx: 64,
  cy: 64,
  r: 38,
  strokeWidth: 3,
} as const;

export const HARU_RAY = {
  x: 57,
  y: 6,
  width: 14,
  height: 22,
  rx: 7,
  origin: 64,
  angles: [0, 45, 90, 135, 180, 225, 270, 315],
} as const;

export const HARU_MOODS = ['happy', 'cheer', 'support', 'sleepy', 'surprise'] as const;

export type HaruMood = (typeof HARU_MOODS)[number];

export type HaruShape =
  | { tag: 'circle'; cx: number; cy: number; r: number; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number }
  | { tag: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill?: string; stroke?: string; strokeWidth?: number }
  | { tag: 'path'; d: string; fill?: string; stroke?: string; strokeWidth?: number };

const ink = HARU_COLORS.ink;
const cheek = HARU_COLORS.cheek;

const defaultCheeks = (opacity: number, cy = 74, r = 6): HaruShape[] => [
  { tag: 'circle', cx: 44, cy, r, fill: cheek, opacity },
  { tag: 'circle', cx: 84, cy, r, fill: cheek, opacity },
];

export const HARU_FACES: Record<HaruMood, HaruShape[]> = {
  happy: [
    ...defaultCheeks(0.7),
    { tag: 'circle', cx: 52, cy: 62, r: 4.5, fill: ink },
    { tag: 'circle', cx: 76, cy: 62, r: 4.5, fill: ink },
    { tag: 'path', d: 'M56 74q8 7 16 0', fill: 'none', stroke: ink, strokeWidth: 4 },
  ],
  /** Celebration: closed happy eyes, open smile, pink cheeks. */
  cheer: [
    ...defaultCheeks(0.7),
    { tag: 'path', d: 'M46 64q6-7 12 0M70 64q6-7 12 0', fill: 'none', stroke: ink, strokeWidth: 4 },
    { tag: 'path', d: 'M55 72h18q-1 10-9 10t-9-10z', fill: ink },
  ],
  support: [
    ...defaultCheeks(0.7),
    { tag: 'ellipse', cx: 51, cy: 61, rx: 5.2, ry: 5.6, fill: ink },
    { tag: 'ellipse', cx: 77, cy: 61, rx: 5.2, ry: 5.6, fill: ink },
    { tag: 'circle', cx: 49.4, cy: 59.2, r: 1.5, fill: HARU_COLORS.highlight },
    { tag: 'circle', cx: 75.4, cy: 59.2, r: 1.5, fill: HARU_COLORS.highlight },
    { tag: 'path', d: 'M52 74q12 11 24 0', fill: 'none', stroke: ink, strokeWidth: 4 },
  ],
  sleepy: [
    ...defaultCheeks(0.45),
    { tag: 'path', d: 'M46 62q6 5 12 0M70 62q6 5 12 0', fill: 'none', stroke: ink, strokeWidth: 4 },
    { tag: 'ellipse', cx: 64, cy: 77, rx: 4, ry: 3, fill: ink },
  ],
  surprise: [
    ...defaultCheeks(0.55, 76, 5.5),
    { tag: 'circle', cx: 51, cy: 61, r: 7.2, fill: 'none', stroke: ink, strokeWidth: 3.2 },
    { tag: 'circle', cx: 77, cy: 61, r: 7.2, fill: 'none', stroke: ink, strokeWidth: 3.2 },
    { tag: 'circle', cx: 51, cy: 61, r: 3.2, fill: ink },
    { tag: 'circle', cx: 77, cy: 61, r: 3.2, fill: ink },
    { tag: 'ellipse', cx: 64, cy: 78, rx: 5.5, ry: 6.2, fill: 'none', stroke: ink, strokeWidth: 3.2 },
  ],
};

export const CELEBRATION_MOOD: HaruMood = 'cheer';
