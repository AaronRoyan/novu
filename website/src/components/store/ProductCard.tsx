import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { formatPrice, type Product, productPath } from '@/lib/site';

import styles from './ProductCard.module.css';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [primary, secondary] = product.variants[0].images;
  const href = productPath(product);
  const discount = Math.round((1 - product.price / product.regularPrice) * 100);

  return (
    <article className={styles.card} data-reveal style={{ '--d': index * 120 } as CSSProperties}>
      <Link href={href} className={styles.media} aria-label={`${product.code} — ${product.name}`}>
        <span className={styles.layer} style={{ backgroundColor: primary.backdrop }}>
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            placeholder="blur"
            sizes="(min-width: 960px) 34vw, 92vw"
            className={styles.image}
            data-fit={primary.fit}
          />
        </span>
        {secondary ? (
          <span className={`${styles.layer} ${styles.hover}`} style={{ backgroundColor: secondary.backdrop }}>
            <Image
              src={secondary.src}
              alt=""
              fill
              sizes="(min-width: 960px) 34vw, 92vw"
              className={styles.image}
              data-fit={secondary.fit}
            />
          </span>
        ) : null}
        <span className={`display ${styles.code}`} aria-hidden="true">
          {product.code}
        </span>
        <span className={styles.badge} data-stock={product.inStock}>
          <span className={`dot ${product.inStock ? 'dot--pulse' : 'dot--muted'}`} />
          {product.status}
        </span>
        <span className={styles.cue} aria-hidden="true">
          View product <span>→</span>
        </span>
      </Link>

      <div className={styles.body}>
        <div className={styles.head}>
          <h2 className={styles.name}>
            <Link href={href}>
              <span className="label">{product.code}</span>
              {product.name}
            </Link>
          </h2>
          <p className={styles.price}>
            <span>{formatPrice(product.price)}</span>
            <s>{formatPrice(product.regularPrice)}</s>
            <span className={styles.off}>−{discount}%</span>
          </p>
        </div>
        <p className={styles.tagline}>{product.tagline}</p>
        <div className={styles.meta}>
          <span className={styles.swatches}>
            {product.variants.map((variant) => (
              <i key={variant.name} style={{ '--swatch': variant.swatch } as CSSProperties} />
            ))}
            <span className="sr-only">Colors: {product.variants.map((variant) => variant.name).join(', ')}</span>
          </span>
          <span className="label">{product.sizes.join(' · ')}</span>
        </div>
      </div>
    </article>
  );
}

/** Store grid tile pointing at the app waitlist. */
export function AppCard({ index = 0 }: { index?: number }) {
  return (
    <article className={`${styles.card} ${styles.appCard}`} data-reveal style={{ '--d': index * 120 } as CSSProperties}>
      <Link href="/#app" className={`${styles.media} ${styles.appMedia}`} aria-label="The Novu app — join the waitlist">
        <span className={styles.appGlow} aria-hidden="true" />
        <span className={styles.appRings} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.badge} data-stock="true">
          <span className="dot dot--pulse" />
          Coming soon
        </span>
        <span className={`display ${styles.appWord}`} aria-hidden="true">
          App
        </span>
        <span className={styles.cue} aria-hidden="true">
          Join the waitlist <span>→</span>
        </span>
      </Link>
      <div className={styles.body}>
        <div className={styles.head}>
          <h2 className={styles.name}>
            <Link href="/#app">
              <span className="label">iOS · Android</span>
              The Novu app
            </Link>
          </h2>
        </div>
        <p className={styles.tagline}>Record the In-Between. Track every run, keep every return.</p>
      </div>
    </article>
  );
}
