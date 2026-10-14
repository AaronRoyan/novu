import { type CSSProperties, Fragment, type ReactNode } from 'react';

import styles from './ScrollWords.module.css';

type Props = {
  eyebrow?: ReactNode;
  lines: string[];
  /** Index of a line to light in the accent color once reached. */
  accentLine?: number;
};

/**
 * A tall section whose sticky text lights up word by word as it scrolls past.
 * ScrollFx writes the pin progress to `--p`; the per-word opacity is CSS.
 */
export function ScrollWords({ eyebrow, lines, accentLine }: Props) {
  const words = lines.map((line) => line.split(' '));
  const offsets: number[] = [];
  let total = 0;
  for (const lineWords of words) {
    offsets.push(total);
    total += lineWords.length;
  }

  return (
    <section className={styles.section} data-scroll="pin" style={{ '--n': total } as CSSProperties}>
      <div className={`container ${styles.sticky}`}>
        {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
        <p className={styles.text}>
          {words.map((lineWords, lineIndex) => (
            <span
              key={lineIndex}
              className={styles.line}
              data-accent={lineIndex === accentLine || undefined}
            >
              {lineWords.map((word, wordIndex) => (
                <Fragment key={wordIndex}>
                  <span className={styles.word} style={{ '--i': offsets[lineIndex] + wordIndex } as CSSProperties}>
                    {word}
                  </span>{' '}
                </Fragment>
              ))}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
