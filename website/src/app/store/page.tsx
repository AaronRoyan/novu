import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

import duskTrail from '@/assets/photos/dusk-trail.jpg';
import innerCircle from '@/assets/photos/inner-circle.jpg';
import singletChest from '@/assets/photos/singlet-chest.jpg';
import singletShoulder from '@/assets/photos/singlet-shoulder.jpg';
import trailPack from '@/assets/photos/trail-pack.jpg';
import socksBlackPair from '@/assets/products/socks-black-pair.jpg';
import { FieldGallery, type GalleryItem } from '@/components/FieldGallery';
import { Marquee } from '@/components/Marquee';
import { SplitText } from '@/components/SplitText';
import { AppCard, ProductCard } from '@/components/store/ProductCard';
import { StoreInfo } from '@/components/store/StoreInfo';
import { formatPrice, freeDeliveryThreshold, products } from '@/lib/site';

import styles from './store.module.css';

export const metadata: Metadata = {
  title: 'Store',
  description:
    'The Novu running collection: N001 The Split Singlet and N002 The Daily Runners. Built for showing up. Built through real use. Nothing extra.',
};

const delay = (ms: number) => ({ '--d': ms }) as CSSProperties;

const lookbook: GalleryItem[] = [
  { kind: 'image', src: singletShoulder, alt: 'Novu hexagon mark on the singlet shoulder at sunset', label: 'N001 — Detail' },
  { kind: 'image', src: trailPack, alt: 'Runners on a forest trail', label: 'Trail', shape: 'wide' },
  { kind: 'video', src: '/media/run-trail.mp4', poster: '/media/run-trail.jpg', label: 'Field test' },
  { kind: 'image', src: socksBlackPair, alt: 'Black Novu crew running socks, worn', label: 'N002 — Black' },
  { kind: 'image', src: duskTrail, alt: 'A runner on a hillside trail at dusk', label: 'Dusk', shape: 'wide' },
  { kind: 'image', src: singletChest, alt: 'Close-up of the singlet chest with DRYRUN print', label: 'N001 — Fabric' },
  { kind: 'image', src: innerCircle, alt: 'The Novu inner circle at races and on training runs', label: 'Inner circle' },
];

export default function StorePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className={`label intro ${styles.kicker}`}>
            <span className="dot dot--pulse" /> Store — Running collection
          </p>
          <h1 className={`display ${styles.title}`}>
            <SplitText immediate>Built for showing up.</SplitText>
          </h1>
          <div className={styles.heroFoot}>
            <p className="lead intro" style={delay(300)}>
              Built through real use. <span className="accent">Nothing extra.</span>
            </p>
            <ul className={`intro ${styles.facts}`} style={delay(400)}>
              <li>
                <b>{String(products.length).padStart(2, '0')}</b> pieces
              </li>
              <li>
                <b>{formatPrice(freeDeliveryThreshold)}+</b> free delivery
              </li>
              <li>
                <b>Taxes</b> included
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Marquee words={products.flatMap((product) => [product.code, product.shortName])} />

      <section className={`section ${styles.collection}`} aria-labelledby="collection-title">
        <div className="container">
          <header className={styles.collectionHead}>
            <h2 id="collection-title" className="display h3">
              <SplitText>The collection</SplitText>
            </h2>
            <p className="label" data-reveal>
              {products.length} pieces · Checkout on the Novu store
            </p>
          </header>
          <div className={styles.grid} data-scroll>
            {products.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
            <AppCard index={products.length} />
          </div>
        </div>
      </section>

      <FieldGallery
        intro={
          <>
            <p className="label">Lookbook</p>
            <h2 className="display h2">
              <SplitText>
                Worn. Tested. <span className="accent">Adjusted.</span>
              </SplitText>
            </h2>
            <p className="lead">For those in the In-Between.</p>
          </>
        }
        items={lookbook}
      />

      <StoreInfo />
    </>
  );
}
