# Plan: Make favorite_festival & favorite_food Required During Onboarding

## Context
Confirmed schema: patient onboarding lives in a single component, `PatientOnboardingModal.jsx`. Validation is inline React state (no Zod/Joi/Yup). Fields `favoriteFestival`/`favoriteFood` are **optional** — they default to `'Traditional Festival'`/`'Regional Food'` on save. They sit on step 4 "Cultural Anchors" which has no validation block in `handleNext`.

## Files & Lines (exact)

### 1. Form component (single source of truth)
`src/components/onboarding\PatientOnboardingModal.jsx`
- Lines 35-36: `formData` state init for `favoriteFestival`/`favoriteFood` (no change needed — keep as `''`, validation enforces).
- Lines 57-103: `handleNext()` — **no `step === 4` branch exists.** Must add validation block.
- Lines 111-177: `handleSaveProfile()`:
  - Lines 117-119: dailyRoutine validation pattern to mirror.
  - Lines 156-157: fallback defaults `formData.favoriteFestival.trim() || 'Traditional Festival'` — **remove fallback**, make these required before save.
- Lines 481-517: Step 4 JSX — `fav-festival`/`fav-food` inputs lack error-border styling and inline error rendering. Must mirror the pattern at lines 222-241 (name field): conditional className + `fieldErrors.xxx` `role="alert"` block.
- Lines 155-167: existing `onChange` pattern that clears errors (e.g. line 225-228) — apply to new inputs.
- Line 730-746: Next/Save button render — `step < maxSteps ? handleNext : handleSaveProfile`. Step 4 uses "Next →" (so validation runs in `handleNext`). The final step (5/6) Save also needs validation — add checks there as backstop.

### 2. Supabase DB schema
`supabase/schema.sql` lines 23-24: `favorite_festival TEXT`, `favorite_food TEXT` — already nullable TEXT. **No schema change strictly required** (frontend enforces). Optional: could add `NOT NULL` / `DEFAULT` for defense-in-depth. **Decision point:** keep nullable for backward compat with existing `DEFAULT_PROFILE` rows — leave as-is unless backend enforcement is requested.

### 3. IndexedDB defaults (reference only)
`src/db/indexedDb.js` lines 81-82: `DEFAULT_PROFILE` hardcodes values. Not on onboarding code path; leave unchanged (defaults still used for non-onboarding flows).

### 4. Backend
`backend/app/main.py`: no patient onboarding route exists. Supabase sync only via `syncManager.js` (maps telemetry, **not** patient_profiles). **No backend submission changes needed** — payload is assembled in `handleSaveProfile` and sent via IndexedDB → optional `onSave` callback in `App.jsx:1062-1076`.

## Decisions

- **Q:** Should the validation run on `handleNext` (step 4 → 5) or on Save?
  - **Recommended:** Do **both**. Add `step === 4` block in `handleNext` (primary, blocks forward nav), AND validate in `handleSaveProfile` as backstop (in case user is on step 4 and clicks Save directly when `maxSteps === 5` and `step === 4`... actually Save only renders at `step >= maxSteps`, so step 4 always shows "Next"). Add Save-time check anyway for safety/robustness.
- **Q:** Error messages — English only?
  - **Recommended:** Mirror existing bilingual pattern (Assamese + English), e.g. `প্ৰিয় উৎসৱ উল্লেখ নাই (Favorite festival is required)`. The task explicitly requires the English strings "Favorite festival is required" and "Favorite food is required" to render — bilingual form satisfies this.
- **Q:** Backend enforcement?
  - **Recommended: Out of scope** for this ticket — no backend route exists. Flag as a follow-up. Frontend + DB nullable is acceptable per the "Confirmed schema update" note, but confirm whether a future backend layer is planned.

## Acceptance Criteria
1. Step 4 (Cultural Anchors) cannot advance to step 5 unless both `favoriteFestival` and `favoriteFood` are non-empty (after trim).
2. Inline error message renders beneath each field with `role="alert"`: "Favorite festival is required" / "Favorite food is required".
3. Skipped-then-fixed: editing the input clears the error border and message (mirrors name-field behavior).
4. Save (`handleSaveProfile`) is blocked if either field is blank; `profileToSave.favoriteFestival`/`favoriteFood` carry the actual user input with **no** `'Traditional Festival'`/`'Regional Food'` fallback.
5. Existing steps (1,2,3,5,6) and default-profile flows are untouched — no regression.
6. Error border class `border-2 border-rose-400 bg-rose-50/30 ...` applied to both step-4 inputs when errored.

## Implementation Steps (for executing agent)
1. Add `step === 4` validation block inside `handleNext` (after `step === 3` block, ~line 87):
   ```js
   } else if (step === 4) {
     if (!formData.favoriteFestival.trim()) {
       errors.favoriteFestival = 'প্ৰিয় উৎসৱ উল্লেখ নাই (Favorite festival is required)';
     }
     if (!formData.favoriteFood.trim()) {
       errors.favoriteFood = 'প্ৰিয় খাদ্য উল্লেখ নাই (Favorite food is required)';
     }
   }
   ```
2. Add backstop validation in `handleSaveProfile` (after dailyRoutine check, ~line 119):
   ```js
   if (!formData.favoriteFestival.trim()) {
     errors.favoriteFestival = 'প্ৰিয় উৎসৱ উল্লেখ নাই (Favorite festival is required)';
   }
   if (!formData.favoriteFood.trim()) {
     errors.favoriteFood = 'প্ৰিয় খাদ্য উল্লেখ নাই (Favorite food is required)';
   }
   ```
3. Remove fallback defaults at lines 156-157:
   ```js
   favoriteFestival: formData.favoriteFestival.trim(),
   favoriteFood: formData.favoriteFood.trim(),
   ```
4. Update `fav-festival` & `fav-food` `<input>` className to conditional error styling (mirror lines 230-234) keyed on `fieldErrors.favoriteFestival`/`fieldErrors.favoriteFood`.
5. Add `onChange` error-clear logic to both inputs (mirror 225-228).
6. Add inline `role="alert"` error `<p>` blocks under each input (mirror 236-241).
7. Add `*` to both labels to signal required (matches labels at 219, 246, 276).
8. Run: `npx vitest run tests/components/PatientOnboardingModal.test.jsx tests/components/FormValidation.test.jsx`
9. Add/adjust tests for: empty festival + food → Next blocked + inline alert present; valid input → advances; Save blocked when blank.

## Risks / Non-Goals
- Removing the `|| 'Traditional Festival'` fallback changes behavior for any caller relying on a non-empty default. Audit `onSave` consumers in `App.jsx:1062-1076` — only assigns to `setPatientProfile`. Low risk.
- No Zod/Joi schema to migrate; validation is purely inline. If a schema library is introduced later, revisit.
- DB schema change not performed (deferred).

## Manual Test Steps
1. Open onboarding (initial signup or edit profile).
2. Fill steps 1-3 & 5-6, leave step-4 fields blank.
3. Click Next at step 4 → expect: no advance, both fields show rose border, two `role="alert"` messages appear beneath inputs.
4. Type into favorite festival → expect error + border clears.
5. Re-blank it, fill both → click Next → expect advance to step 5.
6. For non-initial-signup flow (maxSteps=5): at step 5, blank step-4 fields, click Save → expect blocked with same errors.
7. Complete full flow with valid festival/food → profile saved with actual values (no `'Traditional Festival'`/`'Regional Food'`), `onSave` fires, DB row created.
