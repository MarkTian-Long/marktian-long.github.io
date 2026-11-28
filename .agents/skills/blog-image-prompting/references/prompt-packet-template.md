# Visual Prompt Packet

版本：1.1｜更新：2026-11-28

> One file per article: `tools/blog/visual-prompts/<slug>.md`  
> Production record only; not article body content and not a public website asset. The repository is public: do not put confidential information here.  
> **Never send this whole file to image_gen. Select only one image block's Final Prompt.**

## Article identity

- Article title:
- Article slug:
- Repository:
- Branch:
- Unique draft path:
- This Prompt Packet:
- Current preview URL:
- Packet status: Draft / In progress / Complete
- Session mode: One clean new session per article; sequential one-image-at-a-time.
- Existing hero / source assets to retain:
- Shared visual anchor (2–4 invariants only):
  - Medium/material:
  - Palette:
  - Lighting:
  - Graphic language:

## Session queue (orchestration only; never send as image content)

| Order | Image block ID | Current source asset | Intended final asset | Status |
|---|---|---|---|---|
| 1 | Image 01 |  |  | Draft / Active / Accepted |
| 2 | Image 02 |  |  | Draft / Queued / Accepted |
| 3 | Image 03 |  |  | Draft / Queued / Accepted |

---

## Image 01 — <asset-name>

- Status: Draft / Ready / Active / Generated / Accepted / Rejected
- Current source asset:
- Intended final asset:
- Insertion position:
- Reading task (one sentence):
- Single visual proposition (one sentence):
- Local context (maximum two sentences; include only what this image needs):
- Required subjects / relationships:
- Exact labels or numbers (only if necessary):
- Evidence boundary (facts / metaphor / prohibited invention):
- Composition and aspect ratio:
- Reference images and their roles (style / subject / edit target):
- Final Prompt (this block alone is sent to image_gen):
- Actual Prompt echo (the exact text submitted in the current session):

> <Use 1–3 clear sentences for a simple image. Use a short structured specification only for a complex diagram.>

- Attempt log:
  - Attempt 1: date / actual output / pass-fail / failure class (A/B/C) / specific defect
  - Attempt 2 (only if justified): one change / output / pass-fail / failure class (A/B/C)
- Final decision: Accept / Rework / Reject
- Review record: hard gate / visual score / semantic gate / asset gate / page gate

---

## Image 02 — <asset-name>

Copy the Image 01 block for another independent image task. Keep all image blocks in this one Packet, but never send the entire Packet to image_gen. The same new article session handles each block sequentially; only the active block is used for the current generation.
