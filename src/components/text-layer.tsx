"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { TextLine } from "@/lib/pretext-engine";
import type { InteractionMode } from "@/hooks/use-burning-text";

const REFLOW_SPRING = {
  type: "spring" as const,
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

interface TextLayerProps {
  paragraphIndex: number;
  lines: TextLine[];
  hiddenLines: Set<string>;
  burning: { paragraphIndex: number; lineIndex: number } | null;
  mode: InteractionMode;
  lineHeight: number;
  onTriggerBurn: (paragraphIndex: number, lineIndex: number) => void;
  onLineRef: (
    paragraphIndex: number,
    lineIndex: number,
    el: HTMLDivElement | null
  ) => void;
  lineKey: (pi: number, li: number) => string;
  reducedMotion: boolean;
}

export function TextLayer({
  paragraphIndex,
  lines,
  hiddenLines,
  burning,
  mode,
  lineHeight,
  onTriggerBurn,
  onLineRef,
  lineKey,
  reducedMotion,
}: TextLayerProps) {
  const handleClick = useCallback(
    (lineIndex: number) => {
      if (mode !== "select") return;
      onTriggerBurn(paragraphIndex, lineIndex);
    },
    [mode, paragraphIndex, onTriggerBurn]
  );

  const visibleLines = lines.filter(
    (_, li) => !hiddenLines.has(lineKey(paragraphIndex, li))
  );

  if (visibleLines.length === 0) return null;

  return (
    <motion.div
      layout={!reducedMotion}
      transition={REFLOW_SPRING}
      className="mb-8"
    >
      <AnimatePresence mode="popLayout">
        {lines.map((line, li) => {
          const key = lineKey(paragraphIndex, li);
          const isHidden = hiddenLines.has(key);
          const isBurning =
            burning?.paragraphIndex === paragraphIndex &&
            burning?.lineIndex === li;

          if (isHidden && !isBurning) return null;

          return (
            <motion.div
              key={key}
              layout={!reducedMotion}
              initial={false}
              animate={{
                opacity: isBurning ? 0 : 1,
                filter: isBurning ? "blur(2px)" : "blur(0px)",
              }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{
                opacity: { duration: 0.5, ease: "easeOut" },
                filter: { duration: 0.4, ease: "easeOut" },
                layout: REFLOW_SPRING,
              }}
              ref={(el) => onLineRef(paragraphIndex, li, el)}
              style={{
                height: lineHeight,
                lineHeight: `${lineHeight}px`,
              }}
              className={`
                whitespace-pre font-serif text-lg leading-relaxed will-change-transform
                ${mode === "select" ? "cursor-pointer hover:bg-ember-glow/40 rounded-sm transition-colors duration-150" : ""}
              `}
              onClick={() => handleClick(li)}
            >
              {line.text}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
