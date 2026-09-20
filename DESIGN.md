# NeuroSetu Design & Architecture (Dementia-Safe UX & i18n System)

## 1. Visual System & Design Tokens
All styling across the application consumes tokens defined in `src/styles/tokens.css`.
No hardcoded hex color values or random font sizes are permitted.

### Surfaces & Rhythm
- Flat surfaces with zero gradients or glassmorphism:
  - `--surface-page`: `#FAF8F4` (warm, natural eggshell background)
  - `--surface-card`: `#FFFFFF` (pure white high-contrast container)
  - `--surface-sunken`: `#F1EDE5` (alternating content sections)
  - `--border-hairline`: `#E2DCD0` (soft perimeter borders)
  - `--border-contrast`: `#1C1C1C` (high-contrast active states)

### Brand Inks & Colors
- `--color-muga`: `#D4AF37` (Assam Muga Silk Gold — Primary CTA buttons & active highlights)
- `--color-bamboo`: `#2D5A27` (Bamboo Forest Green — Success, complete states & confirmation)
- `--color-gamosa`: `#D32F2F` (Gamosa Red — Critical SOS & urgent alerts only)
- `--ink-primary`: `#1C1C1C` (ultra-high contrast primary text)
- `--ink-secondary`: `#4A453D` (readable secondary labels & meta info)

### Typography & Hierarchy
Local fonts packaged with `@fontsource` (zero CDN/Google Fonts reliance, strictly offline-first):
- **Base font family**: Inter, Source Sans 3, Noto Sans Devanagari, Noto Sans Bengali.
- **Hierarchy Scale**:
  - **Eyebrow**: 13px uppercase, letter-spacing `0.1em`, font-weight 700, `--color-muga` or `--ink-secondary`.
  - **H1 Headline**: 32px (Desktop) / 26px (Mobile), font-weight 700, line-height 1.25. (No trailing punctuation).
  - **Lead Paragraph**: 18px (Desktop) / 16px (Mobile), font-weight 400, line-height 1.5, `--ink-secondary`.
  - **Body Text**: 16px / 14px, font-weight 400.
  - **Patient Shell Base Text**: 26px minimum (with +4px / -4px font size scaling controls persisting in `localStorage`).

---

## 2. Cultural Motifs (2-Color Vector System)
Located in `public/assets/motifs/` and `src/assets/motifs/`.
All motifs are SVGs strictly using `#D4AF37` (Muga Gold) and `#2D5A27` (Bamboo Green), with optional red accents for Gamosa:
- `kingkhap.svg`: Traditional geometric diamond motif strip used as 6–8px solid header accent.
- `gamosa-border.svg`: Geometric weaving pattern strip for patient care separation.
- `dhol.svg`: Two-sided folk drum (Assamese Bihu / folk percussion).
- `pepa.svg`: Buffalo-horn flute.
- `gogona.svg`: Traditional bamboo jaw harp.
- `kopou.svg`: Foxtail orchid (Assam state flower).
- `majuli-ferry.svg`: Traditional Brahmaputra riverboat.

---

## 3. Global Language State & i18n Architecture

### Unified Language Contract
Language selection is managed by `src/i18n/I18nContext.jsx` and persists across the entire application:
- **IndexedDB Storage**: `neurosetu.settings.language` (Store: `settings`, key: `app_language`).
- **Synchronous Boot Cache**: `localStorage['neurosetu_lang']` is read synchronously during initial JS evaluation before React first paint to eliminate any English flash.
- **Document Attributes**: Automatically sets `document.documentElement.lang` and `document.documentElement.dir`.
- **CSS Script Font Stacks**: Dynamically applies `.script-bengali`, `.script-devanagari`, or `.script-latin` class to `<html>` and updates `--font-current`.
- **Voice Engine Synchronization**: Integrates directly with speech services to ensure Text-to-Speech (TTS) and Automatic Speech Recognition (ASR) default to the active global language.

### Supported North-East Languages & Locales
1. **English** (`en`)
2. **Assamese / অসমীয়া** (`as`)
3. **Bengali / বাংলা** (`bn`)
4. **Hindi / हिन्दी** (`hi`)
5. **Manipuri / Meitei / মৈতৈলোন্** (`mni`)
6. **Mizo / Lushai** (`lus`)
7. **Khasi** (`kha`)
8. **Garo** (`grt`)
9. **Bodo / बर'** (`brx`)

### Reusable `<LanguageSwitcher />` Component
- **`variant="clinical"`**: Compact 48px header dropdown or toggle pill with native script names rendered first.
- **`variant="patient"`**: Large 80px touch cards with native script names, large typography, and high-contrast selected state.

---

## 4. Shell Architecture & Dementia-Safe UX

### 1. `PatientShell`
- Single-task focused interface with minimal distractions.
- Minimum 80x80px interactive touch targets to accommodate age-related motor tremors.
- Dedicated SOS button requiring explicit confirmation dialog (no accidental panic triggers).
- Hidden Kiosk Exit: 3-second long-press on the Home button to exit back to clinical/auth view.

### 2. `ClinicalShell`
- High-density telemetry and triage dashboard for ASHA health workers and clinicians.
- 48px standard touch targets with fast navigation, offline sync counters, and battery status.
