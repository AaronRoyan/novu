import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import runnerRidge from '@/assets/brand/runner-ridge.png';
import { heroPhrases } from '@/lib/site';

import styles from './Hero.module.css';
import { HeroScene } from './hero/HeroScene';
import { FRAME, ridges, starFields } from './hero/scene';
import { RotatingPhrase } from './RotatingPhrase';

const viewBox = `0 0 ${FRAME.width} ${FRAME.height}`;

function Ridge({ id, depth }: { id: 'far' | 'mid' | 'near'; depth: number }) {
  return (
    <svg
      className={`${styles.layer} ${styles[id]}`}
      viewBox={viewBox}
      preserveAspectRatio="none"
      style={{ '--depth': depth } as CSSProperties}
    >
      <path d={ridges[id]} fill={`url(#hero-${id})`} />
    </svg>
  );
}

/**
 * A pinned, layered 3D scene: as the page scrolls the sun rises behind the
 * ridges and each layer drifts at its own depth; the mouse tilts the layers.
 * The front ridge and runner are cut out of Novu's own hero photograph, with
 * the sunrise rim light baked into the image.
 *
 * Everything that changes per frame is a transform or an opacity, so the GPU
 * can move it without repainting.
 */
export function Hero() {
  return (
    <section className={styles.hero} data-scroll="pin">
      <div className={styles.sticky}>
        <HeroScene className={styles.scene}>
          <svg className={styles.defs} width="0" height="0">
            <defs>
              {(['far', 'mid', 'near'] as const).map((id) => (
                <linearGradient key={id} id={`hero-${id}`} x1="0" y1="180" x2="0" y2="900" gradientUnits="userSpaceOnUse">
                  <stop offset="0" className={styles[`${id}Top`]} />
                  <stop offset="1" className={styles[`${id}Bottom`]} />
                </linearGradient>
              ))}
            </defs>
          </svg>

          <div className={styles.sky} />
          <div className={styles.dawn} />
          <div className={styles.stars}>
            {starFields.map((shadows, index) => (
              <i key={index} style={{ boxShadow: shadows }} />
            ))}
          </div>

          <div className={styles.stage}>
            <div className={styles.sunGlow} />
            <div className={styles.sun} />
            <Ridge id="far" depth={0.25} />
            <span className={styles.wordmark}>NOVU</span>
            <div className={`${styles.mist} ${styles.mistBack}`} />
            <Ridge id="mid" depth={0.5} />
            <div className={`${styles.mist} ${styles.mistFront}`} />
            <Ridge id="near" depth={0.75} />
            <div className={styles.warmth} />
            <div className={styles.front} style={{ '--depth': 1 } as CSSProperties}>
              <Image
                src={runnerRidge}
                alt=""
                fill
                preload
                sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
                className={styles.frontImage}
              />
            </div>
          </div>
          <div className={styles.grain} />
        </HeroScene>

        <div className={`container ${styles.overlay}`}>
          <h1 className="sr-only">Novu — built for the In-Between</h1>

          <div className={styles.top}>
            <span className="label">
              <span className="dot dot--pulse" /> N001 · N002 — Available now
            </span>
            <span className="label">Built for the In-Between</span>
          </div>

          <div className={styles.bottom}>
            <div className={styles.builtFor}>
              <p className={`display ${styles.builtLabel}`}>Built for</p>
              <p className={`display ${styles.title}`}>
                <RotatingPhrase phrases={heroPhrases} />
              </p>
            </div>

            <div className={styles.side}>
              <h2 className={styles.inspired}>
                Inspired by{' '}
                <span lang="kn" className={`kn ${styles.kannada}`}>
                  ನೋವು
                </span>
                .
              </h2>
              <p className={styles.lead}>For the miles that demand better.</p>
              <div className={styles.ctas}>
                <Link href="/store" className="btn btn--accent">
                  Shop the Gear <span className="arrow">→</span>
                </Link>
                <Link href="/story" className="btn">
                  Our Story
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.bar}>
            <span className="label">Scroll for more</span>
            <span className={styles.scrollLine} aria-hidden="true" />
            <span className="label">Watch the sunrise ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
