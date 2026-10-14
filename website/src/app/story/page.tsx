import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import duskTrail from '@/assets/photos/dusk-trail.jpg';
import { PhotoBand } from '@/components/PhotoBand';
import { ScrollWords } from '@/components/ScrollWords';
import { SplitText } from '@/components/SplitText';
import { links } from '@/lib/site';

import styles from './story.module.css';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Race days are the easiest. Novu is built around everything that leads up to them — the inconsistency, the repetition, the return.',
};

const delay = (ms: number) => ({ '--d': ms }) as CSSProperties;

const opening = [
  'You lay your kit out the night before.',
  'Wake up before the alarm.',
  'You sign up excited.',
  'The first few runs feel good.',
];

const shifts = [
  {
    title: 'Showing up becomes the point',
    body: 'Even on days when it doesn’t feel right, and especially when it doesn’t go well.',
  },
  {
    title: 'Slowing down becomes part of it',
    body: 'Not every run is fast, and not every phase moves forward.',
  },
  {
    title: 'Falling out and returning becomes normal',
    body: 'Missed days, broken rhythm, and starting again are part of it.',
  },
  {
    title: 'There’s no way around it',
    body: 'Endurance isn’t something you shortcut — it’s something you build over time.',
  },
];

export default function StoryPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <p className="label intro">
            Our story
          </p>
          <h1 className={`display ${styles.title}`}>
            <SplitText immediate delay={80}>
              Race days are the <span className="accent">easiest.</span>
            </SplitText>
          </h1>
          <ol className={styles.opening}>
            {opening.map((line, index) => (
              <li key={line} className="intro" style={delay(300 + index * 90)}>
                <span className="label">{String(index + 1).padStart(2, '0')}</span>
                {line}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ScrollWords
        eyebrow={<p className={`display ${styles.then}`}>Then</p>}
        lines={[
          'Motivation fades.',
          'Life moves you sideways.',
          'Plans change. Rhythm breaks.',
          'You lose direction.',
          'So you reroute. You keep showing up.',
          'And find your way back.',
          'This is what running really is.',
        ]}
        accentLine={6}
      />

      <section className="section">
        <div className="container">
          <header className={styles.changesHead}>
            <h2 className="display h2">
              <SplitText>What keeps you running changes.</SplitText>
            </h2>
            <div className={styles.changesCopy} data-reveal style={delay(120)}>
              <p className="lead">
                Most people start running with something in mind — a faster time, a longer distance, something to
                chase.
              </p>
              <p>
                Over time, that shifts. What keeps people in it isn’t the outcome, but what the process demands.
              </p>
            </div>
          </header>

          <ol className={styles.shifts}>
            {shifts.map((shift, index) => (
              <li key={shift.title} data-reveal style={delay(index * 100)}>
                <span className="label">{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.shiftTitle}>{shift.title}</h3>
                <p>{shift.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PhotoBand src={duskTrail} alt="A runner on a hillside trail at dusk">
        <p className={`display ${styles.bandText}`}>
          <SplitText>
            The inconsistency. The repetition. <span className="accent">The return.</span>
          </SplitText>
        </p>
      </PhotoBand>

      <section className={`section ${styles.stands}`}>
        <div className="container">
          <p className="label" data-reveal>
            This is where Novu stands
          </p>
          <ul className={styles.not}>
            <li className="display" data-reveal style={delay(80)}>
              Not the highlight.
            </li>
            <li className="display" data-reveal style={delay(160)}>
              Not the outcome.
            </li>
            <li className="display accent" data-reveal style={delay(240)}>
              But everything that leads up to it.
            </li>
          </ul>
          <div className={styles.close} data-reveal style={delay(120)}>
            <p className="lead">
              Novu is built around this part of running — not to define it, to represent it as it is.
            </p>
            <div className={styles.ctas}>
              <Link href="/store" className="btn btn--accent">
                Explore the gear <span className="arrow">→</span>
              </Link>
              <a href={links.lab} className="btn">
                Join the community <span className="arrow">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
