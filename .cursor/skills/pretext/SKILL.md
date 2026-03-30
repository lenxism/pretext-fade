---
name: pretext
description: Use the `pretext` library (github.com/chenglou/pretext) to measure text dimensions and predict text block heights without triggering DOM reflow. Use this skill whenever the user wants to: measure text height or width without touching the DOM, predict paragraph heights for virtual scrolling or masonry grids, manually lay out lines on Canvas/SVG/WebGL, implement "shrinkwrap" multiline containers, flow text around obstacles, or avoid layout shift from dynamic text loading. Also trigger when the user mentions `pretext`, `prepare()` / `layout()` in a text measurement context, or wants sub-millisecond height prediction on resize. Trigger even for partial use cases like "measure text without reflow" or "get line count for a paragraph".
---

# pretext — Text Measurement Without DOM Reflow

`pretext` is a browser library that predicts text block heights using canvas `measureText()` instead of DOM reads, eliminating reflow on the resize hot path.

**Install:** `npm install pretext` (no runtime dependencies)

**Import:**
```ts
import { prepare, layout, prepareWithSegments, layoutWithLines, walkLineRanges, clearCache, setLocale } from 'pretext';
```

---

## Core Mental Model: Two Phases

The entire API is built around separating expensive work (once) from cheap work (every resize).

| Phase | Function | Cost | When to run |
|-------|----------|------|-------------|
| 1 — Measure | `prepare()` / `prepareWithSegments()` | ~17ms / 500 texts | Once, when text first appears |
| 2 — Layout | `layout()` / `layoutWithLines()` / `walkLineRanges()` | ~0.10ms / 500 texts | Every resize / width change |

**Never call Phase 1 inside a resize handler.** Cache the `PreparedText` handle and only call Phase 2 there.

---

## Phase 1: Prepare

### `prepare(text, font)` → `PreparedText`
Normalizes whitespace, segments with `Intl.Segmenter`, applies glue rules, and measures via canvas. Returns an opaque handle — fastest option when you only need height.

```ts
const prepared = prepare('Hello world, how are you?', 'bold 16px Inter');
```

### `prepareWithSegments(text, font)` → `PreparedTextWithSegments`
Same as `prepare()` but exposes the underlying `segments` array. Required for `layoutWithLines`, `walkLineRanges`, and `layoutNextLine`.

```ts
const prepared = prepareWithSegments('Hello world, how are you?', 'bold 16px Inter');
```

**Font string rules:**
- Must be a valid CSS font shorthand: `'16px Inter'`, `'bold 16px/1.5 Inter'`, `'italic 14px Georgia'`
- Used as the cache key — be consistent. `'16px Inter'` ≠ `'16px  Inter'`
- Pretext cannot read computed `line-height` from the DOM. You must supply it separately.

---

## Phase 2: Layout

All Phase 2 functions take a `PreparedText` handle, a container width in pixels, and a line height in pixels.

### `layout(prepared, maxWidth, lineHeight)` → `LayoutResult`
Returns `{ height, lineCount }`. Fastest — no string allocation.

```ts
const { height, lineCount } = layout(prepared, 320, 24);
```

### `layoutWithLines(prepared, maxWidth, lineHeight)` → `LayoutResult & { lines: LayoutLine[] }`
Same as `layout()` but also materializes each line as a string with its pixel width. Requires `PreparedTextWithSegments`.

```ts
const { height, lines } = layoutWithLines(prepared, 320, 24);
lines.forEach(({ text, width }, i) => {
  ctx.fillText(text, 0, i * 24);
});
```

`LayoutLine` shape: `{ text: string, width: number }`

### `walkLineRanges(prepared, maxWidth, callback)` → void
Geometry-only walker — iterates lines without allocating strings. Callback receives `(startIndex, endIndex, lineWidth)`. Useful for shrinkwrap calculations.

```ts
let maxLineWidth = 0;
walkLineRanges(prepared, 9999, (start, end, w) => {
  if (w > maxLineWidth) maxLineWidth = w;
});
```

### `layoutNextLine(state)` (iterator pattern)
Low-level iterator for flowing text around obstacles (variable `maxWidth` per line). Use when each line can have a different available width.

```ts
const state = { prepared, cursor: 0, maxWidth: 300 };
while (state.cursor < prepared.segments.length) {
  const line = layoutNextLine(state);
  if (!line) break;
  // line: { text, width }
  // Update state.maxWidth for next line based on your layout logic
}
```

---

## Critical Requirements

1. **Explicit `lineHeight`** — Pretext never reads the DOM. You must pass the exact pixel value. Multiply `font-size` by `line-height` if needed (e.g., `16 * 1.5 = 24`).

2. **Cache `PreparedText`** — Never re-call `prepare()` in a resize handler. Store handles in a `Map`, component state, or module-level variable.

3. **Font string must match exactly** — The string is used as a Map key internally. Normalize it before passing (no extra spaces, consistent casing).

4. **Call `setLocale(locale)` on language switch** — The `Intl.Segmenter` is module-scoped. `setLocale('ja')` updates breaking rules (critical for CJK/Thai) and clears the cache.

5. **`layoutWithLines` and `walkLineRanges` require `prepareWithSegments`** — Passing a plain `PreparedText` handle to these will throw.

---

## Common Patterns

### Virtual scrolling / masonry — height prediction only
```ts
// Prepare once when items load
const handles = items.map(item =>
  prepare(item.text, '16px Inter')
);

// On every resize
const containerWidth = 600;
const lineHeight = 24;
const heights = handles.map(h => layout(h, containerWidth, lineHeight).height);
```

### Canvas / SVG rendering — manual line layout
```ts
const prepared = prepareWithSegments(text, '16px Inter');

// On resize
const { lines } = layoutWithLines(prepared, canvasWidth, lineHeight);
lines.forEach(({ text, width }, i) => {
  ctx.fillText(text, 0, i * lineHeight);
});
```

### Shrinkwrap — tightest container that fits multiline text
```ts
const prepared = prepareWithSegments(text, '16px Inter');

let tightest = 0;
walkLineRanges(prepared, Infinity, (_, __, w) => {
  if (w > tightest) tightest = w;
});
// tightest = minimum container width for natural wrap
```

### Obstacle avoidance — variable width per line
```ts
import { layoutNextLine } from 'pretext';

const prepared = prepareWithSegments(text, '16px Inter');
const state = { prepared, cursor: 0, maxWidth: 400 };

while (state.cursor < prepared.segments.length) {
  // Calculate available width for this line (e.g., avoiding a floated image)
  const availableWidth = getWidthAtY(currentY);
  state.maxWidth = availableWidth;

  const line = layoutNextLine(state);
  if (!line) break;
  renderLine(line.text, currentY);
  currentY += lineHeight;
}
```

---

## Cache & Locale Utilities

```ts
clearCache();           // Reset segmentMetricsCache — use after removing many fonts/texts
setLocale('ja');        // Update Intl.Segmenter locale + clear cache. Call on language switch.
setLocale('en-US');     // Default English rules
```

The internal cache is `Map<fontString, Map<segment, metrics>>`. Segments measured with `'16px Inter'` are shared across all `prepare()` calls using that font.

---

## Internationalization Notes

- **CJK** (Chinese, Japanese, Korean): Use `setLocale('zh')` / `setLocale('ja')` / `setLocale('ko')`. Pretext handles kinsoku shori (Japanese line-break rules) and CJK grapheme splitting.
- **Arabic / RTL**: Uses simplified bidi metadata via `prepareWithSegments()`. Punctuation clusters (colons, periods) are merged to match browser behavior.
- **Emoji**: Width correction is applied automatically in the measurement runtime.
- **Thai / complex scripts**: `Intl.Segmenter` handles word breaking; make sure locale is set correctly.

---

## Browser & Environment Notes

- **Browser only** — Uses `CanvasRenderingContext2D.measureText` and `Intl.Segmenter`. Not compatible with SSR/Node without a canvas shim.
- **Font loading** — Call `prepare()` only after your webfonts have loaded (use `document.fonts.ready`). If fonts load after `prepare()`, call `clearCache()` and re-prepare.
- **CSS `font-variant` / `font-feature-settings`** — Not supported in the font shorthand; canvas ignores them.

---

## Performance Checklist

- [ ] `prepare()` called once per text item, result cached
- [ ] `layout()` called in resize handler, not `prepare()`
- [ ] Font string is consistent (no trailing spaces, same casing)
- [ ] `lineHeight` passed as exact pixels, not `'1.5'`
- [ ] `setLocale()` called on language switch
- [ ] `clearCache()` called if many fonts or texts are dynamically removed
- [ ] Webfonts loaded before first `prepare()` call