'use client';

import Image, { type StaticImageData } from 'next/image';
import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react';

import styles from './FieldGallery.module.css';

export type GalleryItem =
  | { kind: 'video'; src: string; poster: string; label: string }
  | { kind: 'image'; src: StaticImageData; alt: string; label: string; shape?: 'tall' | 'wide' };

type Props = {
  intro: ReactNode;
  items: GalleryItem[];
};

const DESKTOP = '(min-width: 861px)';

/**
 * On desktop the section pins while vertical scrolling slides the strip
 * sideways: ScrollFx supplies `--p`, this component measures how far the strip
 * overflows (`--dist`). On small screens it is a plain swipeable row.
 * Videos only play while on screen.
 */
export function FieldGallery({ intro, items }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const measure = () => {
      const pinned = window.matchMedia(DESKTOP).matches;
      const distance = pinned ? Math.max(0, track.scrollWidth - window.innerWidth) : 0;
      section.style.setProperty('--dist', `${distance}px`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    window.addEventListener('resize', measure);

    const videos = track.querySelectorAll('video');
    let io: IntersectionObserver | undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      videos.forEach((video) => (video.controls = true));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const video = entry.target as HTMLVideoElement;
            if (entry.isIntersecting) video.play().catch(() => {});
            else video.pause();
          }
        },
        { threshold: 0.3 },
      );
      videos.forEach((video) => io?.observe(video));
    }

    return () => {
      resize.disconnect();
      window.removeEventListener('resize', measure);
      io?.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.gallery} data-scroll="pin">
      <div className={styles.sticky}>
        <div ref={trackRef} className={styles.track}>
          <div className={styles.intro}>{intro}</div>
          {items.map((item, index) => (
            <figure
              key={item.label}
              className={styles.card}
              data-kind={item.kind}
              data-shape={item.kind === 'image' ? (item.shape ?? 'tall') : 'tall'}
              style={{ '--i': index } as CSSProperties}
            >
              <div className={styles.frame}>
                {item.kind === 'video' ? (
                  <video
                    className={styles.media}
                    src={item.src}
                    poster={item.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-label={item.label}
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 861px) 40vw, 75vw"
                    className={styles.media}
                  />
                )}
              </div>
              <figcaption className={styles.caption}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{item.label}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.progress} aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
