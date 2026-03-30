# Framer Motion API Reference

Complete API patterns for Framer Motion / motion-react. Covers the features used most in
professional animation work.

## Table of Contents
1. [Motion Components](#motion-components)
2. [The animate Prop](#the-animate-prop)
3. [Variants](#variants)
4. [AnimatePresence](#animatepresence)
5. [Layout Animations](#layout-animations)
6. [Spring Animations](#spring-animations)
7. [MotionConfig](#motionconfig)
8. [Motion Values & Hooks](#motion-values--hooks)
9. [Gestures](#gestures)
10. [Scroll Animations](#scroll-animations)
11. [Orchestration & Stagger](#orchestration--stagger)
12. [Shared Layout (layoutId)](#shared-layout-layoutid)
13. [Next.js Integration](#nextjs-integration)
14. [Bundle Size Considerations](#bundle-size)

---

## Motion Components

Wrap any HTML or SVG element with `motion.` to make it animatable:

```jsx
import { motion } from "motion/react";

<motion.div />
<motion.span />
<motion.svg />
<motion.button />
```

Motion components accept all standard HTML props plus animation props like `animate`,
`initial`, `exit`, `transition`, `variants`, `layout`, `drag`, `whileHover`, `whileTap`,
`whileDrag`, `whileInView`, and `style` (which accepts motion values).

---

## The animate Prop

The primary way to animate. Framer Motion animates between the current state and the
values in `animate`:

```jsx
// Animate on mount
<motion.div animate={{ opacity: 1, y: 0 }} />

// Animate based on state
<motion.div animate={{ scale: isActive ? 1.1 : 1 }} />

// With initial state
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

Animatable properties include: `x`, `y`, `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`,
`rotateY`, `rotateZ`, `opacity`, `width`, `height`, `borderRadius`, `color`,
`backgroundColor`, `filter` (including `blur()`), `clipPath`, and more.

`x` and `y` map to `translateX` and `translateY` automatically.

---

## Variants

Named animation states that can be shared across components and enable orchestration:

```jsx
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
/>
```

### Dynamic variants with `custom`

Pass dynamic values to variant functions:

```jsx
const variants = {
  initial: (direction) => ({ x: `${110 * direction}%`, opacity: 0 }),
  active: { x: "0%", opacity: 1 },
  exit: (direction) => ({ x: `${-110 * direction}%`, opacity: 0 }),
};

<motion.div
  variants={variants}
  custom={direction}
  initial="initial"
  animate="active"
  exit="exit"
/>
```

### Variant propagation

Variants propagate to children. Only the parent needs `initial` and `animate`:

```jsx
<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  <motion.li variants={itemVariants} />
  <motion.li variants={itemVariants} />
</motion.ul>
```

---

## AnimatePresence

Enables exit animations when components unmount. Crucial for modals, tooltips, step
transitions, and anything that appears/disappears.

```jsx
import { AnimatePresence } from "motion/react";

<AnimatePresence>
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### Key props

- `mode="wait"` — waits for exiting component to finish before entering new one
- `mode="popLayout"` — removes exiting component from layout flow immediately (great for step transitions)
- `mode="sync"` — enter and exit happen simultaneously (default)
- `initial={false}` — skip the initial animation on first render
- `custom` — pass dynamic values to exit variants

### mode="popLayout" for Multi-Step

When building wizards/steppers, `popLayout` prevents layout jumps by removing the exiting
element from flow immediately:

```jsx
<AnimatePresence mode="popLayout" initial={false} custom={direction}>
  <motion.div key={currentStep} variants={variants} custom={direction}
    initial="initial" animate="active" exit="exit"
  />
</AnimatePresence>
```

---

## Layout Animations

Add `layout` to smoothly animate any layout change (position, size):

```jsx
<motion.div layout />
```

### Animating height changes

Use `react-use-measure` to animate container height when content changes:

```jsx
import useMeasure from "react-use-measure";

const [ref, bounds] = useMeasure();

<motion.div animate={{ height: bounds.height }}>
  <div ref={ref}>
    {/* dynamic content */}
  </div>
</motion.div>
```

### Layout + AnimatePresence

Combine for smooth list reordering and content swapping:

```jsx
<motion.div layout className="actions">
  <button>Back</button>
  <button>Continue</button>
</motion.div>
```

---

## Spring Animations

Springs are the default and preferred animation type in Framer Motion. They are physics-based,
interruptible, and feel more natural than duration-based easings.

### Configuration approaches

**Approach 1: Physical properties (stiffness, damping, mass)**

```jsx
transition={{
  type: "spring",
  stiffness: 200,
  damping: 20,
  mass: 0.5,
}}
```

**Approach 2: Perceptual properties (duration, bounce) — Apple-style**

```jsx
transition={{
  type: "spring",
  duration: 0.5,
  bounce: 0,  // 0 = no bounce, 0.25 = subtle, 0.5 = noticeable
}}
```

### Recommended defaults

```jsx
// Safe default for UI transitions (no bounce)
{ type: "spring", duration: 0.3, bounce: 0 }

// Snappy interactive feel
{ type: "spring", stiffness: 300, damping: 30 }

// Soft follow (mouse tracking)
{ type: "spring", mass: 0.1 }

// Subtle bounce for drag release
{ type: "spring", stiffness: 200, damping: 15, mass: 0.5 }
```

### When to use bounce

- **Default: no bounce** (`bounce: 0`) — elegant, professional
- **Drag gesture release:** subtle bounce is appropriate
- **Never** use heavy bounce for standard UI transitions
- Sonner uses a non-bouncy spring for its toast animations to feel premium

### Spring interruptibility

Springs carry velocity when interrupted mid-animation, creating smooth transitions
when users interact rapidly (e.g., quickly adding toasts, toggling states).
CSS animations are NOT interruptible — they reset on re-trigger.

---

## MotionConfig

Provides shared transition config to all descendant motion components:

```jsx
import { MotionConfig } from "motion/react";

<MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.5 }}>
  {/* All motion components inside inherit this transition */}
</MotionConfig>
```

Also used for accessibility:

```jsx
<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
```

---

## Motion Values & Hooks

Motion values update outside React's render cycle for 60fps performance.

### useMotionValue

Creates a raw motion value (instant updates, no animation):

```jsx
const x = useMotionValue(0);

// Update without re-rendering
x.set(100);

// Read
const current = x.get();

// Use in style
<motion.div style={{ x }} />
```

Best for: values tied directly to gestures where spring lag would feel disconnected.

### useSpring

Creates an animated motion value with spring physics:

```jsx
const x = useSpring(0);
const y = useSpring(0, { mass: 0.1 }); // custom spring config

// Updates animate to new value
x.set(100);
```

Best for: mouse-following elements, smooth value transitions.

**Mouse follower pattern:**

```jsx
const SPRING = { mass: 0.1 };
const x = useSpring(0, SPRING);
const y = useSpring(0, SPRING);
const opacity = useSpring(0);

<div
  onPointerMove={(e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - bounds.left - 24);
    y.set(e.clientY - bounds.top - 24);
  }}
  onPointerEnter={() => opacity.set(1)}
  onPointerLeave={() => opacity.set(0)}
>
  <motion.div style={{ x, y, opacity }} />
</div>
```

### useTransform

Transforms one motion value into another:

```jsx
// Range mapping: y 0→300 maps to scale 1→1.5
const scale = useTransform(y, [0, 300], [1, 1.5]);

// Function transform
const display = useTransform(value, (v) => `${Math.round(v)}°`);

// Use in style
<motion.div style={{ x, y, scale }} />
```

### useMotionTemplate

Combines motion values into a template string (useful for clipPath, filter, etc.):

```jsx
const clipValue = useMotionValue(100);
const clipPath = useMotionTemplate`inset(0px ${clipValue}% 0px 0px)`;

<motion.div style={{ clipPath }} />
```

### When to use which hook

| Hook | Updates | Use case |
|---|---|---|
| `useMotionValue` | Instant | Gestures, drag-linked values |
| `useSpring` | Animated (spring) | Mouse following, smooth transitions |
| `useTransform` | Derived | Mapping one value to another |
| `useMotionTemplate` | Template | String interpolation with motion values |

**Key rule:** Use `useMotionValue` for gestures (direct correspondence feels right).
Use `useSpring` for following/tracking behaviors. `useSpring` with a drag would feel
disconnected because it adds lag between the finger and the element.

---

## Gestures

### whileHover / whileTap / whileDrag

```jsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
/>
```

### Drag

```jsx
<motion.div
  drag // or drag="x" / drag="y"
  dragConstraints={{ top: 0, bottom: 300 }}
  dragElastic={0.1}
  onDragEnd={(event, info) => {
    if (info.offset.y > 100) dismiss();
  }}
/>
```

---

## Scroll Animations

### useInView

Detect when an element enters the viewport:

```jsx
import { useInView } from "motion/react";
import { useRef } from "react";

const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-100px" });

<div ref={ref}>
  {isInView && <AnimatedContent />}
</div>
```

### Clip-path reveal on scroll

```jsx
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-100px" });

if (isInView && ref.current) {
  ref.current.animate(
    [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
    { duration: 1000, fill: "forwards", easing: "cubic-bezier(0.77, 0, 0.175, 1)" }
  );
}
```

---

## Orchestration & Stagger

### Stagger children using variants

```jsx
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map((i) => (
    <motion.li key={i} variants={item} />
  ))}
</motion.ul>
```

### CSS stagger (without Framer Motion)

```css
.item {
  opacity: 0;
  animation: fadeIn 0.4s cubic-bezier(.23, 1, .32, 1) forwards;
}
.item:nth-child(1) { animation-delay: 0s; }
.item:nth-child(2) { animation-delay: 0.05s; }
.item:nth-child(3) { animation-delay: 0.1s; }
/* ... */
```

---

## Shared Layout (layoutId)

Morphing transitions between two components:

```jsx
<AnimatePresence mode="wait">
  {isExpanded ? (
    <motion.div layoutId="card" className="expanded">
      <motion.h2 layoutId="title">{title}</motion.h2>
    </motion.div>
  ) : (
    <motion.div layoutId="card" className="compact">
      <motion.h2 layoutId="title">{title}</motion.h2>
    </motion.div>
  )}
</AnimatePresence>
```

Use cases: button → popover, card → detail view, tab indicators, and any morphing UI.

**Performance note:** Shared layout uses `requestAnimationFrame` and may drop frames
under heavy load. For simple tab indicators, prefer CSS animations.

---

## Next.js Integration

```jsx
// In layout.tsx or a client component wrapper
"use client";
import { MotionConfig } from "motion/react";

export function AnimationProvider({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
```

For page transitions, wrap the page content in `AnimatePresence` keyed by the route.

---

## Bundle Size

Framer Motion is a large package. Strategies to manage this:

1. **Combine CSS + Framer Motion:** CSS for simple transitions, Framer Motion for complex ones
2. **Tree-shaking:** Import only what you use: `import { motion } from "motion/react"`
3. **Consider Motion One:** Same creator, WAAPI-based, much smaller, hardware-accelerated
4. **LazyMotion:** Load features on demand

```jsx
import { LazyMotion, domAnimation, m } from "motion/react";

<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>
```
