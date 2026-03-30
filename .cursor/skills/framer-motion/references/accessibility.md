# Accessibility Guide

Animations can make people feel sick or distracted. Every animation must account for users
who prefer reduced motion.

## The Core Media Query

```css
/* prefers-reduced-motion: no-preference — user hasn't set a preference */
/* prefers-reduced-motion: reduce — user wants less motion */
```

**Reduced motion does NOT mean no motion.** Animations help users understand UI changes.
Removing them entirely hurts usability. Instead, replace motion with opacity/color fades.

## Guidelines for Reduced Motion

When `prefers-reduced-motion: reduce` is active:

1. **Disable** autoplaying animations
2. **Replace** transform-based animations with opacity/color transitions only
3. **Ensure** no elements visibly move on screen
4. Keep informational transitions (like opacity fades) to maintain context

## Workflow

1. Build the animation normally
2. Create a reduced-motion variant (typically opacity-only)
3. Test with browser DevTools (search "prefers-reduced-motion" in rendering settings)
4. Ship both variants

## Implementation Patterns

### CSS Pattern

```css
.element {
  animation: slideIn 0.2s cubic-bezier(.23, 1, .32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fadeIn 0.2s ease;
  }
}
```

### Tailwind Pattern

```html
<svg class="motion-safe:animate-bounce motion-reduce:animate-fade" />
```

### Framer Motion: useReducedMotion Hook

```jsx
import { useReducedMotion, motion } from "motion/react";

export function Sidebar({ isOpen }) {
  const shouldReduceMotion = useReducedMotion();
  const closedX = shouldReduceMotion ? 0 : "-100%";

  return (
    <motion.div
      animate={{
        opacity: isOpen ? 1 : 0,
        x: isOpen ? 0 : closedX,
      }}
    />
  );
}
```

### Framer Motion: MotionConfig (App-Wide)

The easiest approach — wrap your entire app:

```jsx
import { MotionConfig } from "motion/react";

<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
```

When `reducedMotion="user"`, Framer Motion automatically respects the OS preference and
only animates `opacity` and `backgroundColor`. The default is `"never"` so you must set
this yourself.

### Framer Motion: Dual Variant Sets

For complex components, maintain two variant sets:

```jsx
const reducedMotion = useReducedMotion();

const fullVariants = {
  initial: (dir) => ({ x: `${110 * dir}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (dir) => ({ x: `${-110 * dir}%`, opacity: 0 }),
};

const reducedVariants = {
  initial: { opacity: 0 },
  active: { opacity: 1 },
  exit: { opacity: 0 },
};

<motion.div
  variants={reducedMotion ? reducedVariants : fullVariants}
  initial="initial"
  animate="active"
  exit="exit"
/>
```

Also disable height animations and layout animations when reduced motion is preferred:

```jsx
<motion.div animate={reducedMotion ? {} : { height: bounds.height }}>
  {/* content */}
</motion.div>

<motion.div layout={!reducedMotion}>
  {/* layout-animated content */}
</motion.div>
```

### Dependency-Free useReducedMotion Hook

```tsx
import { useState, useRef, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { current: mediaQuery } = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null
  );

  useEffect(() => {
    if (!mediaQuery) return;
    const listener = () => setPrefersReducedMotion(!!mediaQuery.matches);
    listener(); // check initial value
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, [mediaQuery]);

  return prefersReducedMotion;
}
```

## Useful Snippets

### Disable smooth scrolling for reduced motion

```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```

### Autoplaying images with static fallback

```html
<picture>
  <source srcset="animated.avifs" type="image/avif"
    media="(prefers-reduced-motion: no-preference)" />
  <source srcset="animated.gif" type="image/gif"
    media="(prefers-reduced-motion: no-preference)" />
  <img src="static.png" alt="description" />
</picture>
```

### Pausing looping animations (showing a "hero frame")

```css
.animation {
  animation: shake 0.2s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animation {
    animation-play-state: paused;
    animation-delay: -0.4s; /* freeze on a specific frame */
  }
}
```

## Hit Targets

While not strictly animation-related, interactive animated elements must have appropriate
hit targets. Apple and WCAG recommend a minimum of **44px**.

```css
@utility touch-hitbox {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    display: block;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    min-height: 44px;
    min-width: 44px;
    z-index: 9999;
  }
}
```

```jsx
<button className="touch-hitbox">
  <BellIcon />
</button>
```
