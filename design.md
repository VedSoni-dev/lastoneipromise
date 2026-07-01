# Design: Vedant Soni

This personal site should feel like a thoughtful person explaining something, not a funnel trying to close a lead.

## Genre

Editorial, relaxed, and plainspoken.

## Macrostructure family

- Homepage: Letter, with edge-aligned navigation and a letter-close footer.
- Content index: Index-first, with generous type and a simple article list.
- Articles: Long Document, with a narrow reading measure and an author path back to the homepage.

## Theme

- Paper: warm off-white, `oklch(96.5% 0.014 84)`
- Ink: blue-black, `oklch(19% 0.016 255)`
- Accent: useful-link blue, `oklch(48% 0.145 252)`
- Rules: warm gray, `oklch(84% 0.018 84)`

## Typography

- Display: Instrument Serif, weight 400
- Body: Space Grotesk, weights 300 to 500
- Display tracking: `-0.025em`
- Reading measure: 65 characters or fewer

## Spacing

Use the 4-point named scale from `tokens.css`. Page CSS uses tokens instead of raw spacing values.

## Motion

- No entrance choreography or scroll effects.
- Hover feedback uses opacity only.
- Reduced motion falls back to a 100 ms transition.

## Microinteractions stance

- Links are underlined and obvious.
- Focus rings appear immediately.
- No sticky conversion bars, popups, or celebratory effects.

## CTA voice

- Calls to action are ordinary text links.
- Labels describe the destination, such as “Read the guide” or “More about me.”

## Per-page allowances

- Homepage: typography only.
- Content pages: typography only.
- No decorative AI imagery, glass panels, or fake product interfaces.

## What pages must share

- Instrument Serif and Space Grotesk
- Warm paper, dark ink, and blue links
- Hairline dividers
- Plain-English link labels
- A visible path between the articles and Vedant’s homepage

## Exports

The source CSS is `/tokens.css` at the project root.

### Tailwind v4

```css
@theme {
  --color-paper: oklch(96.5% 0.014 84);
  --color-ink: oklch(19% 0.016 255);
  --color-accent: oklch(48% 0.145 252);
  --font-display: 'Instrument Serif', ui-serif, Georgia, serif;
  --font-body: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
}
```

### DTCG

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(96.5% 0.014 84)", "$type": "color" },
    "ink": { "$value": "oklch(19% 0.016 255)", "$type": "color" },
    "accent": { "$value": "oklch(48% 0.145 252)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Instrument Serif, ui-serif, Georgia, serif", "$type": "fontFamily" },
    "body": { "$value": "Space Grotesk, ui-sans-serif, system-ui, sans-serif", "$type": "fontFamily" }
  }
}
```

### shadcn/ui variables

```css
:root {
  --background: 96.5% 0.014 84;
  --foreground: 19% 0.016 255;
  --primary: 48% 0.145 252;
  --primary-foreground: 98% 0.008 84;
  --muted: 84% 0.018 84;
  --muted-foreground: 48% 0.018 255;
  --border: 84% 0.018 84;
  --ring: 52% 0.18 252;
  --radius: 0;
}
```
