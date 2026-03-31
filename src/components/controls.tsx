"use client";

import { motion, AnimatePresence } from "motion/react";
import type { InteractionMode } from "@/hooks/use-burning-text";

interface ControlsProps {
  mode: InteractionMode;
  speed: number;
  onModeChange: (mode: InteractionMode) => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  layoutTime: number | null;
}

const MODES: { id: InteractionMode; label: string }[] = [
  { id: "autoplay", label: "Auto-play" },
  { id: "select", label: "Select" },
];

export function Controls({
  mode,
  speed,
  onModeChange,
  onSpeedChange,
  onReset,
  layoutTime,
}: ControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4, delay: 0.6 }}
      className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 sm:bottom-6"
    >
      <div
        role="toolbar"
        aria-label="Reading controls"
        className="flex flex-col items-center gap-2 rounded-2xl bg-white/90 px-3 py-2.5 shadow-lg shadow-black/[0.06] border border-black/[0.06] backdrop-blur-md font-sans text-sm sm:flex-row sm:gap-1 sm:rounded-xl sm:px-2 sm:py-1.5"
      >
        <div className="flex items-center gap-1.5 sm:gap-1">
          <div
            role="radiogroup"
            aria-label="Interaction mode"
            className="flex items-center gap-0.5 rounded-lg bg-black/[0.04] p-0.5"
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={mode === m.id}
                onClick={() => onModeChange(m.id)}
                className={`
                  relative rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150
                  sm:px-3 sm:py-1.5 sm:text-xs
                  ${mode === m.id ? "text-text" : "text-text-muted hover:text-text"}
                `}
              >
                {mode === m.id && (
                  <motion.div
                    layoutId="mode-indicator"
                    className="absolute inset-0 rounded-md bg-white shadow-sm"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-black/[0.08] mx-0.5 sm:mx-1" />

          {layoutTime !== null && (
            <span className="hidden text-[10px] text-text-faint tabular-nums px-1 sm:inline">
              {layoutTime.toFixed(2)}ms
            </span>
          )}

          <button
            onClick={onReset}
            className="rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:text-text hover:bg-black/[0.04] transition-colors duration-150 sm:px-2.5 sm:py-1.5 sm:text-xs"
            aria-label="Reset all text"
          >
            Reset
          </button>
        </div>

        <AnimatePresence>
          {mode === "autoplay" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex items-center gap-3 overflow-hidden sm:gap-2 sm:pl-1"
            >
              <input
                type="range"
                min={60}
                max={300}
                step={10}
                value={speed}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                aria-label={`Reading speed: ${speed} words per minute`}
                className="w-28 accent-ember h-1 sm:w-20"
              />
              <span className="text-xs text-text-muted tabular-nums shrink-0">
                {speed} wpm
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
