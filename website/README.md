# Novu website

Marketing site and storefront for Novu: a pinned 3D sunrise hero, the brand
story, a store with a page per product, the In the In-Between journal, field
videos, and an "App coming soon" section with an email waitlist. Next.js 16 (App Router) + TypeScript, plain CSS
Modules, Lenis for smooth scrolling.

| Route | Page |
| --- | --- |
| `/` | Home |
| `/store` | The collection, lookbook, delivery info |
| `/store/[slug]` | One page per product (from `products` in `src/lib/site.ts`) |
| `/story` | Our Story |
| `/journal` | In the In-Between: stories from everyday athletes |
| `/journal/[slug]` | One story (from `posts` in `src/lib/journal.ts`) |

Checkout is not handled here. "Buy now" buttons go to the product's page on
the existing Wix store, which also hosts Novu Lab and the policy pages. The old
Wix blog URLs (`/blog`, `/blog/categories/…`, `/post/…`) redirect to the
journal (see `next.config.ts`), so shared links keep working once this site
serves thenovu.in.

## Run it

```sh
cp .env.example .env.local   # then fill in the Supabase values
npm install
npm run dev                  # http://localhost:3000
```

```sh
npm run build && npm start   # production build
npm run lint
```

## Where things live

| What | Where |
| --- | --- |
| Product names, prices, stock, specs, images | `src/lib/site.ts` (`products`) |
| Store / Novu Lab / blog / policy URLs | `src/lib/site.ts` (`STORE_ORIGIN`, `links`) |
| Home page sections | `src/app/page.tsx` |
| Store and product pages | `src/app/store/` |
| Product FAQ (shown on its page) | `products[].faq` in `src/lib/site.ts` |
| Our Story page | `src/app/story/page.tsx` |
| Journal stories (text, images, dates) | `src/lib/journal.ts`; images in `src/assets/journal/` |
| Colors, type scale, buttons | `src/app/globals.css` (`:root` tokens) |
| Waitlist server action | `src/app/actions.ts` |
| Photos, product shots, logo, medal | `src/assets/` |
| Field videos and their posters | `public/media/` |

**To add a story**, add an entry at the top of `posts` in `src/lib/journal.ts`.
The body is a list of blocks (paragraph, pull quote, statement, scroll-lit
passage, photo, closing line); see the `Block` type there.

**Prices and stock are hard-coded** to match the Wix store. When a price or
stock status changes on Wix, update `products` in `src/lib/site.ts` too.

**If this site replaces thenovu.in**, move the Wix store to a subdomain (for
example `shop.thenovu.in`) and change `STORE_ORIGIN`. Every store link uses it.

## Motion

All scroll-linked motion goes through one component, `src/components/ScrollFx.tsx`.
Add `data-scroll` to an element and it gets a `--p` CSS variable that runs from
0 to 1 as the element crosses the screen (`data-scroll="pin"`: through a tall
section whose child is `position: sticky`). The element's CSS module decides
what moves. Headings rise word by word with `<SplitText>`; blocks fade up with
`data-reveal`. With "reduce motion" turned on, smooth scrolling, pinning and
autoplay are all off.

The hero (`src/components/Hero.tsx`) is a layered scene: generated mountain
ridges (`src/components/hero/scene.ts`) plus the runner and ridge cut out of the
original hero photo (`src/assets/brand/runner-ridge.png`). Scrolling raises the
sun; the mouse tilts the layers.

## App waitlist (Supabase)

The waitlist form posts to a Server Action that inserts into
`public.app_waitlist` in the same Supabase project as the mobile app. The
migration lives with the app's other migrations:

```
mobile/supabase/migrations/20261014120000_create_app_waitlist.sql
```

Apply it once, either by pasting it into the Supabase dashboard's SQL editor,
or with the CLI from `mobile/`:

```sh
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Row level security allows inserts only, so signups can't be read through the
public API. View or export them from the dashboard (Table editor →
`app_waitlist`). Repeat signups get the same success message and are not
stored twice.

Environment variables (server-only, never sent to the browser):

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | Project URL, e.g. `https://abcd.supabase.co` |
| `SUPABASE_ANON_KEY` | The project's anon or publishable key |
| `SITE_URL` | Public URL of this site, for social preview links |

Without the Supabase values the form shows "The waitlist isn't open yet" and
logs the reason on the server.

## Deploy

Any Next.js host works. On Vercel, set the root directory to `website/` and
add the environment variables above.
