# Pack 3 Launch Re-Review (Fable 5)

Re-reviewed: docs/pack3-batch1-fable.txt to pack3-batch4-fable.txt, scripts/build-occupation-data.mjs, tests/occupations.test.js and data/occupations.json against every blocking and required item in docs/pack3-fable-final-review.md.
Date: 14 July 2026

## Verdict

**NOT APPROVED. One new blocking pipeline bug.** Every item from the prior review is now fixed, but the parser change introduced a content-corruption bug that leaks the raw source library into the public text of four occupations and props up three word counts that would otherwise fail the 900-word gate. Fix the parser, patch three short Saudi/UAE sections, rebuild, re-run the gates, and this pack is ready.

## Prior items: all resolved

1. **Source remap (was blocking).** Fixed. The remap now applies only to `pack2-*` inputs. The generated sources table S1 to S14 matches the master library exactly, PwC is back at S8, and the test suite pins S3 (SDAIA) and S8 (PwC) plus 14 unique URLs.
2. **Task categories (was blocking).** Fixed at build level. All 600 task rows in data/occupations.json use only the live nine-category set; the batch vocabularies (Planning/Documentation, Automatable/Augmented/Human-led, Automate/Augment/Human edge, Cognitive routine/Manual/Interpersonal) are mapped in `normaliseCategory`.
3. **Horizons (was blocking).** Fixed. Every generated horizon is 0-2y / 2-5y / 5-10y / 10y+, and Low-risk tasks are uniformly forced to 10y+, which also resolves the batch-3 Low-with-3-5-years inconsistency.
4. **ISCO formatting (was blocking).** Fixed for pack 3. All 20 records emit `ISCO-08 NNNN`, `(verify)` flags are stripped from the public field, business-analyst 2421 now carries `(verify)` in step with supply-chain-analyst, and exactly 20 records are unverified as the test expects.
5. **Protection plan word caps.** Fixed. bim-modeller (~109 words), medical-laboratory-technician (~107) and physiotherapist (~108) are inside the 100-130 cap, with the trimmed material re-homed in FAQ answers, and all three still clear 900 words.
6. **British English.** Fixed. No instance of "toward" remains; no other Americanisms found (remaining "Labor" hits are the official HRSD source title and substrings of "laboratory"/"collaborate").
7. **Source misuse.** Fixed. BA FAQ 2 now cites [S1]; cloud-engineer UAE scopes [S2] to the strategy clause only; the UI/UX ILO attribution is rephrased as a plain claim; the [S4] sector-specific stretches (retail quotas, store-manager seats, security participation, chef hospitality, delivery platforms) are all softened to general participation-and-verification language.
8. **Uncited country claims.** Fixed. Municipality circulars, Balady, the Saudi Building Code by name, Estidama, the Saudi midday ban, the national insurance exchange and national smart-meter deployment are all generalised or removed.
9. **Repetition.** Materially improved. Saudi-section S3 citations are cut back, giga-projects drops to 5 mentions, the PwC wage-premium sentence to 3, and the risk-interpretation openers now vary. Final confirmation rests on the similarity gate (see below).
10. **Task ratings.** Fixed. Chef HACCP is High/Now, cybersecurity evidence-mapping is Medium, electrician task 8 is Low, supply-chain-analyst task 1 is Medium.
11. **Minor consistency.** Fixed. Batch-4 related-role reasons are lowercased in the build, the "benchmark pay by emirate" leftover is gone, and S7 (MIT Project Iceberg) remains in the library because pack 1 occupations cite it legitimately.

## New blocker

**B1. The next batch file's source library leaks into public Saudi text.** Each pack 3 batch file opens with the 14-line source library, and pack 3 files carry no `MACHINE-CHECK SUMMARY` terminator. The Saudi-application regex in `scripts/build-occupation-data.mjs` therefore runs past the end of the previous file and swallows the following file's entire library into the last occupation's `regions.saudi-arabia`. Four records are corrupted in data/occupations.json: **translator (order 40), mechanical-engineer (45), chef (50), ui-ux-designer (55)** — each ends with the full 14-source list, URLs included, in reader-facing text. Knock-on damage:
   - `sourceKeys` for those four falsely claim S7 and S11 to S14.
   - Word counts are inflated by roughly 150 words each. Corrected, **mechanical-engineer, chef and ui-ux-designer land at roughly 870 to 880 words — below the 900-word launch gate**. They pass today only because of the leaked text. Each needs about 25 to 35 words of genuine content once the parser is fixed.
   - An identical ~150-word block repeated across four pages is a duplicate-content and pairwise-similarity risk.
   - Fix: strip `^\[S\d+\] ... : http...` library lines from every input after the first (or add `\r?\n+\[S\d+\]` as a terminator in the Saudi-application regex), rebuild, and confirm no `[S1] UAE Government portal` string remains inside any occupation record.

## Required (non-blocking) fix

**R1. operations-manager (pack 2) leaks a review marker.** Its public field is `"isco": "ISCO-08 1321 (verify, varies by industry)"` with `iscoVerified: true`. The annotation evades both `normaliseIsco` and the marker test because neither matches `(verify,` with a trailing comment. Clean the heading in the pack 2 source (or widen the strip regex to `\(verify[^)]*\)`), and decide whether the record should count as unverified — note the test currently pins unverified at exactly 20.

## Gates not executed

Test execution (vitest) and the pairwise-similarity computation could not be run in this sandboxed review session. Structure, categories, horizons, ISCO, word counts, related-slug resolution (all 60 slugs valid, ≥3 live links everywhere) and marker absence were verified directly against data/occupations.json instead. After fixing B1 and rebuilding, run `npx vitest run tests/occupations.test.js` and confirm all seven gates pass, paying attention to the 900-word and 0.35-similarity gates.

## Publication order

Fix B1 in the build script, top up the three short occupations, rebuild, run the test suite, then apply R1 and rebuild once more. No other changes needed.
