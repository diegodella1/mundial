# Matchfeel Design System

## Brand Identity
- **Product**: Real-time World Cup 2026 reactions PWA
- **Vibe**: Electric, immersive, data-driven. Sports energy meets data visualization.
- **Personality**: Bold, fast, global. Feels like being inside the stadium's pulse.

## Color Palette

### Base (Dark Theme)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-app` | `#09090b` (zinc-950) | App background |
| `--bg-surface` | `#18181b` (zinc-900) | Cards, panels |
| `--bg-surface-elevated` | `#27272a` (zinc-800) | Elevated surfaces, inputs |
| `--bg-surface-hover` | `#3f3f46` (zinc-700) | Hover states |
| `--border-subtle` | `#27272a80` (zinc-800/50) | Subtle borders |
| `--border-default` | `#3f3f46` (zinc-700) | Default borders |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#fafafa` (zinc-50) | Headings, important text |
| `--text-secondary` | `#a1a1aa` (zinc-400) | Body text, labels |
| `--text-muted` | `#71717a` (zinc-500) | Timestamps, hints |
| `--text-faint` | `#52525b` (zinc-600) | Decorative text |

### Accent
| Token | Value | Usage |
|-------|-------|-------|
| `--accent-live` | `#ef4444` (red-500) | Live indicators, urgent |
| `--accent-goal` | `#22c55e` (emerald-500) | Goals, success |
| `--accent-fire` | `#f97316` (orange-500) | Sponsored, hot |
| `--accent-info` | `#3b82f6` (blue-500) | Info, saves |
| `--accent-cta` | `#ffffff` | Primary CTA buttons |

### Gradients
| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-receipt` | `from-orange-500 via-purple-500 to-pink-500` | Receipt card border |
| `--gradient-cta` | `from-orange-500 to-pink-500` | Share/CTA buttons |
| `--gradient-map-heat` | 8-step: `#1a1a2e` → `#c0392b` | Map intensity |

## Typography
| Role | Classes | Usage |
|------|---------|-------|
| Display | `text-4xl font-bold tracking-tight` | Hero headings |
| Heading | `text-xl font-bold` | Section titles |
| Subheading | `text-sm font-semibold uppercase tracking-wider` | Section labels |
| Body | `text-sm text-zinc-300` | Content text |
| Caption | `text-xs text-zinc-500` | Timestamps, metadata |
| Mono | `font-mono tabular-nums` | Scores, stats |
| Micro | `text-[11px]` | Minimum readable size |

## Spacing & Layout
- **Container**: `max-w-lg mx-auto` (mobile-first, 512px max)
- **Card padding**: `p-4` standard, `p-5` for receipts
- **Gap**: `gap-3` between cards, `gap-2` between button grids
- **Border radius**: `rounded-xl` cards, `rounded-lg` buttons/inputs, `rounded-full` badges/avatars

## Components

### Buttons
- **Primary CTA**: `bg-white text-zinc-900 hover:bg-zinc-100 active:scale-[0.97] font-semibold rounded-lg px-4 py-2.5`
- **Secondary**: `bg-zinc-800 text-zinc-100 hover:bg-zinc-700 rounded-lg px-4 py-2`
- **Ghost**: `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg px-3 py-1.5`
- **Danger**: `text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg`

### Cards
- **Standard**: `bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl`
- **Interactive**: Standard + `hover:bg-zinc-800/80 hover:border-zinc-700/50 transition-all cursor-pointer`
- **Elevated**: `bg-zinc-800/90 backdrop-blur rounded-xl shadow-lg shadow-black/20`

### Inputs
- **Text**: `bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 outline-none transition-colors`

### Live Indicator
```html
<span class="relative flex h-2.5 w-2.5">
  <span class="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75" />
  <span class="relative h-2.5 w-2.5 rounded-full bg-red-500" />
</span>
```

### Glass Surfaces
- **Nav**: `backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/40`
- **Drawer**: `backdrop-blur-xl bg-zinc-950/90 border-t border-zinc-800/40 rounded-t-3xl`
- **Match overlay**: `bg-zinc-950/90 backdrop-blur-xl rounded-t-3xl`

## Animations
| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `fly-up` | 0.8s | ease-out | Emoji reaction float |
| `fade-in` | 0.3s | ease-out | Content appear |
| `slide-up` | 0.3s | cubic-bezier(0.16,1,0.3,1) | Drawer expand |
| `pulse` | 2s | cubic-bezier(0.4,0,0.6,1) | Live indicator |
| `scale-tap` | 0.1s | ease-out | Button press (scale 0.95) |

## Interaction Patterns
- **Reaction**: Tap → scale(0.9) → fly-up emoji → 1s cooldown
- **Card navigation**: Tap → subtle scale(0.98) → route transition
- **Drawer**: Tap header → slide-up 300ms
- **Chat send**: Tap → spinner → message appears → auto-scroll
- **Share**: Tap → Web Share API → fallback clipboard toast

## Accessibility
- All interactive elements must have `focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950`
- Minimum touch target: 44x44px
- Minimum text size: 11px (use sparingly, 12px+ preferred)
- Live indicators: accompany with text labels, not color-only
- ARIA labels on icon buttons and status indicators
