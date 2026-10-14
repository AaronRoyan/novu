'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type CSSProperties, type PointerEvent, useRef, useState } from 'react';

import { formatPrice, type Product } from '@/lib/site';

import styles from './ProductShowcase.module.css';

const pad = (value: number) => String(value).padStart(2, '0');

type Props = {
  product: Product;
  reverse?: boolean;
  /** `h1` on the product's own page; `h3` inside the home page's gear section. */
  headingLevel?: 'h1' | 'h3';
  /** Adds a "View details" link, e.g. from the home page to the product page. */
  detailsHref?: string;
};

export function ProductShowcase({ product, reverse, headingLevel = 'h3', detailsHref }: Props) {
  const Heading = headingLevel;
  // On the product's own page the showcase is the first screen: animate it
  // with CSS on load rather than waiting for the scroll observer.
  const firstScreen = headingLevel === 'h1';
  const reveal = firstScreen ? undefined : '';
  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const variant = product.variants[variantIndex];
  const image = variant.images[imageIndex];
  const discount = Math.round((1 - product.price / product.regularPrice) * 100);
  const nameId = `${product.code}-name`;

  // Hover-zoom follows the cursor; written straight to CSS variables.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    stageRef.current.style.setProperty('--zx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    stageRef.current.style.setProperty('--zy', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <article className={styles.product} data-reverse={reverse || undefined} aria-labelledby={nameId}>
      <div className={`${styles.media} ${firstScreen ? 'intro' : ''}`} data-reveal={reveal} data-scroll>
        <span className={`display ${styles.code}`} aria-hidden="true">
          {product.code}
        </span>

        <div
          ref={stageRef}
          className={styles.stage}
          style={{ backgroundColor: image.backdrop }}
          data-tone={image.tone}
          onPointerMove={onPointerMove}
        >
          {product.variants.map((v, vi) =>
            v.images.map((img, ii) => {
              const active = vi === variantIndex && ii === imageIndex;
              return (
                <Image
                  key={`${vi}-${ii}`}
                  src={img.src}
                  alt={active ? img.alt : ''}
                  aria-hidden={!active}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 960px) 54vw, 100vw"
                  className={styles.slide}
                  data-fit={img.fit}
                  data-active={active}
                />
              );
            }),
          )}
          <div className={styles.stageMeta}>
            <span>
              {product.code} / {image.label}
            </span>
            <span>
              {pad(imageIndex + 1)} / {pad(variant.images.length)}
            </span>
          </div>
        </div>

        <div className={styles.thumbs}>
          {variant.images.map((img, index) => (
            <button
              key={`${variantIndex}-${index}`}
              type="button"
              className={styles.thumb}
              style={{ backgroundColor: img.backdrop }}
              aria-label={`Show ${img.label.toLowerCase()} image`}
              aria-pressed={index === imageIndex}
              onClick={() => setImageIndex(index)}
            >
              <Image src={img.src} alt="" fill sizes="96px" className={styles.thumbImg} data-fit={img.fit} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.info}>
        <div
          className={`${styles.sticky} ${firstScreen ? 'intro' : ''}`}
          data-reveal={reveal}
          style={{ '--d': 120 } as CSSProperties}
        >
          <p className={`label ${styles.status}`}>
            <span className={`dot ${product.inStock ? 'dot--pulse' : 'dot--muted'}`} />
            {product.code} — {product.status}
          </p>

          <Heading id={nameId} className={`display ${styles.name}`}>
            {product.name}
          </Heading>
          <p className={styles.tagline}>{product.tagline}</p>

          <ul className={styles.lines}>
            {product.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <p className={styles.description}>{product.description}</p>

          <div className={styles.price}>
            <span className={`display ${styles.now}`}>{formatPrice(product.price)}</span>
            <s className={styles.was}>{formatPrice(product.regularPrice)}</s>
            <span className={styles.badge}>−{discount}%</span>
            <span className={`label ${styles.tax}`}>Taxes included</span>
          </div>

          <div className={styles.options}>
            {product.variants.length > 1 ? (
              <div className={styles.option}>
                <span className="label">Color — {variant.name}</span>
                <div className={styles.swatches}>
                  {product.variants.map((v, index) => (
                    <button
                      key={v.name}
                      type="button"
                      className={styles.swatch}
                      style={{ '--swatch': v.swatch } as CSSProperties}
                      aria-label={v.name}
                      aria-pressed={index === variantIndex}
                      onClick={() => {
                        setVariantIndex(index);
                        setImageIndex(0);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <div className={styles.option}>
              <span className="label">Sizes</span>
              <ul className={styles.sizes}>
                {product.sizes.map((size) => (
                  <li key={size}>{size}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.ctas}>
            <a href={product.url} className="btn btn--accent">
              {product.inStock ? 'Buy now' : 'Notify me when back'} <span className="arrow">↗</span>
            </a>
            {detailsHref ? (
              <Link href={detailsHref} className="btn">
                View details
              </Link>
            ) : null}
          </div>

          <div className={styles.details}>
            {product.details.map((detail) => (
              <details key={detail.title} name={`${product.code}-details`} className={styles.detail}>
                <summary>
                  {detail.title}
                  <span className={styles.plus} aria-hidden="true" />
                </summary>
                <div className={styles.detailBody}>
                  {detail.items ? (
                    <ul>
                      {detail.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {detail.table ? (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          {detail.table.head.map((cell) => (
                            <th key={cell} scope="col">
                              {cell}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.table.rows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, index) =>
                              index === 0 ? (
                                <th key={index} scope="row">
                                  {cell}
                                </th>
                              ) : (
                                <td key={index}>{cell}</td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
