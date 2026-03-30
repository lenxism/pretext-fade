# Performance Guide

How to ensure animations run at 60fps on all devices.

## The Rendering Pipeline

When a browser animates an element, it goes through up to three steps:

1. **Layout** — calculate size and position of elements
2. **Paint** — draw elements into graphical layers
3. **Composite** — combine layers and display

Animating `transform` and `opacity` only triggers step 3 (compositing), which is cheapest.
Animating `margin`, `padding`, `height`, `width`, `top`, `left` triggers all three steps
and can cause frame drops.

## Rule: Stick to Transform and Opacity

This is the single most important performance rule. Translate using `transform` instead
of `top`/`left`. Scale using `transform: scale()` instead of changing `width`/`height`.

```css
/* BAD — triggers layout recalculation */
.element { top: 100px; }

/* GOOD — only triggers compositing */
.element { transform: translateY(100px); }
```

Transform does not affect layout flow — sibling elements won't move.

## The will-change Fix

When the browser switches between CPU and GPU rendering during an animation, it can
cause a 1px visual shift. Force GPU rendering from the start:

```css
.element {
  will-change: transform;
}
```

Only use `will-change` for: `transform`, `opacity`, `clipPath`, `filter`.
Don't overuse it — applying it to too many elements wastes GPU memory.

## JS vs CSS Animations

**CSS animations** can be hardware-accelerated (offloaded to GPU). They stay smooth even
when the main thread is busy.

**JS animations (requestAnimationFrame)** always run on the main thread. If the browser
is doing heavy work, frames will drop. Framer Motion uses rAF internally.

**WAAPI (Web Animations API)** offers the best of both: JS control with hardware
acceleration. Motion One uses WAAPI.

### When Framer Motion drops frames

Framer Motion's shared layout animations use rAF. If the browser is simultaneously loading
a new page or doing heavy DOM work, the animation may stutter. This happened at Vercel
with tab highlight animations — the fix was switching to CSS for that specific animation.

**Practical approach:** Use CSS for simple, performance-critical animations. Use Framer
Motion for complex, interactive ones where its features justify the tradeoff.

## Hardware Acceleration in Framer Motion

Most people animate using `x` and `y` props, which is readable but not hardware-accelerated.
To get GPU acceleration, animate `transform` as a string:

```jsx
// Standard (not hardware-accelerated)
<motion.div animate={{ x: 100, y: 50 }} />

// Hardware-accelerated
<motion.div animate={{ transform: "translateX(100px) translateY(50px)" }} />
```

Use the string approach when you notice performance issues, especially on lower-end devices.

## CSS Variables and Drag Performance

Never animate drag gestures via CSS variables. CSS variables are inherited — changing one
triggers style recalculation for ALL children. With a large DOM, this causes lag.

```jsx
// BAD — triggers style recalc on all children
const style = { "--swipe-amount": `${dragDistance}px` };

// GOOD — direct transform, no inheritance cascade
const style = { transform: `translateY(${dragDistance}px)` };
```

This was a real bug in Vaul — drag became laggy with 20+ list items until the CSS variable
approach was replaced with direct transform.

## Blur Performance

`filter: blur()` becomes very expensive at high values, especially on Safari.

- Keep blur under **20px**
- Use blur strategically: to mask animation imperfections or create depth
- Test on Safari — it's the most sensitive browser to blur performance

## Re-Renders in React

Animation libraries like Framer Motion animate outside React's render cycle. But if your
animation depends on state that changes every frame, you'll get 60 re-renders/second.

```jsx
// BAD — re-renders on every mouse move
const [pos, setPos] = useState({ x: 0, y: 0 });
onPointerMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
<motion.div style={{ left: pos.x, top: pos.y }} />

// GOOD — updates outside React's render cycle
const x = useSpring(0);
const y = useSpring(0);
onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}
<motion.div style={{ x, y }} />
```

Motion values (`useMotionValue`, `useSpring`) are the solution — they update without
triggering React re-renders.

## Checklist

- [ ] Only animate `transform` and `opacity` for motion
- [ ] Add `will-change: transform` to fix 1px shift artifacts
- [ ] Use motion values instead of state for high-frequency updates
- [ ] Don't animate via CSS variables in drag gestures
- [ ] Keep blur values under 20px
- [ ] For hardware acceleration, use transform strings in Framer Motion
- [ ] Test on real devices, especially lower-end mobile
- [ ] Consider CSS animations for performance-critical, simple transitions
