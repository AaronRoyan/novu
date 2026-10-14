'use client';

import { useEffect } from 'react';

/**
 * Marks every `[data-reveal]` element with `data-in` the first time it scrolls
 * into view; globals.css does the animating. Watches the DOM so elements from
 * client-side navigations are picked up too.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-in', '');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const scan = () => {
      document.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => io.observe(el));
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
