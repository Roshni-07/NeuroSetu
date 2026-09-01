# Design Doc: NeuroSetu
## Visual & Interaction Design Language

**Version:** 1.0
**Date:** August 31, 2026
**Reference sites analyzed:** vibemeai.net, senthora.ai

---

## 0. Methodology Note

Analysis was done via structural/content fetch of both sites (HTML, meta tags, layout hierarchy). No live screenshot/render capability was available in this session — color values below are drawn from one confirmed source (Senthora's `meta-theme-color: #110F14`) plus pattern inference from layout structure, badge/CTA conventions, and copy tone typical of this "premium AI app" category. Anything not directly confirmed is marked **[inferred]**. Recommend a manual visual pass (screenshots) before locking a final palette.

---

## 1. Reference Site Analysis

### 1.1 VibeMe AI (vibemeai.net)
- **Category:** AI music video/creative generation tool.
- **Layout pattern:** Hero-first single-column landing, large headline + subcopy, prominent gradient CTA button ("Create for Free"), horizontal social-proof strip (ratings, view counts, follower counts) directly under hero.
- **Navigation:** Icon-grid mega-nav — many small feature icons (Storyboard MV, Singing Video, Lip Sync, etc.) laid out in a dense row, signaling a multi-tool platform rather than single-purpose app.
- **Component style [inferred]:** Card-based tool grid, badge/pill social-proof stats, rounded CTA buttons, dark-canvas creative-tool aesthetic common to this app category (video/AI generation tools skew dark to make colorful media thumbnails pop).
- **Tone:** High-energy, creator/youth-oriented, social-platform-integrated (TikTok/YouTube/Instagram icons everywhere).

### 1.2 Senthora (senthora.ai)
- **Category:** Voice-first AI language tutor (mobile app marketing site).
- **Confirmed color:** `#110F14` — near-black, slightly warm dark background (theme-color meta tag).
- **Layout pattern:** Phone-mockup-led hero ("app in hand" imagery), numbered step sequence (01–04) for onboarding explanation, feature cards with single supporting screenshot each, "Under the Hood" tech-credibility strip (OpenAI / ElevenLabs / Azure logos).
- **Typography/tone [inferred]:** Short, plain-spoken headlines ("Stop studying. Start speaking."), sentence-case not title-case, conversational microcopy, minimal jargon.
- **Component style:** Numbered step cards, small feature-icon tiles (6-up grid), horizontal logo trust-bar, App Store/Google Play badge pairs repeated at multiple scroll points, QR-code footer for install.
- **Structure:** Strong "how it works → signature features → full feature grid → tech credibility → pricing → FAQ" narrative arc — a trust-building funnel rather than a feature dump.

### 1.3 Shared Design DNA
| Element | Pattern |
|---|---|
| Background | Dark canvas, near-black |
| CTA | High-contrast gradient or solid pill button, repeated at multiple scroll depths |
| Proof | Logos/badges (app stores, AI model partners, social platforms) used as trust signals |
| Structure | Step-by-step narrative (how it works) before feature dump |
| Imagery | Device mockups / in-context screenshots over abstract illustration |
| Microcopy | Short, benefit-first, conversational |

---

## 2. Critical Adaptation Warning

**The dark, high-density, gradient-heavy aesthetic above is not directly usable for NeuroSetu's core in-app experience.** NeuroSetu's primary users are elderly dementia/MCI patients requiring WCAG 2.1 AA (gerontology-tuned): high contrast (≥7:1 normal text), large touch targets (≥44×44px), minimal navigation depth, zero visual clutter, no anxiety-inducing failure states.

**Resolution: split the design system into two distinct surfaces.**

1. **Marketing/Landing Site** (public-facing, caregiver/ASHA/judge audience) — may adopt the VibeMe/Senthora premium-AI-app language fairly directly: dark theme, gradient CTAs, tech-credibility strip, step-by-step "how it works," device mockups.
2. **In-App Patient Experience** — inherits only the *structural discipline* (clear hierarchy, step-based flows, trust badges) but inverts the visual language: light/high-contrast theme, large flat buttons, no gradients on interactive elements, no dense icon grids.

This doc covers both, explicitly separated.

---

## 3. Color Palette

### 3.1 Marketing Site (Senthora/VibeMe-inspired)
| Token | Value | Use |
|---|---|---|
| `--bg-canvas` | `#110F14` (confirmed from Senthora) | Page background |
| `--surface-card` | `#1B1820` **[inferred]** | Cards, feature tiles |
| `--accent-primary` | Warm gradient, amber→teal **[inferred — to be finalized]** | CTA buttons, highlights (tie to NER cultural motif: sunrise/textile colors rather than generic purple/blue SaaS gradient) |
| `--text-primary` | `#F5F3F0` | Headlines |
| `--text-secondary` | `#A8A2AE` | Subcopy |

### 3.2 In-App Patient Experience (WCAG-AA, elderly-tuned — departs intentionally from reference sites)
| Token | Value | Use |
|---|---|---|
| `--bg-canvas` | `#FFFFFF` / `#FAF8F4` (warm off-white) | Primary background — dark UI rejected for this surface due to glare/contrast issues common in low-vision elderly users |
| `--text-primary` | `#1A1A1A` | Body/headline text, contrast ratio 15:1+ |
| `--accent-primary` | Single solid, high-contrast color (e.g., deep teal `#0B6E6E` or terracotta `#B5502E` — sourced from regional textile palettes, not generic tech-blue) | Primary action buttons only, no gradients |
| `--success-soft` | Muted green | Gentle positive feedback (never harsh/saturated) |
| `--error-avoid` | *No red "X" or buzzer-red used anywhere* | Per errorless-learning requirement — failure states use neutral/hint color, never alarm red |

---

## 4. Typography

| Surface | Typeface direction | Notes |
|---|---|---|
| Marketing site | Modern geometric sans (mirroring Senthora's clean, short-headline style) **[inferred]** | Sentence-case headlines, short benefit statements |
| In-app patient UI | Sans-serif, minimum 16–18px body / 24px+ for primary prompts, 1.5x line height | Must render Devanagari, Eastern Nagari, Meitei Mayek, and Romanized Khasi/Mizo cleanly — verify font supports all scripts before final selection (e.g., Noto Sans family for multi-script coverage) |

---

## 5. Layout & Component Patterns to Reuse

From reference sites, adapted for NeuroSetu:

1. **Numbered step sequence (Senthora "01–04")** → reuse for onboarding: "Set language → Choose game → Speak naturally → Get gentle feedback."
2. **Tech-credibility strip (Senthora "Under the Hood")** → reuse on marketing site: Bhashini / AI4Bharat / MDoNER logos as trust signals.
3. **Feature tile grid (6-up, Senthora)** → reuse on marketing site for feature overview; **do not reuse in-app** (too dense for patient navigation, which must stay ≤3 nav levels with large single-focus screens).
4. **Repeated CTA at multiple scroll depths (both sites)** → reuse for marketing site caregiver conversion ("Get the App" repeated).
5. **Icon-grid mega-nav (VibeMe)** → explicitly avoid in-app; acceptable only in ASHA/caregiver dashboard where users are literate, tech-comfortable, and navigating many patient records.

---

## 6. Voice & Tone

Borrow Senthora's plain-spoken, non-jargon microcopy convention:
- Marketing: benefit-first, short ("Cognitive games that speak your language.")
- In-app patient-facing copy: warm, first-person-adjacent, never clinical or alarming ("Let's try that again together" — not "Incorrect. Retry.")

---

## 7. Open Items Before Final Lock

- Take actual screenshots of vibemeai.net and senthora.ai to verify exact hex values, spacing scale, and font-family (this doc used structural/meta-tag inference only).
- Validate chosen accent colors against NER textile/cultural palettes (Bihu, Puan, Naga shawl motifs) rather than defaulting to generic tech blue/purple gradients.
- Confirm font stack renders all required NER scripts (Assamese/Bengali Eastern Nagari, Meitei Mayek, Romanized Khasi/Mizo) before finalizing typography token.
- Usability-test the in-app light/high-contrast theme with actual elderly users — do not assume dark-mode aesthetic preference from reference sites carries over.

---

*Design language for marketing surface is aspirational/reference-inspired. In-app patient experience design is constraint-driven (clinical/accessibility requirements override aesthetic trends) and should be treated as the higher-priority spec.*
