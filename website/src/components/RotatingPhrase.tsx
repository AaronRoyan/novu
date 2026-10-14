'use client';

import { useEffect, useState } from 'react';

import styles from './Hero.module.css';

const HOLD_MS = 2200;
const LAST_HOLD_MS = 4200;

/**
 * Cycles through phrases, resting longer on the last one. The server render
 * shows the last phrase, so it is also what no-JS and reduced-motion visitors see.
 */
export function RotatingPhrase({ phrases }: { phrases: string[] }) {
  const last = phrases.length - 1;
  const [active, setActive] = useState(last);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(
      () => setActive((index) => (index + 1) % phrases.length),
      active === last ? LAST_HOLD_MS : HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, last, phrases.length]);

  return (
    <span className={styles.rotator}>
      <span className="sr-only">{phrases.join(', ')}</span>
      {phrases.map((phrase, index) => (
        <span
          key={phrase}
          aria-hidden="true"
          className={styles.phrase}
          data-state={
            index === active ? 'in' : index === (active - 1 + phrases.length) % phrases.length ? 'out' : 'idle'
          }
        >
          {phrase}
        </span>
      ))}
    </span>
  );
}
