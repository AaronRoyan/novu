import type { CSSProperties } from 'react';

import { contactEmail, formatPrice, freeDeliveryThreshold, links, type ProductFaq } from '@/lib/site';

import { SplitText } from '../SplitText';
import styles from './StoreInfo.module.css';

/** Delivery, tax, sizing and contact facts shown under the store and product pages. */
export function StoreInfo() {
  const cells = [
    {
      title: 'Free delivery',
      body: `On orders above ${formatPrice(freeDeliveryThreshold)}.`,
      link: { label: 'Shipping & returns', href: links.shipping },
    },
    { title: 'Taxes included', body: 'Every price you see already includes taxes.' },
    { title: 'Find your size', body: 'Each product page has its size chart and fit notes.' },
    {
      title: 'Questions?',
      body: `${contactEmail} · Monday–Saturday, 10am–6pm IST.`,
      link: { label: 'Contact us', href: links.contact },
    },
  ];

  return (
    <section className={styles.info} aria-label="Delivery and support">
      <ul className={`container ${styles.grid}`}>
        {cells.map((cell, index) => (
          <li key={cell.title} data-reveal style={{ '--d': index * 90 } as CSSProperties}>
            <span className="label">{String(index + 1).padStart(2, '0')}</span>
            <h3 className={styles.title}>{cell.title}</h3>
            <p>{cell.body}</p>
            {cell.link ? (
              <a href={cell.link.href} className={`label link-underline ${styles.link}`}>
                {cell.link.label} ↗
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq({ items }: { items: ProductFaq[] }) {
  return (
    <section className={`section ${styles.faqSection}`}>
      <div className={`container ${styles.faq}`}>
        <div className={styles.faqHead}>
          <p className="label" data-reveal>
            Good to know
          </p>
          <h2 className="display h2">
            <SplitText>FAQ</SplitText>
          </h2>
        </div>
        <div className={styles.questions}>
          {items.map((item, index) => (
            <details key={item.question} name="faq" className={styles.question} data-reveal style={{ '--d': index * 80 } as CSSProperties}>
              <summary>
                <span className="label">{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.q}>{item.question}</span>
                <span className={styles.plus} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
