# Nails by Sam

A single-page website for an independent nail artist. Plain HTML, CSS and JavaScript — no build step.

```
index.html     markup for every section
styles.css     design system + layout
script.js      nav, gallery filter, lightbox, design studio, form
assets/        photos (see below)
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Add the photos

Drop JPGs into an `assets/` folder next to `index.html` using these names:

| File | Used for |
| --- | --- |
| `hero.jpg` | large hero image |
| `featured-1.jpg` … `featured-3.jpg` | "Featured design" strip |
| `gallery-1.jpg` … `gallery-8.jpg` | gallery grid |

Any missing image falls back to a soft pink/lilac gradient, so the page never looks broken.
Square-ish photos around 1200px wide work best. Update the `alt` text in `index.html` to match each photo.

## Deploy

**Netlify** — drag the folder onto <https://app.netlify.com/drop>, or connect the repo with
build command empty and publish directory `.`. The contact form works automatically:
Netlify picks up `data-netlify="true"` and submissions appear under *Forms*.

**GitHub Pages** — push to a repo, then Settings → Pages → Source: `main` / `/ (root)`.
GitHub Pages cannot receive form posts, so the form falls back to opening the visitor's
email app with the request pre-filled.

## Before going live

- Replace `hello@nailsbysam.example` in `index.html` and `script.js` with the real address.
