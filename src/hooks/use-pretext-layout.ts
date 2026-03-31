"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { measureLines, type LayoutState } from "@/lib/pretext-engine";

interface UsePretextLayoutOptions {
  paragraphs: string[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export interface ParagraphLayout {
  id: string;
  text: string;
  layout: LayoutState;
}

export function usePretextLayout({ paragraphs, containerRef }: UsePretextLayoutOptions) {
  const [layouts, setLayouts] = useState<ParagraphLayout[]>([]);
  const [ready, setReady] = useState(false);
  const fontRef = useRef("");
  const lineHeightRef = useRef(0);

  const measure = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;

    const computed = getComputedStyle(el);
    const fontFamily = computed.fontFamily;
    const fontSize = computed.fontSize;
    const font = `${fontSize} ${fontFamily}`;
    fontRef.current = font;

    const lh = parseFloat(computed.lineHeight);
    lineHeightRef.current = isNaN(lh)
      ? parseFloat(fontSize) * 1.6
      : lh;

    const width = el.clientWidth;

    const results = await Promise.all(
      paragraphs.map(async (text, i) => {
        const layout = await measureLines(text, font, width, lineHeightRef.current);
        return {
          id: `p-${i}`,
          text,
          layout,
        };
      })
    );

    setLayouts(results);
    setReady(true);
  }, [paragraphs, containerRef]);

  useEffect(() => {
    document.fonts.ready.then(() => measure());
  }, [measure]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !ready) return;

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, ready, measure]);

  const remeasureParagraph = useCallback(
    async (paragraphIndex: number, newText: string) => {
      const el = containerRef.current;
      if (!el) return;

      const width = el.clientWidth;
      const layout = await measureLines(
        newText,
        fontRef.current,
        width,
        lineHeightRef.current
      );

      setLayouts((prev) =>
        prev.map((p, i) =>
          i === paragraphIndex ? { ...p, text: newText, layout } : p
        )
      );
    },
    [containerRef]
  );

  return {
    layouts,
    ready,
    font: fontRef.current,
    lineHeight: lineHeightRef.current,
    remeasureParagraph,
  };
}
