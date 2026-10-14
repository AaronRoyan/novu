'use client';

import Image from 'next/image';
import { type PointerEvent, useRef, useState } from 'react';

import medalFinisher from '@/assets/brand/medal-finisher.webp';
import medalWhatItTook from '@/assets/brand/medal-what-it-took.webp';
import { medalWords } from '@/lib/site';

import styles from './MedalFlip.module.css';

export function MedalFlip() {
  const [flipped, setFlipped] = useState(false);
  const tiltRef = useRef<HTMLSpanElement>(null);

  // Tilt follows the pointer via CSS variables, so moving doesn't re-render.
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse' || !tiltRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.style.setProperty('--rx', `${(-y * 18).toFixed(2)}deg`);
    tiltRef.current.style.setProperty('--ry', `${(x * 22).toFixed(2)}deg`);
    tiltRef.current.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
    tiltRef.current.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const onPointerLeave = () => {
    tiltRef.current?.style.removeProperty('--rx');
    tiltRef.current?.style.removeProperty('--ry');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.glow} aria-hidden="true" />
      <button
        type="button"
        className={styles.button}
        aria-pressed={flipped}
        aria-label={flipped ? 'Show the front of the medal' : 'Flip the medal to see what it took'}
        onClick={() => setFlipped((value) => !value)}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <span ref={tiltRef} className={styles.tilt}>
          <span className={styles.flipper} data-flipped={flipped}>
            <span className={styles.face} aria-hidden={flipped}>
              <Image
                src={medalFinisher}
                alt="Novu finisher medal"
                sizes="(min-width: 960px) 34vw, 80vw"
                className={styles.img}
              />
            </span>
            <span className={`${styles.face} ${styles.back}`} aria-hidden={!flipped}>
              <Image
                src={medalWhatItTook}
                alt={`The back of the medal, engraved: ${medalWords.join(', ')} — what it took`}
                sizes="(min-width: 960px) 34vw, 80vw"
                className={styles.img}
              />
            </span>
            <span className={styles.sheen} aria-hidden="true" />
          </span>
        </span>
      </button>
      <p className={`label ${styles.caption}`} aria-live="polite">
        <span className={styles.hint}>{flipped ? '↺' : '↻'}</span>
        {flipped ? medalWords.join(' · ') : 'Tap to see what it took'}
      </p>
    </div>
  );
}
