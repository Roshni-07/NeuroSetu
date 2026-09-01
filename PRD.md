# Product Requirements Document
## AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern India (NER)

**Version:** 1.0
**Status:** Draft
**Owner:** [Product/Team Name]
**Date:** August 31, 2026

---

## 1. Overview

An offline-first, voice-driven Progressive Web App (PWA) that delivers culturally localized cognitive stimulation games and memory assistance to elderly dementia and MCI patients across the North Eastern Region (NER) of India, while silently generating clinical telemetry for caregivers and ASHA workers.

## 2. Problem Statement

Elderly dementia patients in rural NER lack access to specialist neurological care (54% of NER neurologists sit in Guwahati alone), face severe connectivity gaps, and are alienated by existing cognitive-training apps — none of which support NER languages (Assamese, Bodo, Manipuri, Khasi, Mizo, Bengali) or NER cultural context. Caregivers and ASHA workers have no continuous, low-effort way to monitor cognitive decline between clinical visits.

## 3. Goals

### 3.1 Primary Goals
- Deliver a voice-first, offline-capable cognitive stimulation platform usable by elderly, low-literacy users with motor/visual decline.
- Support NER regional languages via Bhashini / AI4Bharat speech and translation infrastructure.
- Generate passive digital biomarkers (response latency, voice prosody, session frequency) to flag cognitive decline early.
- Bridge patients to caregivers and ASHA workers via low-bandwidth sync, without requiring patient effort.

### 3.2 Non-Goals (v1)
- Not a diagnostic/clinical-grade instrument (no medical claims); it is a therapeutic + triage-alert tool.
- Not a full conversational LLM chatbot — constrained keyword-spotting for core loop, cloud NLP only opportunistically.
- Not targeting urban, high-connectivity, English-fluent users as primary persona.

## 4. Target Users / Personas

| Persona | Description | Key Needs |
|---|---|---|
| **Elderly Patient** (65+, MCI/early dementia) | Rural NER resident, low/no literacy, speaks Assamese/Khasi/Mizo/Bodo/Manipuri/Bengali, limited smartphone experience, possible tremors/vision loss | Simple voice-first interaction, zero anxiety, culturally familiar content, works with no internet |
| **Family Caregiver** | Lives with or near patient, sometimes migrated out for work | Passive progress tracking, alerts on decline, low tech burden |
| **ASHA Worker** | Visits multiple rural households periodically | Bulk sync during visits, simple dashboard, prioritized alert list |
| **Regional Neurologist/PHC Staff** (secondary) | Based in urban hubs (e.g., Guwahati) | Aggregated triage data, ability to flag patients for follow-up |

## 5. Core Features (v1 Scope)

### 5.1 Language & Voice
- Bhashini-integrated ASR/TTS/NMT for Assamese, Bodo, Manipuri (Meiteilon), Bengali; beta-tier support for Khasi/Mizo with English/Hindi fallback.
- On-device constrained keyword-spotting model (~50 core words/numbers) for offline gameplay loop.
- Cloud Bhashini calls only for non-critical, richer interactions when network is available.

### 5.2 Cognitive Gameplay Engine
- Memory recall, attention, pattern recognition, daily-routine recall game modules.
- Reminiscence-therapy content: regional festivals (Bihu, Hornbill, Chapchar Kut), textile pattern matching (Puan, Naga shawls), folk music prompts, culinary sequencing tasks.
- Errorless-learning difficulty model: rule-based, deterministic DDA — silently reduces difficulty after 2 consecutive errors or >15s latency; no punitive feedback (no red X / buzzer).

### 5.3 Offline-First Architecture
- PWA with Service Workers (stale-while-revalidate caching of app shell + rotating game set).
- IndexedDB for local storage of scores, voice metrics, interaction logs.
- Background Sync API for silent, automatic telemetry upload when connectivity resumes.

### 5.4 Accessibility (WCAG 2.1 AA — gerontology-tuned)
- Sans-serif fonts, 16–18px minimum, 1.5x line height.
- Contrast ratio ≥4.5:1 (large text) / ≥7:1 (normal text).
- Touch targets ≥44×44px; navigation depth ≤3 levels; no hamburger menus, persistent labeled bottom nav.
- Dual-coding: every icon paired with text label + optional voice-over.

### 5.5 Digital Biomarker & Alert System
- Passive tracking: response latency trends, voice prosody/affect flattening, session frequency/withdrawal signals.
- Threshold-based alerts routed to caregiver/ASHA dashboard (not shown to patient directly).
- One-touch voice-activated SOS routing to Elderline (14567).

### 5.6 Caregiver / ASHA Dashboard (lightweight, separate surface)
- Patient list with alert prioritization.
- Trend view: cognitive scores, engagement, alert history.
- Sync status (last BLE/Wi-Fi Direct/SMS sync).

## 6. User Stories

### Patient
- As an elderly patient, I want to speak my answers instead of typing, so I can play without struggling with touch controls.
- As a patient with no internet at home, I want the app to work fully offline, so my daily routine isn't disrupted by network gaps.
- As a patient who gets a task wrong, I want the app to gently help me instead of showing a failure signal, so I don't feel anxious or ashamed.
- As a patient, I want games themed around festivals and food I know, so the experience feels familiar, not foreign.
- As a patient in distress, I want to say one phrase and get connected to a helpline, so I can get help without navigating menus.

### Caregiver
- As a caregiver living far from my parent, I want to see their engagement and mood trends remotely, so I know when to visit or intervene.
- As a caregiver, I want to be alerted only when something meaningfully changes, so I'm not overwhelmed by noise.

### ASHA Worker
- As an ASHA worker, I want patient data to sync automatically when I'm physically near the household, so I don't need reliable internet to collect data.
- As an ASHA worker, I want a prioritized list of patients showing decline, so I can plan home visits efficiently.

### Neurologist/PHC (secondary)
- As a regional neurologist, I want aggregated, triaged alerts, so I can allocate my limited time to patients who need it most.

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Core gameplay loop must load and respond with zero network dependency |
| Latency | On-device keyword spotting response <1s |
| Privacy | Local telemetry encrypted at rest (e.g., SQLCipher/IndexedDB encryption layer); personal identifiers isolated from clinical data |
| Reliability | App shell must load instantly regardless of connectivity state |
| Compatibility | Must run on low-tier Android devices/browsers common in rural NER |
| Sync | Delta-only sync payloads; SMS fallback for critical alerts when no data connectivity |

## 8. Technical Dependencies

- Bhashini APIs (ASR, NMT, TTS) — Udbhav/Sahyogi access.
- AI4Bharat open models (IndicWav2Vec, Indic-TTS, IndicTrans2) for local/offline fallback, quantized for edge deployment.
- PWA stack: Service Workers, IndexedDB, Background Sync API.
- Optional: BLE Mesh / Wi-Fi Direct for ASHA-device sync in fully offline households.

## 9. Success Metrics

### 9.1 Engagement & Adoption
- Daily active usage rate among enrolled patients (target: ≥60% of enrolled patients active ≥4 days/week).
- Session completion rate per game module (target: ≥75%).
- Voice-input success/recognition rate for supported languages (target: ≥85% for Assamese/Manipuri, ≥70% beta languages).

### 9.2 Clinical/Therapeutic Signal
- Reduction in self-reported/caregiver-reported agitation episodes over 8–12 week period.
- Stability or improvement in cognitive task scores across memory/attention/pattern modules over time.
- Early-alert precision: % of triggered alerts later confirmed relevant by ASHA/clinician follow-up.

### 9.3 Caregiver/System Health
- Sync success rate (telemetry delivered within X hours of connectivity window).
- Time-to-alert-acknowledgment by ASHA workers.
- Caregiver-reported reduction in care burden/stress (survey-based).

### 9.4 Technical
- Offline uptime: % of sessions completed with zero network dependency (target: 100% for core loop).
- Crash-free session rate (target: ≥99%).

## 10. Risks & Open Questions

- Khasi/Mizo/Garo ASR accuracy currently beta-stage — need fallback UX (Hindi/English/keyword-only mode) validated with real users.
- Elderly dysarthric speech may degrade recognition accuracy — requires local testing/tuning of keyword-spotting thresholds.
- Data privacy/consent design for continuous passive monitoring of vulnerable elderly users needs explicit review.
- Device availability/cost in target households — dependency on schemes like RVY for hardware access is aspirational, not guaranteed.
- No claim of diagnostic validity — messaging to caregivers/ASHA/clinicians must clearly frame this as a triage/support tool, not a medical device.

## 11. Out of Scope (v1)

- Full LLM-based open-domain conversation.
- Cloud-only architecture / continuous connectivity assumption.
- Support for languages outside Assamese, Bodo, Manipuri, Bengali (full), Khasi/Mizo (beta) at launch.
- Clinical-grade diagnostic certification.

---

*This document supports product planning only; it does not constitute medical device documentation or regulatory submission material.*
