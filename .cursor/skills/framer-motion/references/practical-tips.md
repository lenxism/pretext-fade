# Practical Animation Tips

Actionable tips that separate good animations from great ones. Apply these to
every animation you build.

## 1. Scale Buttons on Press

Give instant feedback by scaling buttons down on `:active`:

```css
button:active {
  transform: scale(0.97);
}
```

This makes interfaces feel immediately responsive. The user knows the app is listening.

## 2. Never Animate from scale(0)

Elements appearing from `scale(0)` feel like they come from nowhere. Start from
**0.9 or higher** for a gentle, natural entrance:

```jsx
// BAD
initial={{ scale: 0 }}

// GOOD
initial={{ scale: 0.95, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
```

Think of a balloon — even when deflated, it has a visible shape. Nothing in the real
world truly starts from zero size.

## 3. Make Animations Origin-Aware

Popovers, dropdowns, and tooltips should scale from their trigger, not from center.
Use `transform-origin` matched to the trigger position:

```jsx
<motion.div
  style={{
    // Radix provides this automatically
    transformOrigin: "var(--radix-dropdown-menu-content-transform-origin)",
  }}
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
/>
```

For Base UI:
```css
.popover {
  transform-origin: var(--transform-origin);
}
```

The default `transform-origin: center` is wrong for almost all contextual UI.

## 4. Don't Animate Subsequent Tooltips

First tooltip: animate in with a short delay (prevents accidental triggers).
Once one tooltip is open, hovering other triggers should show instantly with
**no delay and no animation**:

```css
.tooltip {
  transition: transform 0.125s ease-out, opacity 0.125s ease-out;
  transform-origin: var(--transform-origin);
}

.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Disable animation for subsequent tooltips */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

## 5. Don't Animate Keyboard Interactions

Keyboard navigation (arrow keys in lists, command menus) happens hundreds of times
a day. Animation makes these feel slow and disconnected.

```jsx
// For keyboard-navigated highlights: NO animation
// Only animate on initial appearance, not on key-driven movement
```

The highlight in a command menu should move instantly with keystrokes.

## 6. Be Careful with Frequently Used Animations

If an element is interacted with many times daily, consider removing or minimizing
its animation. Use your own product daily — over time, you'll notice which animations
become annoying through repetition.

## 7. Use Blur to Mask Imperfections

When an animation feels slightly off despite trying different easings and durations,
add a subtle `filter: blur()`:

```jsx
initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
```

Blur works because it bridges the visual gap between states, making the transition
appear smoother. It tricks the eye into seeing one continuous transformation instead
of two distinct states.

Keep blur under **20px** for performance (especially Safari). Values of 2–4px are
usually enough for subtle masking.

## 8. Disable Hover Effects on Touch Devices

Touch devices can accidentally trigger hover states during scrolling. Disable them:

```css
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.02);
  }
}
```

Tailwind v4's `hover:` modifier does this automatically.

## 9. Use Custom Easing Curves

Built-in CSS easings are too weak. Always use custom cubic-bezier curves for
energetic, polished animations. See `easing-blueprint.md` for the full set.

```css
/* Compare: */
.weak { transition: transform 0.3s ease-in-out; }
.strong { transition: transform 0.3s cubic-bezier(.77, 0, .175, 1); }
/* The custom curve feels far more energetic */
```

## 10. Fix Shaky Animations with will-change

When CSS transform animations shift by 1px at start/end, the browser is swapping
between GPU and CPU rendering. Force GPU from the start:

```css
.element {
  will-change: transform;
}
```

## 11. Record and Review Your Animations

Record your animation and scrub through it frame by frame. You'll notice details
invisible at full speed:

- Timing issues
- Easing mismatches
- Missing blur or opacity transitions
- Unexpected pops or jumps

Never ship animations the same day you build them. Step away, come back with fresh
eyes. The best animations are refined over multiple sessions.

## 12. Clip-Path for Advanced Effects

`clip-path` is hardware-accelerated and great for:

- Image reveal animations
- Comparison sliders
- Tab transitions with seamless text color changes
- Theme switch animations

```css
/* Image reveal on scroll */
.image-reveal {
  clip-path: inset(0 0 100% 0);
  animation: reveal 1s forwards cubic-bezier(0.77, 0, 0.175, 1);
}

@keyframes reveal {
  to { clip-path: inset(0 0 0 0); }
}
```

The tabs technique: duplicate the tab list, style one as active (different bg/text color),
clip it to show only the active tab, and animate the clip-path to the new tab position
for a seamless color transition.

## 13. Use ease-out for Both Enter AND Exit

Counter-intuitively, `ease-out` works for both enter and exit animations. The fast start
gives responsiveness in both directions. Don't use `ease-in` for exits — it feels sluggish.

```jsx
transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} // ease-out-quint for both
```

## 14. Appropriate Duration Guidelines

| Animation Type | Enter | Exit |
|---|---|---|
| Hover transitions | 150ms | 150ms |
| Modals, popovers | 200ms | 150ms |
| Toasts | 200ms | 150ms |
| Page transitions | 300–500ms | 200ms |
| Large view changes | 500–1000ms | 300ms |
| Spinners | continuous | — |

Exit animations should generally be **faster** than enter animations.
UI animations should stay under **300ms** as a rule of thumb.
