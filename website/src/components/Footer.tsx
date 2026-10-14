import Link from 'next/link';
import type { CSSProperties } from 'react';

import { contactEmail, copyrightYear, instagramHandle, links, productPath, products } from '@/lib/site';

import styles from './Footer.module.css';

type FooterLink = { label: string; href: string; internal?: boolean; newTab?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Shop',
    links: [
      ...products.map((product) => ({
        label: `${product.code} — ${product.shortName}`,
        href: productPath(product),
        internal: true,
      })),
      { label: 'All gear', href: '/store', internal: true },
    ],
  },
  {
    title: 'Brand',
    links: [
      { label: 'Our Story', href: '/story', internal: true },
      { label: 'Community', href: links.lab },
      { label: 'Journal', href: '/journal', internal: true },
      { label: 'The app', href: '/#app', internal: true },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping & Returns', href: links.shipping },
      { label: 'Privacy Policy', href: links.privacy },
      { label: 'Terms of Service', href: links.terms },
      { label: 'Contact', href: links.contact },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: `Instagram ${instagramHandle}`, href: links.instagram, newTab: true },
      { label: contactEmail, href: links.email },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer} data-scroll>
      <div className="container">
        <div className={styles.top}>
          <p className={`display ${styles.statement}`}>
            For the miles that <span className="accent">demand better.</span>
          </p>
          <Link href="/store" className="btn btn--accent">
            Shop the Gear <span className="arrow">→</span>
          </Link>
        </div>

        <div className={styles.columns}>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="label">{column.title}</p>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.internal ? (
                      <Link href={link.href} className="link-underline">
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="link-underline"
                        {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className={styles.hours}>
            <p className="label">Hours</p>
            <p>Monday–Saturday</p>
            <p>10am–6pm IST</p>
          </div>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        {'NOVU'.split('').map((letter, index) => (
          <span key={letter} style={{ '--i': index } as CSSProperties}>
            {letter}
          </span>
        ))}
      </div>

      <div className={`container ${styles.bottom}`}>
        <span className="label">
          © {copyrightYear}{' '}
          <span lang="kn" className={`kn ${styles.kannada}`}>
            ನೋವು
          </span>
          . All rights reserved.
        </span>
        <span className="label">Built for the In-Between</span>
        <a href="#" className="label link-underline">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
