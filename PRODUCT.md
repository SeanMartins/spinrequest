# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Guests at a party/event** who scan the DJ's QR code on their phone, in the dark, often one-handed, and request a song (search Spotify/Amazon/YouTube or type it), optionally tip via PayPal, suggest/vote songs for a collaborative playlist, save the DJ's contact.
- **DJs (customers of SpinRequest)**: during a gig they watch the live request queue and mark songs played; between gigs they manage events, calendar, analytics, profile, and the agenda of work enquiries with quotes (PDF) sent to clients.
- **DJ's clients** (event organisers, couples, companies) who open an online quote page (`cliente.html`) and respond.

## Product Purpose
Connect the audience with the DJ during the event (song requests, tips, playlist) and run the DJ's business around it (events, analytics, enquiries, quotes, public profile, business card). Success: guests request in seconds; the DJ handles the queue at a glance mid-set; enquiries turn into accepted quotes.

## Positioning
One link/QR per event: no app install for guests, live queue for the DJ, and the DJ's booking pipeline (agenda, quotes, client page) in the same product.

## Operating Context
- Guest page: dark venues, loud, phone brightness varies, quick interaction, many languages (EN, IT, FR, DE, ES, PT).
- DJ live panel: phone/tablet beside the decks in low light, glanced at between transitions.
- Agenda/quotes: desk or phone, daytime, office-style work.

## Capabilities and Constraints
- Static HTML pages + vanilla JS, Firebase compat SDK 9 from gstatic (Auth, Firestore, Storage), Vercel functions `api/search.js` (iTunes search proxy) and `api/calendar.js`. No build step; must stay that way.
- Pages: `index.html` (DJ app: login, home, events, live queue, QR, analytics, playlist, settings), `guest.html`, `agenda.html` (enquiries, quotes, messages, price list, stats, PDF via jsPDF), `cliente.html` (client quote), `profile.html` (public DJ profile), `biglietto_dj.html` (printable card).
- Multi-language UI strings live in the pages' JS.

## Brand Commitments
- Product name: SpinRequest. Each DJ's own name, photo and links appear on guest/profile/client pages.
- "Two souls": guest-facing pages have nightlife character; DJ management pages (agenda, quotes, analytics) are sober and precise.

## Evidence on Hand
- `logo.png`, `dj-logo.svg`, `icon-192.png`, `icon-512.png`. No testimonials or usage numbers; never fabricate them.

## Product Principles
1. A guest goes from scan to sent request in under 15 seconds.
2. The DJ reads the queue at arm's length in the dark.
3. Business pages look like a professional's tools, not a party flyer.
4. Never lose a request or a quote; status is always explicit.

## Accessibility & Inclusion
Low-light, one-handed phone use: large targets, high contrast, no information by color alone; six languages.
