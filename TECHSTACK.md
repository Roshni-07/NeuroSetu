# Tech Stack — NeuroSetu (Prototype Tier)

**Tier:** Prototype / Hackathon MVP
**Target:** SIH26003 selection round — must demo live, not just pitch
**Principle:** Minimal stack, but core loop must be real and repeatable. No fake demos on judged differentiators.

---

## 1. Stack Summary

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React + Vite | Fast dev loop, huge ecosystem, single codebase for patient UI + dashboard |
| PWA / offline shell | `vite-plugin-pwa` (Workbox under the hood) | Real Service Worker caching — required, judges test airplane mode |
| Styling | Tailwind CSS | Enforces consistent spacing/contrast tokens fast, no design system overhead |
| Local persistence | IndexedDB via `idb` library | Native browser offline storage, no backend dependency for core gameplay |
| Speech (ASR/TTS) | Bhashini REST APIs (Assamese/Manipuri primary) | Government-backed, free for hackathons via Udbhav/Sahyogi |
| Backend/DB | Supabase (Postgres + REST + Auth, free tier) | Zero-infra managed backend, replaces custom server |
| Sync mechanism | Browser Background Sync API → Supabase | Native browser capability, no custom queue/broker needed |
| Hosting (frontend) | Vercel | One-command deploy, PWA-friendly |
| Hosting (backend) | Supabase managed | No DevOps needed |
| Auth | Simple per-profile PIN | Sufficient for prototype; no OAuth/ABDM integration yet |

---

## 2. Must Actually Work (Judged Core Loop)

These are built for real. No scripting, no pre-recorded fakery. Test each live, in airplane mode where relevant, at least twice in a row before demo day.

| Feature | Real Implementation | Test Before Demo |
|---|---|---|
| Offline app load | Service Worker caches app shell + active game assets | Load app in airplane mode, confirm full functionality |
| Voice input | Live Bhashini ASR call (pick Assamese or Manipuri, go deep not wide) OR on-device keyword-spotting (~20 words) — choose ONE path | Run 5+ live voice attempts, confirm consistent recognition |
| Dynamic Difficulty Adjustment | Real rule-based logic: 2 consecutive errors OR >15s response latency → reduce difficulty tier | Trigger both conditions live, confirm UI responds correctly |
| Local persistence | Real IndexedDB writes, confirm data survives page reload | Reload mid-session, verify state restored |
| Sync to dashboard | Real Supabase push once connectivity returns | Demo offline → online transition, show dashboard update live |
| Reminiscence content | Curated real assets (Bihu imagery, folk audio clips) — no stock/Lorem placeholders | Visual review — nothing generic-looking |

---

## 3. Safe to Simulate (Roadmap-Framed, Not Faked as Live)

These are explicitly presented as roadmap/future scope in the pitch — never demoed as working live if they aren't.

| Feature | Demo Treatment |
|---|---|
| BLE Mesh / Wi-Fi Direct / SMS to ASHA | Static slide, framed as "Phase 2" |
| Voice prosody/sentiment biomarker analysis | Precomputed sample trend chart on dashboard — not live inference |
| Khasi / Mizo / Garo voice support | Mention as Bhashini-roadmap-dependent; don't attempt live (beta-accuracy risk) |
| Elderline (14567) SOS routing | UI shows intent flow ("Connecting to 14567...") without real telephony backend |
| Encryption at rest (SQLCipher-equivalent) | Named as v2 requirement in pitch; plain IndexedDB used now — no false security claims |

---

## 4. Explicitly Cut for This Tier

Not built, not mentioned as "done" — only referenced as future scale-tier scope if asked:

- Microservices / Docker / Kubernetes
- On-device NPU model quantization (IndicWav2Vec edge deployment)
- 40Hz GENUS sensory entrainment subsystem
- ABDM / Tele-MANAS system integration
- Native mobile app (iOS/Android) — PWA only

---

## 5. Effort Allocation Guidance

Time goes disproportionately into:
1. Offline reliability (Service Worker correctness)
2. Voice input loop (one language, done well)
3. DDA logic (this is the "AI" story — must be visibly reactive, live)

Time goes minimally into:
- Dashboard visual polish
- Additional language coverage
- Security/encryption hardening

**Rule:** If a feature can't be reproduced twice in a row live, it doesn't go in the demo path. Test the failure mode too — when ASR mishears, the errorless-learning UX should degrade gracefully on camera, since it will happen.
