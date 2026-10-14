// Geometry for the hero's layered mountain scene, in a 1600 × 900 frame that
// matches the runner cut-out (runner-ridge.png). Everything is seeded, so the
// server renders the same scene every time.

export const FRAME = { width: 1600, height: 900 };

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

type Ridge = {
  seed: number;
  /** Average height of the ridge line, from the top of the frame. */
  base: number;
  /** [wavelength, amplitude] pairs, broad to fine. */
  octaves: [number, number][];
  peak?: { x: number; width: number; height: number };
};

/** A closed SVG path: a noisy ridge line filled down past the bottom edge. */
function ridgePath({ seed, base, octaves, peak }: Ridge) {
  const next = random(seed);
  const step = 16;
  const count = FRAME.width / step + 1;
  const layers = octaves.map(([span, amplitude]) => ({
    span,
    amplitude,
    points: Array.from({ length: Math.ceil(FRAME.width / span) + 2 }, () => next() * 2 - 1),
  }));

  const ys: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = i * step;
    let y = base;
    for (const { span, amplitude, points } of layers) {
      const t = x / span;
      const k = Math.floor(t);
      const s = (1 - Math.cos((t - k) * Math.PI)) / 2;
      y += (points[k] * (1 - s) + points[k + 1] * s) * amplitude;
    }
    if (peak) {
      const d = Math.abs(x - peak.x) / peak.width;
      y -= peak.height * Math.exp(-(d ** 1.35));
    }
    ys.push(y);
  }

  // Small overscan so the pointer tilt never shows a gap at the bottom edge.
  // Kept tight: every extra pixel here is GPU memory and first-paint time.
  const bottom = FRAME.height + 120;
  let d = `M0 ${bottom} L0 ${ys[0].toFixed(1)}`;
  for (let i = 1; i < count; i++) {
    const x0 = (i - 1) * step;
    d += ` Q${x0} ${ys[i - 1].toFixed(1)} ${x0 + step / 2} ${((ys[i - 1] + ys[i]) / 2).toFixed(1)}`;
  }
  d += ` L${FRAME.width} ${ys[count - 1].toFixed(1)} L${FRAME.width} ${bottom} Z`;
  return d;
}

// Echoes the original photo: a tall peak right of centre, two rolling ranges
// in front of it, then the real ridge and runner (the PNG) at the front.
export const ridges = {
  far: ridgePath({
    seed: 11,
    base: 345,
    octaves: [
      [420, 38],
      [150, 14],
      [48, 4],
    ],
    peak: { x: 1030, width: 330, height: 150 },
  }),
  mid: ridgePath({
    seed: 7,
    base: 415,
    octaves: [
      [330, 30],
      [110, 11],
      [36, 3],
    ],
  }),
  near: ridgePath({
    seed: 23,
    base: 505,
    octaves: [
      [270, 26],
      [90, 9],
      [30, 3],
    ],
  }),
};

// Three star fields, each one element drawn with box-shadows, so the twinkle
// is three cheap opacity animations rather than ninety.
const starRandom = random(5);
export const starFields = Array.from({ length: 3 }, () =>
  Array.from({ length: 30 }, () => {
    const x = (starRandom() * 100).toFixed(2);
    const y = (starRandom() * 52).toFixed(2);
    const spread = starRandom() > 0.85 ? 1 : 0.5;
    return `${x}vw ${y}svh 0 ${spread}px rgb(255 255 255 / 0.85)`;
  }).join(', '),
);
