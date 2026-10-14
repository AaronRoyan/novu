import Link from 'next/link';
import type { CSSProperties } from 'react';

import duskTrail from '@/assets/photos/dusk-trail.jpg';
import singletChest from '@/assets/photos/singlet-chest.jpg';
import singletShoulder from '@/assets/photos/singlet-shoulder.jpg';
import trailPack from '@/assets/photos/trail-pack.jpg';
import { AppSection } from '@/components/AppSection';
import { Community } from '@/components/Community';
import { FieldGallery, type GalleryItem } from '@/components/FieldGallery';
import { Hero } from '@/components/Hero';
import { StoryCard } from '@/components/journal/StoryCard';
import { Marquee } from '@/components/Marquee';
import { MedalFlip } from '@/components/MedalFlip';
import { PhotoBand } from '@/components/PhotoBand';
import { ProductShowcase } from '@/components/ProductShowcase';
import { ScrollWords } from '@/components/ScrollWords';
import { SplitText } from '@/components/SplitText';
import { posts, series } from '@/lib/journal';
import { medalWords, productPath, products } from '@/lib/site';

import styles from './page.module.css';

const delay = (ms: number) => ({ '--d': ms }) as CSSProperties;

const fieldItems: GalleryItem[] = [
  { kind: 'video', src: '/media/run-sai.mp4', poster: '/media/run-sai.jpg', label: 'Coastline' },
  { kind: 'image', src: singletShoulder, alt: 'Novu hexagon mark on the singlet shoulder at sunset', label: 'N001 — Detail' },
  { kind: 'video', src: '/media/run-trail.mp4', poster: '/media/run-trail.jpg', label: 'Trail' },
  { kind: 'image', src: duskTrail, alt: 'A runner on a hillside trail at dusk', label: 'Dusk', shape: 'wide' },
  { kind: 'video', src: '/media/run-gopro.mp4', poster: '/media/run-gopro.jpg', label: 'Early miles' },
  { kind: 'image', src: singletChest, alt: 'Close-up of the singlet chest with DRYRUN print', label: 'N001 — Fabric' },
  { kind: 'video', src: '/media/run-offline.mp4', poster: '/media/run-offline.jpg', label: 'Offline' },
];

export default function Home() {
  const [singlet, socks] = products;

  return (
    <>
      <Hero />
      <Marquee words={medalWords} />

      <section className="section">
        <div className={`container ${styles.medal}`}>
          <div className={styles.medalCopy}>
            <p className="label" data-reveal>
              (01) — The medal
            </p>
            <h2 className="display h2">
              <SplitText>Most people chase the medal.</SplitText>
            </h2>
            <p className="lead" data-reveal style={delay(200)}>
              Race days are the easiest.
            </p>
          </div>
          <div data-reveal="fade" style={delay(200)}>
            <div className={styles.medalSpin} data-scroll>
              <MedalFlip />
            </div>
          </div>
        </div>
      </section>

      <ScrollWords
        eyebrow={
          <>
            <p className="label">(02) — The In-Between</p>
            <h2 className="display h3">This is the In-Between</h2>
          </>
        }
        lines={[
          'Showing up when you don’t feel like it.',
          'Starting again when it falls apart.',
          'Doing the work no one sees.',
          'That’s what earns it.',
        ]}
        accentLine={3}
      />

      <section id="gear" className={`section ${styles.gear}`}>
        <div className="container">
          <header className={styles.gearHead}>
            <div className={styles.gearTitle}>
              <p className="label" data-reveal>
                (03) — The gear
              </p>
              <h2 className="display h2">
                <SplitText>Built for showing up.</SplitText>
              </h2>
            </div>
            <div className={styles.gearAside} data-reveal style={delay(160)}>
              <p className="lead">Built through real use. Nothing extra.</p>
              <p className="label">Free delivery on orders above ₹999</p>
              <Link href="/store" className="btn">
                Visit the store <span className="arrow">→</span>
              </Link>
            </div>
          </header>

          <ProductShowcase product={singlet} detailsHref={productPath(singlet)} />
        </div>

        <PhotoBand src={trailPack} alt="Runners on a forest trail">
          <p className="label">Field notes</p>
          <p className={`display ${styles.bandText}`}>
            <SplitText>
              Worn. Tested. <span className="accent">Adjusted.</span>
            </SplitText>
          </p>
        </PhotoBand>

        <div className="container">
          <ProductShowcase product={socks} reverse detailsHref={productPath(socks)} />
        </div>
      </section>

      <FieldGallery
        intro={
          <>
            <p className="label">(04) — In the field</p>
            <h2 className="display h2">
              <SplitText>Built through real use.</SplitText>
            </h2>
            <p className="lead">For those in the In-Between.</p>
          </>
        }
        items={fieldItems}
      />

      <AppSection />

      <section className={`section ${styles.journal}`}>
        <div className="container">
          <header className={styles.journalHead}>
            <div className={styles.gearTitle}>
              <p className="label" data-reveal>
                (06) — Journal
              </p>
              <h2 className="display h2">
                <SplitText>
                  In the <span className="accent nowrap">In-Between</span>
                </SplitText>
              </h2>
            </div>
            <div className={styles.gearAside} data-reveal style={delay(160)}>
              <p className="lead">{series.description}</p>
              <Link href="/journal" className="btn">
                All stories <span className="arrow">→</span>
              </Link>
            </div>
          </header>
          <StoryCard post={posts[0]} headingLevel="h3" />
        </div>
      </section>

      <Community />
    </>
  );
}
