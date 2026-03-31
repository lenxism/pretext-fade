"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion, MotionConfig } from "motion/react";
import { usePretextLayout } from "@/hooks/use-pretext-layout";
import {
  useBurningText,
  type InteractionMode,
} from "@/hooks/use-burning-text";
import { predictHeight } from "@/lib/pretext-engine";
import { TextLayer } from "./text-layer";
import { Controls } from "./controls";

const FADE_DURATION_MS = 500;

interface BurningTextProps {
  paragraphs: string[];
}

export function BurningText({ paragraphs }: BurningTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const reducedMotion = useReducedMotion() ?? false;

  const [mode, setMode] = useState<InteractionMode>("select");
  const [speed, setSpeed] = useState(120);
  const [layoutTime, setLayoutTime] = useState<number | null>(null);

  const { layouts, ready, font, lineHeight, remeasureParagraph } =
    usePretextLayout({ paragraphs, containerRef });

  const {
    burning,
    hiddenLines,
    triggerBurn,
    completeBurn,
    reset,
    lineKey,
  } = useBurningText({
    layouts,
    ready,
    mode,
    speed,
    remeasureParagraph,
    originalParagraphs: paragraphs,
  });

  const completeBurnRef = useRef(completeBurn);
  completeBurnRef.current = completeBurn;
  const layoutsRef = useRef(layouts);
  layoutsRef.current = layouts;
  const fontRef = useRef(font);
  fontRef.current = font;
  const lineHeightRef = useRef(lineHeight);
  lineHeightRef.current = lineHeight;

  const handleLineRef = useCallback(
    (pi: number, li: number, el: HTMLDivElement | null) => {
      const key = `${pi}-${li}`;
      if (el) {
        lineRefs.current.set(key, el);
      } else {
        lineRefs.current.delete(key);
      }
    },
    []
  );

  useEffect(() => {
    if (!burning || !containerRef.current) return;

    const timer = setTimeout(async () => {
      const para = layoutsRef.current[burning.paragraphIndex];
      if (para) {
        const remaining = para.layout.lines
          .filter((_, i) => i !== burning.lineIndex)
          .map((l) => l.text.trim())
          .filter(Boolean)
          .join(" ");

        if (remaining && containerRef.current) {
          const result = await predictHeight(
            remaining,
            fontRef.current,
            containerRef.current.clientWidth,
            lineHeightRef.current
          );
          setLayoutTime(result.timeMs);
        }
      }

      completeBurnRef.current();
    }, FADE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [burning]);

  const handleReset = useCallback(() => {
    setLayoutTime(null);
    reset();
  }, [reset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && mode === "autoplay") {
        e.preventDefault();
        setMode((m) => (m === "autoplay" ? "select" : "autoplay"));
      }
      if (e.key === "Escape") {
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, handleReset]);

  if (!ready) {
    return (
      <div ref={containerRef} className="font-serif text-lg leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-8">
            {p}
          </p>
        ))}
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <div
        ref={containerRef}
        role="article"
        aria-label="Interactive reading area. Hover, tap, or select lines to fade them away."
        className="relative font-serif text-lg leading-relaxed"
      >
        <div aria-live="polite" className="sr-only">
          {layoutTime !== null && `Layout recalculated in ${layoutTime.toFixed(2)} milliseconds`}
        </div>

        {layouts.map((para, pi) => {
          if (!para.text.trim()) return null;
          return (
            <TextLayer
              key={para.id}
              paragraphIndex={pi}
              lines={para.layout.lines}
              hiddenLines={hiddenLines}
              burning={burning}
              mode={mode}
              lineHeight={lineHeight}
              onTriggerBurn={triggerBurn}
              onLineRef={handleLineRef}
              lineKey={lineKey}
              reducedMotion={reducedMotion}
            />
          );
        })}

        <Controls
          mode={mode}
          speed={speed}
          onModeChange={setMode}
          onSpeedChange={setSpeed}
          onReset={handleReset}
          layoutTime={layoutTime}
        />
      </div>
    </MotionConfig>
  );
}
