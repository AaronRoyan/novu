import Image from 'next/image';
import Link from 'next/link';

import { formatPostDate, journalPath, type Post, series } from '@/lib/journal';

import styles from './StoryCard.module.css';

type Props = {
  post: Post;
  headingLevel?: 'h2' | 'h3';
};

/** Wide story card: the cover on one side, the summary on the other. */
export function StoryCard({ post, headingLevel = 'h2' }: Props) {
  const Heading = headingLevel;
  const href = journalPath(post);
  const number = String(post.number).padStart(2, '0');

  return (
    <article className={styles.card} data-scroll>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden="true">
        <span className={styles.frame}>
          <Image
            src={post.cover}
            alt=""
            fill
            placeholder="blur"
            sizes="(min-width: 960px) 58vw, 100vw"
            className={styles.image}
          />
        </span>
        <span className={`display ${styles.number}`}>{number}</span>
      </Link>

      <div className={styles.body} data-reveal>
        <p className="label">
          {series.name} — Story {number}
        </p>
        <Heading className={styles.title}>
          <Link href={href}>{post.title}</Link>
        </Heading>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <p className={`label ${styles.meta}`}>
          By {post.author} · {formatPostDate(post.published)} · {post.readingMinutes} min read
        </p>
        <Link href={href} className="btn btn--accent">
          Read the story <span className="arrow">→</span>
        </Link>
      </div>
    </article>
  );
}
