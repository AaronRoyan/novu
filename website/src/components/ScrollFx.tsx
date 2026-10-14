'use client';

import { useEffect } from 'react';

const SETTLED_VELOCITY = 0.002;

/**
 * Drives every scroll-linked effect on the site. It only writes styles; the
 * components' stylesheets decide what moves. It runs only while the page is
 * scrolling and writes to as few elements as possible, because changing a CSS
 * variable restyles that element's whole subtree.
 *
 * - `--p` (0 → 1) on each `[data-scroll]` element near the viewport:
 *     data-scroll="view" (or empty): from its top entering the bottom of the
 *       screen to its bottom leaving the top, so 0.5 is roughly centred;
 *     data-scroll="pin": through a tall section whose child is `position: sticky`.
 * - `[data-page-progress]` elements get `transform: scaleX(page progress)`.
 * - `[data-velocity]` elements get `--velocity` (px/ms, smoothed).
 *
 * Skipped entirely for reduced motion; the stylesheets fall back to still layouts.
 */
export function ScrollFx() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nearby = new Set<HTMLElement>();
    const tracked = new WeakSet<Element>();
    const written = new WeakMap<HTMLElement, string>();
    let frame = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    let force = true;

    const write = (el: HTMLElement, name: string, value: string) => {
      const key = `${name}:${value}`;
      if (written.get(el) === key) return;
      written.set(el, key);
      el.style.setProperty(name, value);
    };

    const tick = (now: number) => {
      frame = 0;
      const y = window.scrollY;
      const moved = y !== lastY;
      const dt = Math.max(1, now - lastTime);
      velocity += ((moved ? (y - lastY) / dt : 0) - velocity) * 0.2;
      lastY = y;
      lastTime = now;

      document.querySelectorAll<HTMLElement>('[data-velocity]').forEach((el) => {
        el.style.setProperty('--velocity', Math.abs(velocity) < SETTLED_VELOCITY ? '0' : velocity.toFixed(3));
      });

      if (moved || force) {
        force = false;
        const vh = window.innerHeight;
        const page = (y / Math.max(1, document.documentElement.scrollHeight - vh)).toFixed(4);
        document.querySelectorAll<HTMLElement>('[data-page-progress]').forEach((el) => {
          el.style.transform = `scaleX(${page})`;
        });

        // Read every rect first, then write, so the browser lays out once.
        const updates: [HTMLElement, string][] = [];
        for (const el of nearby) {
          const rect = el.getBoundingClientRect();
          const progress =
            el.dataset.scroll === 'pin'
              ? -rect.top / Math.max(1, rect.height - vh)
              : (vh - rect.top) / (vh + rect.height);
          updates.push([el, Math.min(1, Math.max(0, progress)).toFixed(3)]);
        }
        for (const [el, value] of updates) write(el, '--p', value);
      }

      // Keep going until the scroll-speed lean has eased back to rest.
      if (Math.abs(velocity) >= SETTLED_VELOCITY) request();
    };

    const request = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const refresh = () => {
      force = true;
      request();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) nearby.add(el);
          else nearby.delete(el);
        }
        refresh();
      },
      { rootMargin: '30% 0px' },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-scroll]').forEach((el) => {
        if (tracked.has(el)) return;
        tracked.add(el);
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', refresh);
    refresh();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', refresh);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
