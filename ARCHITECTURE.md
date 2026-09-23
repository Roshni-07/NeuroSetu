# NeuroSetu — Architecture

## Overview
We built NeuroSetu for a very specific problem: elderly dementia and MCI patients in Northeast India, most of whom live in places where internet just isn't reliable, and where care is actually delivered by ASHA workers, not clinics with wifi. So this doc isn't a generic "here's our tech stack" writeup — it's meant to explain the choices we made and why, given who's actually going to use this thing.

If you're a judge, a contributor, or future-us six months from now trying to remember why we did something a certain way, this is for you.

---

## Why Offline-First (and Not Just "Offline-Tolerant")

A lot of apps claim to "work offline" but really just mean they don't completely crash without wifi. We wanted something different — offline as the default, not the exception.

Here's how that plays out:

- Every game session writes straight to **IndexedDB** on the patient's device. No network needed at all to play.
- Once the device gets signal again, **Supabase** quietly syncs everything in the background. The patient or ASHA worker never has to tap a "sync now" button.
- In practice, this means an ASHA worker can walk into a village with zero signal, run a full patient session, and the data just catches up with the cloud whenever it can. No workflow interruption, no data loss.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Local storage | IndexedDB |
| Backend / DB | Supabase (PostgreSQL, Row-Level Security, RPC functions) |
| PWA layer | Workbox / Vite PWA plugin |
| Voice (current) | Microsoft Edge TTS |
| Voice (planned) | AI4Bharat Indic-TTS (offline fallback) for Assamese, Bodo, Manipuri, Bengali |
| Hosting | Vercel |

---

## Who Uses This, and How Access Is Split

We designed three separate experiences because a dementia patient, an ASHA worker, and a family member abroad have almost nothing in common in terms of what they need or how comfortable they are with technology.

- **Patient** — logs in with a simple 6-digit PIN. That's it. What they see afterward is deliberately bare: their game roadmap, nothing else. No menus to get lost in.
- **ASHA Worker / Caregiver Staff** — logs in with a username/password. They manage region content packs and decide which cognitive domains to focus a patient's care on.
- **Family** — has their own portal to upload memory photos, and (still being built) connect via click-to-call.

Trying to cram all three into one dashboard would have made the patient experience unusable. So we didn't.

---

## How the Difficulty Actually Adapts

We have 15 games covering memory, attention, language, and executive function. Each one has 10 difficulty levels, and the engine watches how the patient is doing in real time — if they're breezing through, it ramps up; if they're struggling, it eases off. The goal is keeping people in that sweet spot where they're challenged but not frustrated enough to quit.

There's also a daily assignment engine that picks 2–5 games per day based on where the patient is in their cognitive stage, instead of just cycling through a fixed list.

One thing we want to be upfront about: this is a **weighted heuristic**, not a trained machine learning model. We don't have real patient data yet to train anything on, so calling it "AI-powered" in the ML sense would be overselling it. It's adaptive and it works, but it's honest about what it is. Down the line, we want to move from one global score per patient to tracking mastery per game individually — that's on the roadmap, not built yet.

---

## Why the Content Feels Local, Not Translated

The games, the roadmap visuals, the little touches around festivals and food — all of it is built around NER identity from the ground up. It's not a Western cognitive-training app with the words swapped out. We treat this as a real feature, not decoration, because a patient is far more likely to actually engage with something that reflects their own world back at them.

---

## Data Flow (Simplified)

```
Patient device (offline)
   │
   ├─ Game state written to IndexedDB (instant, local)
   │
   └─ On connectivity restored:
         │
         ▼
   Supabase (PostgreSQL)
         │
         ├─ RLS ensures per-patient data isolation
         ├─ RPC functions handle sync + aggregation
         │
         ▼
   ASHA / Caregiver dashboard (reads synced data)
```

---

## What's Not Finished Yet (No Sugarcoating)

This is a hackathon build, still actively evolving, so here's where things genuinely stand:

- The Family Memory Vault is still mock/in-memory in parts — we're actively moving it to real, persistent uploads.
- Personalization is currently limited because we're tracking one global mastery score per patient rather than per game. That's next.
- Multilingual voice is partially there. Full coverage for Assamese, Bodo, Manipuri, and Bengali with offline TTS is in progress, not done.

---

## Roadmap

- Real-upload Family/Caregiver portal with click-to-call
- Per-game mastery scoring architecture
- Full multilingual voice layer with offline AI4Bharat Indic-TTS fallback
- Real-time early cognitive-decline signal reporting to ASHA workers
- Expanded onboarding fields for clinical precision (sex, dementia stage)

---

## The Bottom Line

Every technical decision here traces back to one thing: who's actually going to use this, and where. Unreliable internet, ASHA-worker-led care, and a cultural context that most cognitive-training apps completely ignore. The offline storage, the separated logins, the adaptive difficulty, even the decision not to oversell the AI — none of it is arbitrary. It's built around the reality on the ground, not around what would look impressive on a slide.
