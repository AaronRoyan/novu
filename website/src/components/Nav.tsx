'use client';

import Link from 'next/link';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import { contactEmail, instagramHandle, links } from '@/lib/site';

import { Logo } from './Logo';
import styles from './Nav.module.css';

const items = [
  { label: 'Store', href: '/store' },
  { label: 'Our Story', href: '/story' },
  { label: 'App', href: '/#app' },
  { label: 'Novu Lab', href: links.lab, external: true },
  { label: 'Journal', href: '/journal' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 160 && y > lastY);
        lastY = y;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const toggle = toggleRef.current;
    root.style.overflow = 'hidden';

    // The menu covers the page: make what's behind it inert so Tab stays in
    // the header, and start keyboard focus on the first menu link.
    const behind = document.querySelectorAll<HTMLElement>('main, footer');
    behind.forEach((el) => el.setAttribute('inert', ''));
    menuRef.current?.querySelector<HTMLElement>('a')?.focus();

    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = '';
      behind.forEach((el) => el.removeAttribute('inert'));
      window.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={styles.nav}
      data-scrolled={scrolled || open}
      data-hidden={hidden && !open}
      data-open={open}
    >
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label="Novu home" onClick={close}>
          <Logo />
        </Link>

        <nav className={styles.links} aria-label="Main">
          {items.map((item) =>
            item.external ? (
              <a key={item.label} href={item.href} className={styles.link}>
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <span className={styles.progress} data-page-progress aria-hidden="true" />

        <div className={styles.actions}>
          <Link href="/store" className={`btn btn--accent ${styles.cta}`}>
            Shop <span className="arrow">→</span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div ref={menuRef} id="site-menu" className={styles.menu} hidden={!open}>
        <nav aria-label="Mobile" className={styles.menuLinks}>
          {items.map((item, index) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                className={`display ${styles.menuLink}`}
                style={{ '--i': index } as CSSProperties}
                onClick={close}
              >
                {item.label} <span className={styles.menuArrow}>↗</span>
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`display ${styles.menuLink}`}
                style={{ '--i': index } as CSSProperties}
                onClick={close}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className={styles.menuFoot}>
          <a href={links.email} className="label">
            {contactEmail}
          </a>
          <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="label">
            Instagram {instagramHandle}
          </a>
        </div>
      </div>
    </header>
  );
}
