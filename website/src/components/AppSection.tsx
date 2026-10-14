import type { CSSProperties } from 'react';

import styles from './AppSection.module.css';
import { SplitText } from './SplitText';
import { LiveRun } from './LiveRun';
import { WaitlistForm } from './WaitlistForm';

const features = [
  {
    title: 'Record every run',
    body: 'Live distance, time and pace from GPS, with noisy points filtered out.',
  },
  {
    title: 'Keep your history',
    body: 'Every run saved — including the slow ones and the weeks that didn’t go to plan.',
  },
  {
    title: 'Plan your routes',
    body: 'Running and walking routes built on OpenStreetMap data.',
  },
  {
    title: 'Novu Lab & gear',
    body: 'The community and new drops, in the same place you log your miles.',
  },
];

const history = [
  { day: 'Tue · 6:05 AM', distance: '5.02', time: '28:41' },
  { day: 'Sun · 5:40 AM', distance: '12.40', time: '1:14:09' },
  { day: 'Fri · 9:52 PM', distance: '3.10', time: '19:20', tag: 'The return' },
  { day: 'Mon · 6:30 AM', distance: '4.00', time: '25:12' },
];

// Wed → Tue, scaled to the longest day (Sun, 12.40 km); sums to the 20.52 km shown.
const weekBars = [0, 0, 0.25, 0, 1, 0, 0.4];

function StatusBar({ time }: { time: string }) {
  return (
    <div className={styles.statusBar}>
      <span>{time}</span>
      <span className={styles.island} />
      <span className={styles.signal}>
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

function TabBar({ active }: { active: string }) {
  return (
    <div className={styles.tabBar}>
      {['Novu', 'Social', 'Merch', 'Settings'].map((tab) => (
        <span key={tab} data-active={tab === active || undefined}>
          <i />
          {tab}
        </span>
      ))}
    </div>
  );
}

function Phones() {
  return (
    <div
      className={styles.phones}
      data-scroll
      role="img"
      aria-label="Preview of the Novu app: a run being recorded on a map, and a list of recent runs"
    >
      <div className={`${styles.phone} ${styles.phoneBack}`} aria-hidden="true">
        <div className={styles.screen}>
          <StatusBar time="6:41" />
          <div className={styles.screenBody}>
            <p className={styles.screenKicker}>Last 7 days</p>
            <p className={styles.screenTitle}>
              20.52 <small>km</small>
            </p>
            <div className={styles.bars}>
              {weekBars.map((height, index) => (
                <span key={index} style={{ '--h': height } as CSSProperties} />
              ))}
            </div>
            <p className={styles.screenKicker}>Recent runs</p>
            <ul className={styles.history}>
              {history.map((run) => (
                <li key={run.day}>
                  <span className={styles.historyDay}>
                    {run.day}
                    {run.tag ? <em>{run.tag}</em> : null}
                  </span>
                  <span className={styles.historyStats}>
                    <b>{run.distance} km</b>
                    <span>{run.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <TabBar active="Novu" />
        </div>
      </div>

      <div className={`${styles.phone} ${styles.phoneFront}`} aria-hidden="true">
        <div className={styles.screen}>
          <StatusBar time="6:04" />
          <div className={styles.screenBody}>
            <p className={styles.recording}>
              <span className="dot dot--pulse" /> Recording
            </p>
            <div className={styles.map}>
              <svg viewBox="0 0 280 190" preserveAspectRatio="xMidYMid slice">
                <g className={styles.streets}>
                  <path d="M-10 40 L290 18" />
                  <path d="M-10 102 L290 86" />
                  <path d="M-10 160 L290 150" />
                  <path d="M52 -10 L70 200" />
                  <path d="M140 -10 L132 200" />
                  <path d="M214 -10 L230 200" />
                  <path d="M0 0 L280 190" />
                </g>
                <path className={styles.park} d="M150 108 q30 -20 62 -4 q18 14 2 34 q-30 18 -58 2 q-20 -14 -6 -32z" />
                <path
                  className={styles.routeGlow}
                  pathLength={1}
                  d="M28 168 C 52 150, 62 124, 96 118 S 146 132, 164 102 S 186 44, 224 42 S 262 72, 250 108"
                />
                <path
                  className={styles.route}
                  pathLength={1}
                  d="M28 168 C 52 150, 62 124, 96 118 S 146 132, 164 102 S 186 44, 224 42 S 262 72, 250 108"
                />
                <circle className={styles.start} cx="28" cy="168" r="5" />
                <circle className={styles.here} cx="250" cy="108" r="6" />
              </svg>
            </div>
            <LiveRun />
            <div className={styles.controls}>
              <span className={styles.pause}>
                <i />
                <i />
              </span>
              <span className={styles.stop}>Stop run</span>
            </div>
          </div>
          <TabBar active="Novu" />
        </div>
      </div>
    </div>
  );
}

export function AppSection() {
  return (
    <section id="app" className={`section ${styles.app}`}>
      <div className={styles.horizon} aria-hidden="true" />
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.copy}>
            <p className={styles.pill} data-reveal>
              <span className="dot dot--pulse" /> Coming soon · iOS &amp; Android
            </p>
            <p className="label" data-reveal>
              (05) — The Novu app
            </p>
            <h2 className="display h2">
              <SplitText>
                Record the <span className="accent nowrap">In-Between.</span>
              </SplitText>
            </h2>
            <p className="lead" data-reveal style={{ '--d': 160 } as CSSProperties}>
              The runs nobody posts — the easy miles, the restarts, the days you showed up anyway. Track them,
              keep them, and see the return.
            </p>
            <div data-reveal style={{ '--d': 240 } as CSSProperties}>
              <WaitlistForm />
            </div>
            <ul className={styles.platforms} data-reveal style={{ '--d': 300 } as CSSProperties}>
              <li>
                <span className={styles.platformName}>iOS</span> Coming soon
              </li>
              <li>
                <span className={styles.platformName}>Android</span> Coming soon
              </li>
            </ul>
          </div>

          <Phones />
        </div>

        <ol className={styles.features}>
          {features.map((feature, index) => (
            <li key={feature.title} data-reveal style={{ '--d': index * 90 } as CSSProperties}>
              <span className="label">{String(index + 1).padStart(2, '0')}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p>{feature.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
