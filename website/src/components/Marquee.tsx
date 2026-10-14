import Image from 'next/image';

import mark from '@/assets/brand/mark-white.png';

import styles from './Marquee.module.css';

/**
 * Endless word band. It also slides with scroll position (ScrollFx `--p`) and
 * leans with scroll speed (`--velocity`), so fast scrolling visibly drags it.
 */
export function Marquee({ words, reverse }: { words: string[]; reverse?: boolean }) {
  const group = (
    <div className={styles.group}>
      {words.map((word, index) => (
        <span key={index} className={styles.item} data-outline={index % 2 === 1}>
          {word}
          <Image src={mark} alt="" width={40} height={40} className={styles.mark} />
        </span>
      ))}
    </div>
  );

  return (
    <div className={styles.marquee} aria-hidden="true" data-scroll data-velocity data-reverse={reverse || undefined}>
      <div className={styles.shift}>
        <div className={`display ${styles.track}`}>
          {group}
          {group}
        </div>
      </div>
    </div>
  );
}
