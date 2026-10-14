import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import mark from '@/assets/brand/mark-white.png';
import duskTrail from '@/assets/photos/dusk-trail.jpg';
import innerCircle from '@/assets/photos/inner-circle.jpg';
import { instagramHandle, links } from '@/lib/site';

import styles from './Community.module.css';
import { SplitText } from './SplitText';

const ringText = 'Novu Lab · Inner circle · Novu Lab · Inner circle · ';

export function Community() {
  return (
    <section className={`section ${styles.community}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.collage} data-reveal data-scroll>
          <div className={styles.main}>
            <Image
              src={innerCircle}
              alt="Collage of the Novu inner circle at races and on training runs"
              fill
              placeholder="blur"
              sizes="(min-width: 960px) 40vw, 90vw"
              className={styles.cover}
            />
          </div>
          <div className={styles.inset}>
            <Image
              src={duskTrail}
              alt="A runner on a hillside trail at dusk"
              fill
              placeholder="blur"
              sizes="(min-width: 960px) 22vw, 50vw"
              className={styles.cover}
            />
          </div>
          <div className={styles.badge} aria-hidden="true">
            <svg viewBox="0 0 120 120" className={styles.ring}>
              <defs>
                <path id="community-ring" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
              </defs>
              <text>
                <textPath href="#community-ring" textLength={287} lengthAdjust="spacing">
                  {ringText}
                </textPath>
              </text>
            </svg>
            <Image src={mark} alt="" width={40} height={40} className={styles.badgeMark} />
          </div>
        </div>

        <div className={styles.copy}>
          <p className="label" data-reveal>
            (07) — Novu Lab
          </p>
          <h2 className="display h2">
            <SplitText>
              For those in the <span className="accent nowrap">In-Between.</span>
            </SplitText>
          </h2>
          <p className="lead" data-reveal style={{ '--d': 160 } as CSSProperties}>
            You keep showing up. And find your way back.
          </p>
          <div className={styles.ctas} data-reveal style={{ '--d': 240 } as CSSProperties}>
            <a href={links.lab} className="btn btn--accent">
              Join the Community <span className="arrow">↗</span>
            </a>
            <Link href="/store" className="btn">
              Explore the Gear
            </Link>
          </div>
          <a
            href={links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={`label link-underline ${styles.social}`}
            data-reveal
            style={{ '--d': 300 } as CSSProperties}
          >
            Follow {instagramHandle} on Instagram ↗
          </a>
        </div>
      </div>
    </section>
  );
}
