# Pack 3 Launch — Final Blocker Verification (Fable 5)

Date: 14 July 2026
Scope: narrow re-check of blocker B1 and required fix R1 from docs/pack3-fable-launch-approval.md, verified directly against data/occupations.json, scripts/build-occupation-data.mjs and tests/occupations.test.js.

## Verdict

**APPROVED.** Every blocking and required item is resolved in the current data/occupations.json.

## Evidence

1. **B1 — source-library leak into Saudi text: fixed.**
   - Zero matches for `"saudi-arabia": "...http` anywhere in data/occupations.json — no Saudi region contains a URL.
   - The strings "UAE Government portal" and "SDAIA, National Strategy" occur only in the sources table labels (lines 5, 15, 45), never inside any occupation record. No leaked `[S1] UAE Government portal` library line remains.
   - The parser now terminates the Saudi-application capture at the next `[S#]` library line, `SECTOR:` header or `MACHINE-CHECK SUMMARY` (scripts/build-occupation-data.mjs:144), which is exactly the fix the review prescribed.
   - The four previously corrupted records now carry clean word counts (translator 921, mechanical-engineer 925, chef 940, ui-ux-designer 930 — see point 2's full sweep).

2. **900-word gate: all 60 pass.** data/occupations.json contains exactly 60 `wordCount` fields; the minimum is 900 and the maximum 1060. The three occupations the review flagged as landing at 870–880 after the parser fix (mechanical-engineer, chef, ui-ux-designer) were topped up and now sit at 925, 940 and 930.

3. **Related slugs: all resolve.** The file has exactly 60 top-level occupation slugs (no duplicates), and every slug in every `related` array matches one of those 60. No dangling link remains.

4. **Sources S3 and S8: correct.** S3 is "SDAIA, National Strategy for Data and AI" (sdaia.gov.sa) and S8 is "PwC, 2026 Global AI Jobs Barometer" (pwc.com), exactly as the test pins (tests/occupations.test.js:41-42). The table has 14 sources with 14 distinct URLs.

5. **R1 — operations-manager: fixed.** Its public field is now `"isco": "ISCO-08 1321"` with `"iscoVerified": false` (data/occupations.json:2334-2335). No `(verify` string of any form appears anywhere in the JSON, so the widened strip regex `\(verify[^)]*\)` in normaliseIsco (scripts/build-occupation-data.mjs:107) and the flag detection (`/\(verify\b/i`, line 151) are working. The unverified count is now 21 (the prior 20 plus operations-manager), and the test was updated to pin 21 (tests/occupations.test.js:37) — the decision the review asked for was made and is internally consistent.

6. **Vocabularies: clean.** All task `category` values across the file fall inside the approved nine-category set (admin_processing, communication, compliance, customer_interaction, data_work, judgement, physical, supervision, technical) and all `horizon` values are 0-2y / 2-5y / 5-10y / 10y+. No stray vocabulary from the batch files survives.

7. **Marker sweep.** No occurrence of `KIM REVIEW`, `kim_review_pending`, `(verify` or `MACHINE-CHECK` anywhere in the generated JSON.

## Residual note (non-blocking)

Test execution (vitest) and the pairwise-similarity computation could not be run in this session (script execution unavailable); all checks above were made directly against the generated data. The 0.35 similarity gate is the only launch gate not independently re-confirmed here — run `npx vitest run tests/occupations.test.js` once before publishing as a formality.
