# Easing Blueprint

Complete reference for choosing and applying easing curves. Based on custom curves by Benjamin De Cock,
sorted from weakest to strongest acceleration within each category.

## Decision Matrix

| Context | Easing Type | Duration |
|---|---|---|
| Enter/exit animations (modals, dropdowns, popovers) | `ease-out` | 200ms enter, 150ms exit |
| On-screen movement (repositioning, morphing) | `ease-in-out` | 200–300ms |
| Hover effects (color, bg-color, opacity) | CSS `ease` | 150–200ms |
| Continuous loops (spinners, marquees) | `linear` | varies |
| Never use for UI | `ease-in` | — |

## Rule: Never Use Built-In CSS Easings (Except `ease` and `linear`)

The built-in `ease-in`, `ease-out`, and `ease-in-out` in CSS are too weak — their acceleration
curves are not strong enough for polished UI. Always use the custom cubic-bezier values below.

---

## Custom Easing Curves

### ease-out (Most Used — Enter/Exit Animations)

Starts fast, slows down. Gives the user an immediate feeling of responsiveness.

| Name | Value |
|---|---|
| `ease-out-quad` | `cubic-bezier(.25, .46, .45, .94)` |
| `ease-out-cubic` | `cubic-bezier(.215, .61, .355, 1)` |
| `ease-out-quart` | `cubic-bezier(.165, .84, .44, 1)` |
| `ease-out-quint` | `cubic-bezier(.23, 1, .32, 1)` |
| `ease-out-expo` | `cubic-bezier(.19, 1, .22, 1)` |
| `ease-out-circ` | `cubic-bezier(.075, .82, .165, 1)` |

**Recommended default:** `ease-out-quint` or `ease-out-expo` for most UI.

### ease-in-out (On-Screen Movement)

Smooth acceleration and deceleration, like a car. Satisfying to watch. Use for elements
that are already visible and need to move or morph.

| Name | Value |
|---|---|
| `ease-in-out-quad` | `cubic-bezier(.455, .03, .515, .955)` |
| `ease-in-out-cubic` | `cubic-bezier(.645, .045, .355, 1)` |
| `ease-in-out-quart` | `cubic-bezier(.77, 0, .175, 1)` |
| `ease-in-out-quint` | `cubic-bezier(.86, 0, .07, 1)` |
| `ease-in-out-expo` | `cubic-bezier(1, 0, 0, 1)` |
| `ease-in-out-circ` | `cubic-bezier(.785, .135, .15, .86)` |

**Recommended default:** `ease-in-out-quart` for a strong, energetic feel.

### ease-in (Avoid for UI)

Starts slow, speeds up. Makes interfaces feel sluggish. Should generally be avoided.
Only listed for completeness or rare decorative use.

| Name | Value |
|---|---|
| `ease-in-quad` | `cubic-bezier(.55, .085, .68, .53)` |
| `ease-in-cubic` | `cubic-bezier(.550, .055, .675, .19)` |
| `ease-in-quart` | `cubic-bezier(.895, .03, .685, .22)` |
| `ease-in-quint` | `cubic-bezier(.755, .05, .855, .06)` |
| `ease-in-expo` | `cubic-bezier(.95, .05, .795, .035)` |
| `ease-in-circ` | `cubic-bezier(.6, .04, .98, .335)` |

---

## Hover Transitions

```css
/* Simple hover: use built-in ease, 200ms */
.element {
  transition: color 200ms ease, background-color 200ms ease, opacity 200ms ease;
}

/* Disable on touch devices */
@media (hover: hover) and (pointer: fine) {
  .card:hover {
    transform: scale(1.02);
  }
}
```

Since Tailwind v4, the `hover:` class only applies when the device supports hover.
If not using Tailwind, always wrap hover effects in the media query above.

---

## CSS Transition Pattern

```css
/* Enter animation */
.dialog[data-state="open"] {
  animation: fadeIn 200ms cubic-bezier(.23, 1, .32, 1);
}

/* Exit animation (slightly faster) */
.dialog[data-state="closed"] {
  animation: fadeOut 150ms cubic-bezier(.23, 1, .32, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.96); }
}
```

---

## Framer Motion Easing

In Framer Motion, you can pass cubic-bezier arrays to the `transition.ease` property:

```jsx
transition={{
  duration: 0.2,
  ease: [0.23, 1, 0.32, 1], // ease-out-quint
}}
```

However, prefer spring animations over duration-based easings in Framer Motion whenever
possible, as springs are interruptible and feel more natural.

---

## External Resource

Full interactive easing library: https://easings.co
