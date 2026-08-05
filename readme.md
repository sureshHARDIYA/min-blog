# Suresh Kumar Mukhiya, PhD

Personal portfolio and academic website for Suresh Kumar Mukhiya, PhD. The site presents system architecture work, career trajectory, research publications, books, talks, technical stack, and contact information.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Formspree contact form
- Google reCAPTCHA support

## Main Routes

- `/` - Architecture and profile overview
- `/trajectory` - Career timeline
- `/research` - Books, research papers, and PhD thesis
- `/research/book/statistics-for-data-scientists-and-analysts`
- `/research/book/hands-on-exploratory-data-analysis`
- `/research/book/redux-quick-start-guide`
- `/research/book/hands-on-big-data-modeling`
- `/stack` - Technology stack
- `/connect` - Contact and collaboration form
- `/sitemap.xml` - Generated sitemap
- `/robots.txt` - Search engine crawl rules

## Local Development

Prerequisites:

- Node.js 18+
- pnpm 10+

Install dependencies:

```bash
pnpm install
```

Create `.env.local` from `.env.example` and fill in the values you use locally:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
NEXT_PUBLIC_FORMSPREE_ENDPOINT=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
```

Google Analytics is not currently wired in. If it is needed, add a GA4 measurement ID such as `G-XXXXXXXXXX` and mount the `gtag.js` scripts in `src/app/layout.tsx`.

## SEO

The site includes:

- descriptive metadata in `src/app/layout.tsx`
- route-level canonical metadata
- Open Graph and Twitter metadata
- `Person` and `WebSite` JSON-LD structured data
- generated `sitemap.xml`
- generated `robots.txt`
- clean public routes for research and book pages

After deployment, submit `https://skmukhiya.com.np/sitemap.xml` in Google Search Console.

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm test:lint
pnpm test:prettier
```

## Content Notes

- Main mock content lives in `src/services/api.ts`.
- Book markdown content lives in `src/content/books/index.ts`.
- Navigation and readable book slugs live in `src/types.ts`.
- Translations live in `src/i18n/translations.ts`.
- Footer links live in `src/components/Footer.tsx`.

## Deployment

Build the production app:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```
