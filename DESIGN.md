# DESIGN.md — Bajaj CSR ImpactOS (Editorial Paper Mode)

## Surface Mode
Read + Operate hybrid. The user is a non-technical CSR Head scanning for a clear capital-allocation story, not an econometrician operating a flight cockpit.

## Palette (Warm Paper — NO pure #FFFFFF, NO cold #F8FAFC, NO neon pills)
- Canvas: linear-gradient(180deg, #F7F4ED 0%, #EFECE3 100%)
- Elevated Surface: #FCFBF8
- Hairline Border: 1px solid #E5DFD3 (no heavy drop shadows)
- Primary Ink: #1C1917 | Muted Ink: #6B655C
- Partner A / Verified Positive: #115E59
- Partner B: #4338CA
- Caution: #B45309 (soft bg #FDF6E7) | Risk: #B91C1C (soft bg #FCEAEA)

## Typography
- Narrative & Section Titles: 'Newsreader', Georgia, serif (regular/medium, tight tracking)
- UI, Body, Tables: 'Plus Jakarta Sans', sans-serif (BAN Inter/Roboto/Arial)
- All numbers: font-variant-numeric: tabular-nums

## Strict Anti-Patterns (Zero Tolerance)
- NO Cardocalypse: Do not wrap KPI stats or filter bars in boxed white cards; use open canvas with 1px hairline dividers and generous whitespace (48px–64px between narrative sections).
- NO Duplicate Filters: Never repeat geography/partner filters across two header bars. Max 3 top-level controls visible (Program dropdown, Location dropdown, Filters popover).
- NO Jargon or Raw Math: Ban SROI jargon, DiD formulas, raw LaTeX ($...$), or meta-text ("Zero mathematical hallucinations") on screen. Hide statistical methodology inside clickable info popovers.
- NO Misleading Scales: All percentage comparison bars must share an honest 0–100% scale.
- NO Overlapping Floating Bars: Never cover chart axes with sticky trays.
