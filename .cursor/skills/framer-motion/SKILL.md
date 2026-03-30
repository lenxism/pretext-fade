---
name: framer-motion
description: >
  Professional web animation patterns using Framer Motion (motion/react), CSS, and spring physics.
  Covers easing curves, spring config, AnimatePresence, layout animations, shared layout transitions,
  motion values (useSpring, useTransform, useMotionValue), gestures, scroll animations, performance
  optimization, and prefers-reduced-motion accessibility. Based on Emil Kowalski's methodology from
  Vercel, Clerk, Sonner, and Vaul. Use this skill whenever the user asks about: Framer Motion,
  motion/react, animating React components, spring animations, page transitions, easing curves,
  cubic-bezier values, enter/exit transitions, modal/popover/toast/drawer animations, drag
  interactions, layout animations, scroll-driven effects, animation performance, reduced motion,
  or making web animations feel natural and polished. Also trigger for animation taste, duration
  guidelines, or improving existing animations.
---

# Framer Motion & Web Animation Skill

This skill encodes professional animation principles and Framer Motion patterns. It produces
animations that feel natural, fast, and purposeful — following the methodology used at Vercel,
Clerk, and in libraries like Sonner and Vaul.

## Quick Decision: Which Reference to Read

Before writing animation code, read the relevant reference file(s) from `references/`:

| Task | Read this file |
|---|---|
| Choosing easing curves, cubic-bezier values, hover transitions | `references/easing-blueprint.md` |
| Framer Motion API: motion components, AnimatePresence, layout, variants, hooks | `references/framer-motion-api.md` |
| Spring animation configuration (stiffness, damping, mass, bounce) | `references/framer-motion-api.md` (Springs section) |
| Performance: hardware acceleration, will-change, bundle size, re-renders | `references/performance.md` |
| Accessibility: prefers-reduced-motion, MotionConfig, reduced variants | `references/accessibility.md` |
| Practical tips: origin-aware, blur trick, scale buttons, keyboard interactions | `references/practical-tips.md` |
| Design philosophy: timing, purpose, taste, orchestration, feeling | `references/design-philosophy.md` |

For most animation tasks, start with `easing-blueprint.md` + `framer-motion-api.md`, then consult
others as needed.

---

## Core Principles (Always Apply)

### 1. Keep Animations Fast
- Default duration: **200–300ms** for most UI animations
- Hover transitions: **150ms** with CSS `ease`
- Enter transitions: **200ms**, exit transitions: **150ms**
- Never exceed **700ms** unless illustrative/decorative
- Faster animations improve perceived performance

### 2. Default Easing Selection
- **Enter/exit animations** → `ease-out` (starts fast, feels responsive)
- **On-screen movement** → `ease-in-out` (natural acceleration/deceleration)
- **Hover effects** (color, opacity, background) → CSS `ease`, 200ms
- **Continuous loops** (spinners, marquees) → `linear`
- **Avoid** `ease-in` for UI — it feels sluggish
- **Never use built-in CSS easings** except `ease` and `linear` — use custom cubic-bezier curves

### 3. Spring Animations Are the Default in Framer Motion
- Default to spring animations when using Framer Motion
- Avoid bouncy springs unless working with drag gestures
- Use `type: "spring", bounce: 0` as a safe default for UI transitions
- Springs are interruptible — they handle rapid state changes gracefully

### 4. Animate Only `transform` and `opacity`
- These trigger only compositing (GPU-accelerated)
- Never animate `margin`, `padding`, `height`, `width`, `top`, `left` for motion
- Use `will-change: transform` to prevent the 1px GPU/CPU handoff shift
- Keep blur values under **20px** (especially on Safari)

### 5. Purpose Over Decoration
- Every animation should add context — link actions to consequences
- Don't animate frequently-used interactions (keyboard nav, command menus)
- Don't animate subsequent tooltips after the first one opens
- Scale quantity carefully: a few well-crafted animations > many mediocre ones

### 6. Always Respect `prefers-reduced-motion`
- Disable `transform`-based animations; fall back to `opacity` fades
- Use `<MotionConfig reducedMotion="user">` as an app-wide wrapper
- See `references/accessibility.md` for complete patterns

---

## Standard Animation Recipes

### Modal / Dialog
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
  exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
  transition={{ type: "spring", duration: 0.2, bounce: 0 }}
/>
```

### Popover / Dropdown (origin-aware)
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ type: "spring", duration: 0.2, bounce: 0 }}
  style={{ transformOrigin: "var(--radix-popover-content-transform-origin)" }}
/>
```

### List Stagger
```jsx
const container = {
  animate: { transition: { staggerChildren: 0.05 } },
};
const item = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

<motion.ul variants={container} initial="initial" animate="animate">
  {items.map((i) => (
    <motion.li key={i} variants={item} />
  ))}
</motion.ul>
```

### Multi-Step / Wizard (direction-aware)
```jsx
const variants = {
  initial: (direction) => ({ x: `${110 * direction}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (direction) => ({ x: `${-110 * direction}%`, opacity: 0 }),
};

<AnimatePresence mode="popLayout" initial={false} custom={direction}>
  <motion.div
    key={currentStep}
    variants={variants}
    initial="initial"
    animate="active"
    exit="exit"
    custom={direction}
  />
</AnimatePresence>
```

### Button Press Feedback
```css
button:active {
  transform: scale(0.97);
}
/* Never animate from scale(0) — use 0.9+ as minimum */
```

### Shared Layout Morphing (button → popover)
```jsx
<MotionConfig transition={{ type: "spring", bounce: 0.1, duration: 0.25 }}>
  <AnimatePresence>
    {isOpen ? (
      <motion.div layoutId="feedback" className="popover">
        {/* popover content */}
      </motion.div>
    ) : (
      <motion.button layoutId="feedback" className="button">
        Feedback
      </motion.button>
    )}
  </AnimatePresence>
</MotionConfig>
```

### Height Animation (auto-resizing container)
```jsx
const [ref, bounds] = useMeasure();

<motion.div animate={{ height: bounds.height }}>
  <div ref={ref}>{/* dynamic content */}</div>
</motion.div>
```

---

## Import Patterns

```jsx
// Modern (motion/react — the renamed package)
import { motion, AnimatePresence, MotionConfig, useSpring, useTransform, useMotionValue, useMotionTemplate, useReducedMotion, useInView } from "motion/react";

// Legacy (still works)
import { motion, AnimatePresence } from "framer-motion";

// For height animations
import useMeasure from "react-use-measure";
```

---

## When NOT to Use Framer Motion

- Simple hover effects → CSS transitions
- Enter/exit with Radix/Base UI → CSS keyframes with `data-state`
- Continuous spinners/marquees → CSS `@keyframes` with `linear`
- Bundle-sensitive apps → consider Motion One (WAAPI-based, smaller)
- Combine CSS for simple animations + Framer Motion for complex ones