'use client';

import { useEffect, useState } from 'react';

import styles from './AppSection.module.css';

const START_SECONDS = 28 * 60 + 41;
const PACE_SECONDS_PER_KM = 5 * 60 + 43;

const pad = (value: number) => String(value).padStart(2, '0');

/** The mock "Recording" screen's stats, ticking like a live run. */
export function LiveRun() {
  const [elapsed, setElapsed] = useState(START_SECONDS);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={styles.stats}>
      <div className={styles.statMain}>
        <span className={styles.statLabel}>Distance</span>
        <span className={styles.statBig}>
          {(elapsed / PACE_SECONDS_PER_KM).toFixed(2)}
          <small> km</small>
        </span>
      </div>
      <div className={styles.statRow}>
        <div>
          <span className={styles.statLabel}>Time</span>
          <span className={styles.statValue}>
            {Math.floor(elapsed / 60)}:{pad(elapsed % 60)}
          </span>
        </div>
        <div>
          <span className={styles.statLabel}>Pace</span>
          <span className={styles.statValue}>5′43″</span>
        </div>
        <div>
          <span className={styles.statLabel}>Points</span>
          <span className={styles.statValue}>{Math.floor(elapsed / 3)}</span>
        </div>
      </div>
    </div>
  );
}
