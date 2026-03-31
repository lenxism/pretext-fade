"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/header";

const BurningText = dynamic(
  () => import("@/components/burning-text").then((m) => m.BurningText),
  { ssr: false }
);

const PARAGRAPHS = [
  "There are two ways to read on the internet. The first is to read everything, all the time, hoping to keep up with the constant flow of information. The second is to read less, but better, choosing what deserves your attention and engaging with it fully.",
  "Most of us practice the first approach by default. We open dozens of tabs, skim through articles, and rarely finish what we start. The result is a strange paradox: we consume more words than ever but retain less meaning.",
  "The problem isn't willpower. It's that our reading environment works against us. Text sits static on the page, demanding nothing and offering no sense of progress. For anyone with attention differences, a wall of text can feel like standing at the base of a mountain with no trail markers.",
  "What if reading felt more like walking through a room? Each paragraph a doorway you pass through, the space behind you clearing as you move forward. Not erasing knowledge, but removing visual noise so you can focus on what comes next.",
  "This is the idea behind focused reading tools. By reducing the visible text to only what matters right now, they create a sense of forward motion. The text you've processed fades away, and the remaining content reshapes itself to fill the space naturally.",
  "The technical challenge is making this feel seamless. When text disappears, the remaining content needs to reflow instantly, without jank, without layout shift, without the page jumping. Traditional DOM methods struggle here because each measurement forces the browser to recalculate the entire page layout.",
  "Pretext solves this by predicting text heights using canvas measurements instead of DOM reads. The prepare phase runs once, measuring every word. The layout phase runs on every change, using pure arithmetic to calculate new positions in under a tenth of a millisecond.",
  "The result is text that breathes. Lines dissolve as you move through them, and the remaining content slides smoothly into place. No jarring jumps. No loading spinners. Just a continuous flow that matches the pace of your attention.",
  "This isn't about speed reading or productivity hacks. It's about creating a reading experience that respects how your mind actually works, one thought at a time, with nothing left behind to pull you back.",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full bg-bg">
      <Header />

      <main className="flex-1 w-full">
        <article className="mx-auto max-w-[680px] px-6 pt-16 pb-32">
          <div className="mb-12">
            <p className="text-xs font-sans font-medium uppercase tracking-widest text-text-faint mb-3">
              Practices for intentional consumption
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-text">
              The case for reading less
            </h1>
          </div>

          <BurningText paragraphs={PARAGRAPHS} />
        </article>
      </main>
    </div>
  );
}
