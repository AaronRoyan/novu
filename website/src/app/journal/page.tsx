import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

import { StoryCard } from '@/components/journal/StoryCard';
import { SplitText } from '@/components/SplitText';
import { posts, series } from '@/lib/journal';
import { instagramHandle, links } from '@/lib/site';

import styles from './journal.module.css';

export const metadata: Metadata = {
  title: `Journal — ${series.name}`,
  description: series.description,
};

export default function JournalPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className={`label intro ${styles.kicker}`}>
            <span className="dot dot--pulse" /> Journal
          </p>
          <h1 className={`display ${styles.title}`}>
            <SplitText immediate>
              In the <span className="accent nowrap">In-Between</span>
            </SplitText>
          </h1>
          <div className={styles.heroFoot}>
            <p className="lead intro" style={{ '--d': 250 } as CSSProperties}>
              {series.description}
            </p>
            <p className="label intro" style={{ '--d': 350 } as CSSProperties}>
              {String(posts.length).padStart(2, '0')} {posts.length === 1 ? 'story' : 'stories'}
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Stories">
        <div className={`container ${styles.list}`}>
          {posts.map((post) => (
            <StoryCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className={`section ${styles.cta}`}>
        <div className={`container ${styles.ctaInner}`}>
          <h2 className="display h3">
            <SplitText>For those in the In-Between.</SplitText>
          </h2>
          <div className={styles.ctaActions} data-reveal>
            <a href={links.lab} className="btn btn--accent">
              Join the community <span className="arrow">↗</span>
            </a>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="btn">
              Follow {instagramHandle} <span className="arrow">↗</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
