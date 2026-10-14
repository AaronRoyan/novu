import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductShowcase } from '@/components/ProductShowcase';
import { ScrollWords } from '@/components/ScrollWords';
import { SplitText } from '@/components/SplitText';
import { AppCard, ProductCard } from '@/components/store/ProductCard';
import { Faq, StoreInfo } from '@/components/store/StoreInfo';
import { findProduct, products } from '@/lib/site';

import styles from './product.module.css';

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<'/store/[slug]'>): Promise<Metadata> {
  const product = findProduct((await params).slug);
  if (!product) return {};
  const image = product.variants[0].images[0];
  return {
    title: `${product.code} — ${product.name}`,
    description: `${product.tagline} ${product.description}`,
    openGraph: {
      images: [{ url: image.src.src, width: image.src.width, height: image.src.height, alt: image.alt }],
    },
  };
}

export default async function ProductPage({ params }: PageProps<'/store/[slug]'>) {
  const product = findProduct((await params).slug);
  if (!product) notFound();

  const others = products.filter((other) => other.slug !== product.slug);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.code} — ${product.name}`,
    description: product.description,
    brand: { '@type': 'Brand', name: 'Novu' },
    image: product.variants.flatMap((variant) => variant.images.map((image) => image.src.src)),
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: 'INR',
      price: product.price.toFixed(2),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className={`container ${styles.top}`}>
        <nav aria-label="Breadcrumb" className={`label ${styles.crumbs}`}>
          <Link href="/store" className="link-underline">
            Store
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">
            {product.code} — {product.name}
          </span>
        </nav>
      </div>

      <section className={`container ${styles.showcase}`}>
        <ProductShowcase product={product} headingLevel="h1" />
      </section>

      <ScrollWords
        eyebrow={
          <p className="label">
            {product.code} — {product.shortName}
          </p>
        }
        lines={product.lines}
        accentLine={product.lines.length - 1}
      />

      {product.faq ? <Faq items={product.faq} /> : null}

      <section className={`section ${styles.more}`}>
        <div className="container">
          <header className={styles.moreHead}>
            <h2 className="display h3">
              <SplitText>Also in the collection</SplitText>
            </h2>
            <Link href="/store" className="btn">
              All gear <span className="arrow">→</span>
            </Link>
          </header>
          <div className={styles.grid}>
            {others.map((other, index) => (
              <ProductCard key={other.slug} product={other} index={index} />
            ))}
            <AppCard index={others.length} />
          </div>
        </div>
      </section>

      <StoreInfo />
    </>
  );
}
