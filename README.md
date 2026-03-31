# pretext-fade

A focused reading tool that fades away text you have already read, with smooth reflow powered by [@chenglou/pretext](https://github.com/chenglou/pretext).

Built as a practical, open-source demo of Pretext's sub-millisecond text measurement in a real UI.

## The idea

Text on the web is static. For readers with ADHD or anyone who loses their place in long content, a wall of text offers no sense of progress. pretext-fade changes that: lines you have read dissolve away, and the remaining content slides up to fill the gap. You only see what is left.

## How it works

1. On mount, Pretext measures every line of the article using `prepareWithSegments()` + `layoutWithLines()` via canvas, with zero DOM reflow.
2. When you dismiss a line (click or auto-play), Framer Motion fades it out with a subtle blur over 500ms.
3. `AnimatePresence` with `popLayout` removes the line from flow, and sibling lines glide into position via a physics-based spring.
4. On window resize, Pretext re-measures and re-wraps all lines in under 0.1ms.

## Interaction modes

- **Select** (default) -- Click or tap a line to fade it away.
- **Auto-play** -- Lines dissolve automatically at a configurable WPM pace. Press Space to pause.

Press `Escape` to reset all text.

## Stack

- [Next.js 16](https://nextjs.org) with App Router and TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [@chenglou/pretext](https://github.com/chenglou/pretext) for text measurement without DOM reflow
- [Motion](https://motion.dev) (Framer Motion) for opacity, blur, and layout animations

## Getting started

```bash
git clone https://github.com/lenxism/pretext-fade.git
cd pretext-fade
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Using the component

The core component is `<BurningText>`. Pass it an array of paragraph strings:

```tsx
"use client";

import dynamic from "next/dynamic";

const BurningText = dynamic(
  () => import("@/components/burning-text").then((m) => m.BurningText),
  { ssr: false }
);

const paragraphs = [
  "First paragraph of your article...",
  "Second paragraph...",
];

export default function Page() {
  return <BurningText paragraphs={paragraphs} />;
}
```

The component must be loaded with `ssr: false` because Pretext uses browser-only APIs (`CanvasRenderingContext2D`, `Intl.Segmenter`).

The text container should use a serif or readable font at `text-lg leading-relaxed` for the best line-breaking match between Pretext and the DOM.

## Project structure

```
src/
  app/
    layout.tsx          Root layout, fonts (Source Serif 4 + Inter), metadata
    page.tsx            Demo page with sample article
    globals.css         Tailwind v4 theme tokens
  components/
    burning-text.tsx    Orchestrator: wires Pretext, fade timing, controls
    text-layer.tsx      Per-line rendering with Framer Motion layout animations
    controls.tsx        Floating toolbar (mode toggle, speed slider, reset)
    header.tsx          Minimal top bar
  hooks/
    use-burning-text.ts State machine: tracks burning/hidden lines, auto-play timer
    use-pretext-layout.ts Pretext measurement + resize handling
  lib/
    pretext-engine.ts   Async wrapper around @chenglou/pretext
    reading-timer.ts    WPM-to-millisecond conversion
```

## Accessibility

- `prefers-reduced-motion`: blur transition is skipped, simple opacity fade only
- Keyboard: Space toggles auto-play pause/resume, Escape resets all text
- ARIA: toolbar and radio roles on controls, live region announces layout timing
- Touch: tap-to-dismiss works on mobile, controls are sized for touch targets

## Why Pretext matters here

Traditional DOM measurement (`getBoundingClientRect`, `offsetHeight`) forces synchronous layout reflow. For 500 text blocks, that is 30ms+ per frame. Pretext avoids this entirely by measuring via canvas and computing layout with pure arithmetic. The `layout()` phase runs in under 0.1ms for the entire article, which is what makes the smooth spring-based reflow possible at 60fps.

## License

[MIT](LICENSE)
