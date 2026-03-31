"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { msForLine } from "@/lib/reading-timer";
import type { ParagraphLayout } from "@/hooks/use-pretext-layout";

export type InteractionMode = "autoplay" | "select";

export interface BurningTarget {
  paragraphIndex: number;
  lineIndex: number;
  text: string;
}

interface UseBurningTextOptions {
  layouts: ParagraphLayout[];
  ready: boolean;
  mode: InteractionMode;
  speed: number;
  originalParagraphs: string[];
  remeasureParagraph: (index: number, text: string) => Promise<void>;
}

export function useBurningText({
  layouts,
  ready,
  mode,
  speed,
  originalParagraphs,
  remeasureParagraph,
}: UseBurningTextOptions) {
  const [burning, setBurning] = useState<BurningTarget | null>(null);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isBurningRef = useRef(false);

  const lineKey = (pi: number, li: number) => `${pi}-${li}`;

  const triggerBurn = useCallback(
    (paragraphIndex: number, lineIndex: number) => {
      if (isBurningRef.current) return;

      const para = layouts[paragraphIndex];
      if (!para) return;
      const line = para.layout.lines[lineIndex];
      if (!line) return;

      isBurningRef.current = true;
      setBurning({ paragraphIndex, lineIndex, text: line.text });
    },
    [layouts]
  );

  const completeBurn = useCallback(() => {
    if (!burning) return;

    setHiddenLines((prev) => {
      const next = new Set(prev);
      next.add(lineKey(burning.paragraphIndex, burning.lineIndex));
      return next;
    });

    setBurning(null);
    isBurningRef.current = false;
  }, [burning]);

  const reset = useCallback(() => {
    setBurning(null);
    setHiddenLines(new Set());
    isBurningRef.current = false;
    clearTimeout(timerRef.current);

    originalParagraphs.forEach((text, i) => {
      remeasureParagraph(i, text);
    });
  }, [originalParagraphs, remeasureParagraph]);

  useEffect(() => {
    if (mode !== "autoplay" || !ready || isBurningRef.current) return;

    const findNextLine = (): { pi: number; li: number } | null => {
      for (let pi = 0; pi < layouts.length; pi++) {
        const para = layouts[pi];
        if (!para.text.trim()) continue;
        for (let li = 0; li < para.layout.lines.length; li++) {
          if (!hiddenLines.has(lineKey(pi, li))) {
            return { pi, li };
          }
        }
      }
      return null;
    };

    const next = findNextLine();
    if (!next) return;

    const line = layouts[next.pi].layout.lines[next.li];
    const delay = msForLine(line.text, speed);

    timerRef.current = setTimeout(() => {
      triggerBurn(next.pi, next.li);
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [mode, ready, layouts, hiddenLines, speed, triggerBurn]);

  return {
    burning,
    hiddenLines,
    triggerBurn,
    completeBurn,
    reset,
    lineKey,
  };
}
