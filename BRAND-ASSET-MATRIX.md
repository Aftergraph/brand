# Aftergraph Brand Asset Matrix

Canonical scope for public, product, research, documentation, community, and motion surfaces.

## Core identity

| Asset | Source | Required exports | Primary use |
|---|---|---|---|
| Monogram | `svg/aftergraph-monogram.svg` | SVG, 1024 PNG, 512 PNG | avatar, app, favicon |
| Wordmark | `svg/aftergraph-wordmark.svg` | SVG, transparent PNG | navigation, documents |
| Horizontal lockup | `svg/aftergraph-lockup-horizontal.svg` | SVG, transparent PNG | headers, partners |
| Stacked lockup | `svg/aftergraph-lockup-stacked.svg` | SVG, transparent PNG | covers, event signage |
| App icon | `svg/aftergraph-app-icon.svg` | 1024, 512, 192 PNG | PWA and launcher |
| Favicon | `svg/favicon.svg` | SVG, ICO, 32/16 PNG | web properties |

## Digital surfaces

| Surface | Asset | Canonical size |
|---|---|---:|
| aftergraph.org | `social/og-aftergraph.svg` | 1200 x 630 |
| Work Intelligence | `social/og-work-intelligence.svg` | 1200 x 630 |
| Documentation | `social/og-docs.svg` | 1200 x 630 |
| GitHub organization | `social/github-org-banner.svg` | 1280 x 640 |
| X / LinkedIn launch | `social/social-post-square.svg` | 1080 x 1080 |
| X profile header | `social/x-header.svg` | 1500 x 500 |
| LinkedIn company cover | `social/linkedin-cover.svg` | 1128 x 191 |
| YouTube | `social/youtube-banner.svg` | 2560 x 1440 |
| Desktop wallpaper | `wallpaper/aftergraph-4k.svg` | 3840 x 2160 |

## Editorial and product

- `editorial/research-cover.svg` — research papers and standards drafts.
- `editorial/spec-cover.svg` — specifications and RFC-style documents.
- `product/verified-seal.svg` — verified evidence state, never a certification claim.
- `product/evidence-pattern.svg` — repeatable technical background.
- `product/empty-state-no-evidence.svg` — evidence unavailable.

## Motion

`motion/MOTION-SYSTEM.md` defines a six-second brand ident, 12-second product reveal, transition grammar, accessibility behavior, and Higgsfield production prompts. Motion must communicate state: graph formation, bounded authority, execution, evidence, verification.

## Export rules

1. SVG is canonical for identity, diagrams, and graphic layouts.
2. PNG exports use sRGB, transparent backgrounds where applicable, and no embedded metadata beyond creator/tool.
3. Social exports must keep critical text inside a 7.5% safe area.
4. No generated raster may redraw or mutate the monogram. Composite the canonical SVG after generation.
5. Never use the verified seal as third-party accreditation or imply external validation.

