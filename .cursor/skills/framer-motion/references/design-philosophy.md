# Design Philosophy

The principles behind animations that feel right. This is the "why" behind every
technical decision — understanding it produces better results than memorizing rules.

## What Makes an Animation Feel Right

An animation feels right when it feels **natural**. The UI becomes predictable and
delightful because it mirrors how things move in the physical world.

Nothing in the real world moves at a constant speed (linear), appears instantly, or
disappears without consequence. When our UI mimics physical motion — acceleration,
deceleration, momentum, gravity — it feels intuitive even if users can't articulate why.

**Natural motion makes things easier to understand.** This is why mobile apps often
feel better than web apps — iOS uses spring animations everywhere, making the
interface feel alive. Web apps often have instant, jarring state changes.

## Meaning: Link Actions to Consequences

For an animation to feel right, it must have **meaning** — a logical connection between
the action and the visual result:

- A card expanding into a detail view (spatial relationship)
- Menu items entering from the direction of the trigger (directional awareness)
- A button morphing into a popover (state transformation)
- Items being "thrown" into a trash icon (physical metaphor)

If you can't describe what benefit an animation provides, it probably shouldn't exist.

## Timing and Duration

### The Science
- Average human visual reaction time: **215ms**
- Sweet spot for most animations: **200–300ms**
- Eye movement range: **70–700ms** (location affects perceived duration)
- Color/opacity changes can be shorter (eyes are sensitive to these)

### Practical Guidelines
- **150ms**: hover transitions (already focused on the element)
- **200ms enter / 150ms exit**: modals, popovers, dropdowns
- **200–300ms**: general UI transitions
- **500ms+**: large view changes, illustrative animations
- **Never exceed 700ms** for interactive UI

### Duration Affects Feel
- **Faster animations** → the product feels snappy, responsive (Vercel's philosophy)
- **Slightly slower animations** → the product feels premium, elegant (Sonner's philosophy)
- **Too slow** → the product feels sluggish, user gets impatient

### Enter vs Exit
Exit animations should be **faster** than enter animations. The user has already decided
to dismiss — don't make them wait. Sonner uses 200ms enter, 150ms exit.

## Feeling: Animation as Brand

Animation style communicates brand personality, just like typography and color:

| Brand Feel | Animation Style |
|---|---|
| Premium, reliable (Stripe) | Slow, deliberate transitions |
| Fast, efficient (Vercel) | Very fast or instant transitions |
| Elegant, refined (Sonner) | Slightly slower with `ease` curve |
| Edgy, forward-thinking | Strong `ease-in-out` curves |
| Playful, physical | Spring animations with subtle bounce |

**Marketing pages** are where you convey brand feeling through animation timing.
**Product UI** should always prioritize speed and responsiveness.

## Purpose: When to Animate

### Animate when it adds context
- Enter/exit transitions for overlays (modals, popovers, dropdowns)
- State changes that need user attention (success, error, loading)
- Spatial relationships (card → detail, button → form)
- Content revealing on scroll (image reveals, staggered entries)
- Morphing between related states (button → popover)

### Don't animate when
- **Frequently repeated interactions** (command menu keyboard nav, bookmarking)
- **Keyboard-driven navigation** (feels mechanical, animation adds delay)
- **Subsequent tooltips** (after first tooltip is shown, skip animation for others)
- The animation doesn't serve the user — it just looks cool

### The Pacing Rule
Pace animations through the experience. A few well-placed, carefully crafted animations
create more impact than animating everything. Too many animations overwhelm users and
reduce the impact of each one.

**Philosophy:** Incorporate animations everyone expects (enter/exit transitions), then
sprinkle in a few exceptionally well-crafted ones for context and delight. The quantity
must be carefully chosen — tasteful and elegant, not excessive.

## Orchestration

Sequencing animations creates a sense of flow and quality. Instead of everything
animating at once, stagger elements like a wave:

- Paco Coursey's site fades in elements sequentially — it feels like a moment of joy
- Apple's navigation menu fades columns with slight delays — wave effect
- Page enter animations stagger from top to bottom

The delay between staggered items must be just right (typically 30–60ms). Too fast looks
simultaneous, too slow feels like a loading issue. This is trial and error — there's
no formula, only taste.

### CSS Orchestration
```css
.item:nth-child(1) { animation-delay: 0s; }
.item:nth-child(2) { animation-delay: 0.05s; }
.item:nth-child(3) { animation-delay: 0.1s; }
```

### Framer Motion Orchestration
```jsx
const container = {
  visible: { transition: { staggerChildren: 0.05 } },
};
```

## Blur as a Design Tool

Blur creates a better sense of motion and masks imperfections:

- Adds depth to enter/exit transitions
- Makes crossfades between states feel smoother
- Hides the "two distinct objects" problem in state swaps
- Used in the Dynamic Island for a more organic feel

```jsx
initial={{ opacity: 0, filter: "blur(4px)" }}
animate={{ opacity: 1, filter: "blur(0px)" }}
```

## Fluid Interfaces: The Future

The ultimate goal is an interface where any element can transform into another —
no hard cuts, no instant state changes. iOS nails this with SwiftUI.

On the web, this is harder but achievable with:
- Shared layout animations (layoutId in Framer Motion)
- Morphing components (button → form)
- Continuous transitions (drag to dismiss with scale)

**Don't pursue fluidity at the expense of features, bug fixes, or core UX.**
It's time-consuming and the web's tooling isn't fully there yet. But knowing what
"great" looks like helps you make better decisions about where to invest animation effort.

## Taste

Taste is the ability to form opinions with your gut that you can justify with your head.

### How to develop animation taste
1. **Create constantly** — close the gap between recognizing good animation and producing it
2. **Record and study** — scrub through great animations frame by frame
3. **Build a reference vault** — save animations you admire, organized by type
4. **Copy to learn** — recreate animations you love (to learn, not to steal)
5. **Review your own work** — step away, come back with fresh eyes
6. **Use other products mindfully** — notice what feels good and why

### The care principle
Taste doesn't matter without care. Users can feel whether someone cared about their
product. The best animations come from people who replay them daily until they're
satisfied, who give themselves breaks and return with fresh perspective, who refuse
to ship until it feels right.

## Speed and Perceived Performance

Animation speed directly affects how fast your product **feels**:

- A faster spinner makes loading seem faster (even with identical load time)
- A 180ms select animation feels more responsive than 400ms
- Fluid page transitions create perception of instant navigation
- Seamless morphing between views hides loading time

When in doubt, make it faster.
