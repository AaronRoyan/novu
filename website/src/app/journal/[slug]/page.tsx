import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';

import { ArticleBody } from '@/components/journal/ArticleBody';
import { SplitText } from '@/components/SplitText';
import { findPost, formatPostDate, posts, series } from '@/lib/journal';
import { links } from '@/lib/site';

import styles from './article.module.css';

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<'/journal/[slug]'>): Promise<Metadata> {
  const post = findPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.published,
      modifiedTime: post.updated,
      authors: [post.author],
      images: [{ url: post.cover.src, width: post.cover.width, height: post.cover.height, alt: post.coverAlt }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<'/journal/[slug]'>) {
  const post = findPost((await params).slug);
  if (!post) notFound();

  const number = String(post.number).padStart(2, '0');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: [post.cover.src, post.portrait.src],
    datePublished: post.published,
    dateModified: post.updated ?? post.published,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Novu' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <article>
        <header className={styles.hero}>
          <div className={`container ${styles.heroGrid}`}>
            <div className={styles.heroText}>
              <nav aria-label="Breadcrumb" className={`label ${styles.crumbs}`}>
                <Link href="/journal" className="link-underline">
                  Journal
                </Link>
                <span aria-hidden="true">/</span>
                <span>{series.name}</span>
              </nav>

              <h1 className={styles.title}>
                <span className={`label intro ${styles.series}`}>
                  {series.name}: Story {number}
                </span>
                <span className="sr-only">{post.title}</span>
                <span className={`display ${styles.subject}`} aria-hidden="true">
                  <SplitText immediate delay={120}>
                    {post.subject}
                  </SplitText>
                </span>
              </h1>

              <p className={`lead intro ${styles.excerpt}`} style={{ '--d': 250 } as CSSProperties}>
                {post.excerpt}
              </p>

              <dl className={`intro ${styles.meta}`} style={{ '--d': 350 } as CSSProperties}>
                <div>
                  <dt className="label">Words</dt>
                  <dd>{post.author}</dd>
                </div>
                <div>
                  <dt className="label">Published</dt>
                  <dd>
                    <time dateTime={post.published}>{formatPostDate(post.published)}</time>
                  </dd>
                </div>
                <div>
                  <dt className="label">Read</dt>
                  <dd>{post.readingMinutes} min</dd>
                </div>
              </dl>
            </div>

            <div className={styles.portrait} data-scroll>
              <span className={styles.portraitFrame}>
                <Image
                  src={post.portrait}
                  alt={post.coverAlt}
                  fill
                  preload
                  placeholder="blur"
                  sizes="(min-width: 960px) 40vw, 100vw"
                  className={styles.portraitImage}
                />
              </span>
            </div>
          </div>
        </header>

        <ArticleBody blocks={post.body} />

        <footer className={styles.signoff}>
          <p className="label">
            — A story from the{' '}
            <Link href="/journal" className={styles.seriesLink}>
              {series.name} series
            </Link>{' '}
            by Novu
          </p>
        </footer>
      </article>

      <section className={`section ${styles.more}`}>
        <div className={`container ${styles.moreInner}`}>
          <div className={styles.moreText}>
            <p className="label" data-reveal>
              {series.name}
            </p>
            <p className="lead" data-reveal>
              {series.description}
            </p>
          </div>
          <div className={styles.moreActions} data-reveal>
            <Link href="/journal" className="btn btn--accent">
              All stories <span className="arrow">→</span>
            </Link>
            <a href={links.lab} className="btn">
              Join the community <span className="arrow">↗</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
