# Pack 3 Final Consultant Review (Fable 5)

Reviewed: docs/pack3-editorial-prompt.md and docs/pack3-batch1-fable.txt to pack3-batch4-fable.txt, checked against data/occupations.json and scripts/build-occupation-data.mjs.
Date: 14 July 2026

## Verdict

**Blocked. Do not publish yet.** The writing itself is the strongest of the three packs: all 20 occupations clear 900 public words (generated range 900 to 1044), all related-role slugs resolve against the 60 live occupations with no dangling links, every licensed role carries a licensing FAQ, no em dashes anywhere, and the separation rules (retail vs store manager, BA vs supply chain, chef, cloud, cybersecurity, lab technician) all hold. What blocks publication is the build pipeline, which is currently corrupting source citations for the whole 60-occupation catalogue, plus a schema drift in task categories and horizons and a short list of editorial fixes.

## Blocking fixes (pipeline and data)

1. **Source remap bug corrupts citations sitewide.** `scripts/build-occupation-data.mjs` line 37 applies `pack2SourceMap` to every input after the first, including the four pack 3 files. Pack 3 already uses the master 14-source numbering, so its citations and source-library lines get shifted up by one. Result in the generated data/occupations.json: the sources table now has S3 as a duplicate of S2 (UAE Cabinet), SDAIA at S4, HRSD at S5, WEF at S6, ILO at S7, MIT at S8, and **PwC missing entirely**. Every pack 1 and pack 2 citation from S3 to S8 now resolves to the wrong source, and pack 3's PwC citations ([S8], used in project-manager, mechanical-engineer, pharmacist, dental-assistant, store-manager and business-analyst) resolve to the UAE government policies page. Fix: apply the remap only to the four pack2 input files, rebuild, then verify S1 to S14 in the JSON match the brief's source library exactly.
2. **Four task-category vocabularies in one dataset.** Batch 1 uses Planning/Documentation/Coordination style, batch 2 uses Automatable/Augmented/Human-led, batch 3 uses Automate/Augment/Human edge, batch 4 uses Cognitive routine/Cognitive non-routine/Manual/Interpersonal. The build script passes these through verbatim, while packs 1 and 2 use the live snake_case set (physical, technical, admin_processing, data_work, judgement, compliance, communication, supervision, customer_interaction). Batches 2 and 3 are worse than inconsistent: their "category" is really a risk band, duplicating the Base risk column. Normalise all 200 pack 3 task rows to the live category set before rebuild.
3. **Horizon vocabulary drift.** Pack 3 uses Now / 1-3 years / 3-5 years / 5+ years; packs 1 and 2 use 0-2y / 2-5y / 5-10y / 10y+. Any horizon filter or label on the site will now split into two systems. Pick one vocabulary and map the other.
4. **ISCO field inconsistency.** Batch 3 writes "ISCO-08 5223" in headings while batches 1, 2 and 4 write bare codes, so the JSON `isco` field is inconsistent with the pack 1 and 2 format ("ISCO-08 2142"). Also harmonise the verify flags on 2421: business-analyst has no `(verify)` while supply-chain-analyst 2421 does.

## Required editorial fixes (batch files)

5. **Word caps breached in three protection plans**, each with a bolted-on closing passage: bim-modeller (~137 words), medical-laboratory-technician (~144), physiotherapist (~133) against the 100-130 cap. Caution: physiotherapist totals exactly 900 words, MLT 905 and BIM 905, so trimming these plans drops all three below the 900-word gate. Trim the plans and add the cut material back as expanded FAQ answers or region text.
6. **British English.** Four instances of "toward" in batch 4: electrician risk interpretation and site-engineer related-role line, delivery-driver protection plan, security-guard protection plan. Change to "towards". Everything else is clean.
7. **Source misuse to correct.**
   - Business-analyst FAQ 2 cites [S2] for "keeps generating new public sector transformation work for analysts". S2 only announces the strategy's adoption. Recite as [S1] or [S9] and soften.
   - Cloud-engineer UAE application cites [S2] for "that adoption runs on locally hosted platforms". The residency clause is not in the source; keep the tag on the strategy clause only.
   - UI/UX outlook: "which the ILO's exposure research would classify as..." attributes a hypothetical to a source. Rephrase as a plain claim with [S6] on the underlying finding.
   - [S4] (a general HRSD labour-market article) is stretched to sector-specific claims: Saudisation quotas "across large parts of retail" (retail), management-seat restrictions (store-manager FAQ 4), participation in security roles, hospitality hiring (chef), transport platform work (delivery-driver). Soften each to general participation and localisation language, or add a sector source.
8. **Uncited country-specific claims to verify or soften** (plausible but bare, and the brief bans invented facts): Dubai BIM mandate "through municipality circulars" (BIM UAE), Balady platform and Saudi Building Code enforcement (architect Saudi), Estidama (architect UAE), the Saudi midday sun-work ban (HSE Saudi cites nothing while the UAE side carries S10), the "unified national health insurance exchange" (pharmacist and physiotherapist Saudi), and national smart-meter deployment (electrician Saudi). Verify each against a public source or generalise the wording.
9. **Repeated phrasing to vary before the similarity gate runs.** The SDAIA strategy appears in 16 of 20 Saudi applications (17 mentions), usually as the same closing "the national strategy accelerates digitisation" move; the HRSD localisation-and-mentoring sentence recurs in near-identical form in 8+ Saudi sections; "giga-projects" appears roughly 8 times; the PwC wage-premium sentence is recycled 4 times; and the risk-interpretation openers share one template ("a guide, not a verdict" / "estimates, not a forecast" / "exposure, not survival"). None is a verbatim FAQ repeat, but the Saudi sections are the biggest threat to the 0.35 pairwise similarity gate. Cut S3/S4 to the sections where they are load-bearing and rewrite the rest.
10. **Weak or inconsistent task risk ratings.**
    - Batch 3 pairs Low risk with 3-5 year horizons six times (retail task 9; store-manager tasks 3 and 9; business-analyst task 10; UI/UX tasks 2 and 10) while the other batches reserve Low for 5+ years. Decide the pairing rule and align.
    - Chef task 5 (HACCP records) Medium/Now understates; its own explanation says sensors already log automatically, matching the High/Now pattern used for HSE task 9 and PM task 2.
    - Cybersecurity task 6 (collect and map control evidence) Low is optimistic; GRC tooling automates evidence collection and comparable documentation tasks score Medium elsewhere. Move to Medium.
    - Electrician task 8 (Manual category, Medium risk) contradicts its explanation that the wrench time stays human; drop to Low or recategorise.
    - Supply-chain-analyst task 1 (High) argues in the same breath that local calibration still matters; Medium fits the explanation better.
11. **Minor consistency.** Batch 4 related-role reasons are capitalised full sentences while batches 1 to 3 use lowercase fragments; normalise. Batch 1 has no blank lines between sections (the parser copes, but keep one format). "Benchmark pay by emirate and sector rather than trusting one figure" (cloud UAE) reads like a leftover note; rewrite or cut. S7 (MIT Project Iceberg) is never cited by any pack 3 occupation; use it or drop it from the pack's library.

## What passed

- Related roles: all 60 slugs valid across all 20 occupations; no dangling links.
- Structure: 10 tasks and exactly 4 FAQs per occupation; UAE and Saudi sections are genuinely different everywhere, each with a country-specific rule or condition; every Gulf anchor from the brief is present.
- Separation rules: retail vs store manager share no tasks or FAQs; BA tasks name requirement artefacts and SCA tasks name supply artefacts; chef stays in production; cloud avoids developer and support tasks; cybersecurity avoids helpdesk; lab technician has no imaging tasks.
- No em dashes, no review markers, no employer names, no invented statistics, no certainty claims about individual careers.
- ISCO codes are correct where checkable (2161, 2144, 2262, 2264, 3212, 3251, 3434, 5223, 1420, 2421, 7411, 5414) and uncertain mappings carry `(verify)`.

## Strongest roles

1. **Cybersecurity Analyst**: the tier-based risk reading is the sharpest analytical frame in the pack, and the NCA ECC compliance floor gives both country sections real regulatory substance.
2. **Security Guard**: the control-room versus gate split is honest and specific, and the SIRA cadre card anchors licensing properly.
3. **UI/UX Designer**: the right-to-left Arabic moat argument is distinctive, regionally true and not recycled from any other role.
4. **Business Analyst**: the artefacts-versus-agreements framing is the best plain-language risk explanation in the pack.
5. **Electrician**: a genuinely trade-shaped analysis (paperwork wrapper vs the trade itself) rather than an office template transplanted onto site work.
6. **Delivery Driver**: honest about algorithmic management being the real pressure, which is more useful to the reader than a replacement scare.

Weakest of the twenty, for attention during fixes: physiotherapist (zero margin at 900 words plus an over-cap protection plan) and store-manager (leans on aphorism where its neighbours give evidence).

## Publication order

Fix items 1 to 4, rebuild, re-run the automated gates (word count, similarity, FAQ uniqueness, related-slug validation), then apply items 5 to 10 and rebuild again. Items in 11 can ride along with either pass.
