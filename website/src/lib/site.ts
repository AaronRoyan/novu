import type { StaticImageData } from 'next/image';

import singletBack from '@/assets/products/singlet-back.jpg';
import singletFront from '@/assets/products/singlet-front.jpg';
import socksBlackPair from '@/assets/products/socks-black-pair.jpg';
import socksBlackSingle from '@/assets/products/socks-black-single.jpg';
import socksWhitePair from '@/assets/products/socks-white-pair.jpg';
import socksWhiteSingle from '@/assets/products/socks-white-single.jpg';
import singletChest from '@/assets/photos/singlet-chest.jpg';
import singletShoulder from '@/assets/photos/singlet-shoulder.jpg';

// Checkout, Novu Lab, the blog and the policy pages still live on the Wix
// store. If this site takes over thenovu.in, move the store to a subdomain
// (e.g. shop.thenovu.in) and change this one value.
export const STORE_ORIGIN = 'https://www.thenovu.in';

export const links = {
  store: `${STORE_ORIGIN}/category/running-collection`,
  lab: `${STORE_ORIGIN}/novu-lab`,
  contact: `${STORE_ORIGIN}/contact-us`,
  shipping: `${STORE_ORIGIN}/shipping-policy`,
  privacy: `${STORE_ORIGIN}/privacy-policy`,
  terms: `${STORE_ORIGIN}/terms-and-condition`,
  instagram: 'https://www.instagram.com/the_novu',
  email: 'mailto:hello@thenovu.in',
} as const;

export const contactEmail = 'hello@thenovu.in';
export const instagramHandle = '@the_novu';
export const copyrightYear = 2026;

export const heroPhrases = [
  'runs before sunrise',
  'your first 5K',
  'late night runs',
  'a new PB',
  'race day energy',
  'the In-Between',
];

// Engraved on the back of the Novu finisher medal.
export const medalWords = ['Showed up', 'Tried again', 'Came back', 'Kept going'];

export type ProductImage = {
  src: StaticImageData;
  alt: string;
  label: string;
  /** `contain` for cut-out shots that sit on a flat backdrop of `backdrop`. */
  fit: 'cover' | 'contain';
  backdrop: string;
  tone: 'light' | 'dark';
};

export type ProductVariant = {
  name: string;
  swatch: string;
  images: ProductImage[];
};

export type ProductDetail = {
  title: string;
  items?: string[];
  table?: { head: string[]; rows: string[][] };
};

export type ProductFaq = { question: string; answer: string };

export type Product = {
  code: string;
  slug: string;
  name: string;
  shortName: string;
  status: string;
  inStock: boolean;
  tagline: string;
  lines: string[];
  description: string;
  price: number;
  regularPrice: number;
  sizes: string[];
  variants: ProductVariant[];
  details: ProductDetail[];
  faq?: ProductFaq[];
  /** Product page on the Wix store, where checkout happens. */
  url: string;
};

const WHITE = '#fefefe';
const BLACK = '#000000';

// Prices and stock mirror the Wix store; update both together.
export const products: Product[] = [
  {
    code: 'N001',
    slug: 'the-split-singlet',
    name: 'The Split Singlet',
    shortName: 'The Singlet',
    status: 'Just launched',
    inStock: true,
    tagline: 'Lightweight. Breathable. Built for everyday runs.',
    lines: [
      'Tested through real runs.',
      'Refined through repetition.',
      'Built for the days that don’t go to plan.',
    ],
    description:
      'Made for the in-between — the easy runs, the inconsistent weeks, and the steady return days. Soft-touch polyester–spandex blend that stays light on the body. Stretches with movement, dries quickly, and holds shape after repeated use.',
    price: 999.5,
    regularPrice: 1999,
    sizes: ['S', 'M', 'L'],
    variants: [
      {
        name: 'Black',
        swatch: '#111111',
        images: [
          {
            src: singletFront,
            alt: 'Black Novu running singlet, front view',
            label: 'Front',
            fit: 'cover',
            backdrop: WHITE,
            tone: 'light',
          },
          {
            src: singletBack,
            alt: 'Black Novu running singlet, back view with NOVU wordmark',
            label: 'Back',
            fit: 'cover',
            backdrop: WHITE,
            tone: 'light',
          },
          {
            src: singletShoulder,
            alt: 'Novu hexagon mark on the singlet shoulder at sunset',
            label: 'Detail',
            fit: 'cover',
            backdrop: BLACK,
            tone: 'dark',
          },
          {
            src: singletChest,
            alt: 'Close-up of the singlet chest with DRYRUN print',
            label: 'Fabric',
            fit: 'cover',
            backdrop: BLACK,
            tone: 'dark',
          },
        ],
      },
    ],
    details: [
      {
        title: 'Size & fit',
        items: [
          'Model height: 5′9″',
          'Relaxed athletic fit',
          'True to size',
          'Size down for a closer fit',
        ],
        table: {
          head: ['Size', 'Chest', 'Waist', 'Hip'],
          rows: [
            ['S', '34–35', '32–34', '34–36'],
            ['M', '36–37', '34–36', '36–38'],
            ['L', '38–39', '36–38', '38–40'],
          ],
        },
      },
      {
        title: 'Fabric & care',
        items: ['Lightweight technical fabric', 'Quick drying', 'Machine wash cold', 'Do not iron'],
      },
      {
        title: 'Intended use',
        items: ['Everyday runs', 'Warm weather training', 'Layering under shells'],
      },
    ],
    url: `${STORE_ORIGIN}/product-page/the-split-singlet`,
  },
  {
    code: 'N002',
    slug: 'the-daily-runners',
    name: 'The Daily Runners',
    shortName: 'The Socks',
    status: 'Out of stock',
    inStock: false,
    tagline: 'Crew-length running socks built for everyday miles.',
    lines: [
      'Built for long hours on your feet.',
      'Tested across distance and fatigue.',
      'Made to last through repetition.',
    ],
    description:
      'Made from a breathable polyester–nylon–spandex blend with light compression for a secure, comfortable fit. Designed to stay in place through runs, workouts, and long days on your feet.',
    price: 349.5,
    regularPrice: 699,
    sizes: ['XS/S', 'M/L'],
    variants: [
      {
        name: 'White',
        swatch: '#f4f2ec',
        images: [
          {
            src: socksWhitePair,
            alt: 'White Novu crew running socks, worn',
            label: 'On foot',
            fit: 'cover',
            backdrop: WHITE,
            tone: 'light',
          },
          {
            src: socksWhiteSingle,
            alt: 'White Novu crew running sock',
            label: 'Studio',
            fit: 'contain',
            backdrop: BLACK,
            tone: 'dark',
          },
        ],
      },
      {
        name: 'Black',
        swatch: '#111111',
        images: [
          {
            src: socksBlackPair,
            alt: 'Black Novu crew running socks, worn',
            label: 'On foot',
            fit: 'cover',
            backdrop: BLACK,
            tone: 'dark',
          },
          {
            src: socksBlackSingle,
            alt: 'Black Novu crew running sock',
            label: 'Studio',
            fit: 'contain',
            backdrop: WHITE,
            tone: 'light',
          },
        ],
      },
    ],
    details: [
      {
        title: 'Fit & feel',
        items: ['Crew length', 'Light compression through the midfoot', 'Snug fit without tightness'],
      },
      {
        title: 'Size chart',
        table: {
          head: ['Size', 'UK', 'US', 'EU'],
          rows: [
            ['XS/S', '3–7', '4–8 (M) · 5–9 (W)', '36–40'],
            ['M/L', '7–11', '8–12 (M) · 9–13 (W)', '41–45'],
          ],
        },
      },
      {
        title: 'Wash care',
        items: [
          'Machine wash cold, gentle cycle',
          'Mild detergent, no bleach or fabric softener',
          'Wash dark and light colors separately',
          'Tumble dry low or air dry flat',
          'Do not iron or dry clean',
        ],
      },
    ],
    faq: [
      {
        question: 'Are these socks good for long-distance running?',
        answer:
          'Yes. The Daily Runners are engineered for long-distance comfort with targeted cushioning, DryRun™ moisture-wicking, and an anti-blister seamless design. They stay supportive and breathable even during 10K, 15K and half-marathon training.',
      },
      {
        question: 'Can I use these running socks for gym sessions or other sports?',
        answer:
          'Absolutely. While designed as running socks, the arch compression and zonal ventilation make them ideal for gym training, football warm-ups, daily walking, and general athletic movement.',
      },
      {
        question: 'Do these socks help prevent blisters?',
        answer:
          'Yes. The seamless toe construction, moisture management and smooth interior significantly reduce friction, helping prevent hotspots and blisters during high-mileage sessions.',
      },
      {
        question: 'Are these socks suitable for everyday wear?',
        answer:
          'Definitely. They’re designed for performance but comfortable enough for daily use — from commuting and casual wear to light training days.',
      },
    ],
    url: `${STORE_ORIGIN}/product-page/daily-runners-white-running-socks`,
  },
];

export const freeDeliveryThreshold = 999;

export const productPath = (product: Product) => `/store/${product.slug}`;

export function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
