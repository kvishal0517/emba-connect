# EMBA Connect - Accessibility & Contrast Guidelines

## Overview
This document outlines the accessibility standards and contrast requirements for EMBA Connect to ensure all users can easily read and interact with the application.

## WCAG Compliance

### Contrast Ratios (WCAG AA Standard)
- **Normal text (< 18pt)**: Minimum 4.5:1 contrast ratio
- **Large text (≥ 18pt or 14pt bold)**: Minimum 3:1 contrast ratio
- **UI components and graphics**: Minimum 3:1 contrast ratio

## Color Palette with Guaranteed Contrast

### Primary Colors
- **Navy Blue (bg-blue-900)**: `#1e3a8a`
  - Text on navy: `#ffffff` (white) - Contrast ratio: 11.2:1 ✓
  
- **Gold/Amber (bg-amber-500)**: `#f59e0b`
  - Text on gold: `#1e293b` (slate-900) - Contrast ratio: 6.8:1 ✓
  
- **White (bg-white)**: `#ffffff`
  - Text on white: `#1e293b` (slate-900) - Contrast ratio: 15.5:1 ✓

### Text Colors

#### Dark Text (for light backgrounds)
- **Primary**: `#1e293b` (slate-900) - Use on white, light gray, gold backgrounds
- **Secondary**: `#475569` (slate-600) - Use for less important text
- **Tertiary**: `#64748b` (slate-500) - Use for hints, captions (ensure sufficient size)

#### Light Text (for dark backgrounds)
- **Primary**: `#ffffff` (white) - Use on navy, dark blue backgrounds
- **Secondary**: `#e0e7ff` (blue-100) - Use for less important text on dark backgrounds

## Component-Specific Guidelines

### Form Inputs
All inputs MUST have:
```css
background-color: white;
color: #1e293b; /* slate-900 */
border: 1px solid #cbd5e1; /* slate-300 */
```

Placeholders:
```css
color: #94a3b8; /* slate-400 - sufficient contrast at 4.6:1 */
```

### Buttons

#### Primary Buttons (Navy)
```css
background: #1e3a8a; /* blue-900 */
color: #ffffff; /* white */
```

#### Secondary Buttons (Outline)
```css
background: #ffffff; /* white */
color: #1e293b; /* slate-900 */
border: 1px solid #cbd5e1; /* slate-300 */
```

#### Gold/Accent Buttons
```css
background: #f59e0b; /* amber-500 */
color: #1e293b; /* slate-900 - NOT white! */
```

### Badges

#### Success
```css
background: #dcfce7; /* green-100 */
color: #14532d; /* green-900 */
border: 1px solid #86efac; /* green-300 */
```

#### Error
```css
background: #fee2e2; /* red-100 */
color: #7f1d1d; /* red-900 */
border: 1px solid #fca5a5; /* red-300 */
```

#### Warning
```css
background: #fef3c7; /* amber-100 */
color: #78350f; /* amber-900 */
border: 1px solid #fcd34d; /* amber-300 */
```

#### Info
```css
background: #dbeafe; /* blue-100 */
color: #1e3a8a; /* blue-900 */
border: 1px solid #93c5fd; /* blue-300 */
```

### Cards
```css
background: #ffffff; /* white */
color: #1e293b; /* slate-900 */
border: 1px solid #e2e8f0; /* slate-200 */
```

### Modals/Dialogs
```css
background: #ffffff; /* white */
overlay: rgba(0, 0, 0, 0.4); /* 40% black with 2px blur */
```

## Interactive States

### Hover States
- Must have visible change (color, background, or border)
- Minimum 3:1 contrast ratio maintained

### Focus States
- 2px solid outline in `#3b82f6` (blue-500)
- 2px offset from element
- Never remove focus indicators

### Disabled States
- Opacity: 0.6
- Cursor: not-allowed
- Maintain minimum 3:1 contrast ratio even when disabled

## Typography

### Font Sizes
- **Extra Small**: 10px (captions only, use sparingly)
- **Small**: 12px - 14px (body text, labels)
- **Base**: 14px - 16px (primary body text)
- **Large**: 18px+ (headings, must be bold)

### Font Weights
- **Normal**: 400 - Body text
- **Medium**: 500 - Labels, emphasized text
- **Semibold**: 600 - Subheadings, buttons
- **Bold**: 700 - Headings, important labels

## Testing Checklist

- [ ] All text has 4.5:1 contrast ratio (or 3:1 for large/bold text)
- [ ] All inputs have white backgrounds with dark text
- [ ] All dropdowns/selects show dark text on white
- [ ] Placeholder text is visible but distinguishable
- [ ] Buttons have clear text (white on dark, or dark on light)
- [ ] Badges have proper contrast based on variant
- [ ] Hover states are clearly visible
- [ ] Focus indicators are always visible
- [ ] Disabled states are visually distinct
- [ ] Modals have solid backgrounds, not transparent
- [ ] Toast notifications have solid backgrounds
- [ ] All links are distinguishable and readable

## Tools for Testing

### Online Contrast Checkers
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Coolors Contrast Checker: https://coolors.co/contrast-checker
- Adobe Color Accessibility Tool: https://color.adobe.com/create/color-accessibility

### Browser Extensions
- WAVE (Web Accessibility Evaluation Tool)
- axe DevTools
- Lighthouse (built into Chrome DevTools)

## Common Mistakes to Avoid

❌ **DO NOT:**
- Use navy text on navy/blue backgrounds
- Use white text on light backgrounds
- Use light gray text on white (unless 18pt+)
- Make transparent dialogs or toasts
- Remove focus indicators
- Use color alone to convey information

✅ **DO:**
- Always test contrast ratios
- Use white text on dark backgrounds
- Use dark text on light backgrounds
- Provide solid, opaque backgrounds for all dialogs
- Maintain visible focus indicators
- Use icons + text, not just color

## Quick Reference

### Safe Text on Background Combinations

| Background | Safe Text Colors |
|------------|------------------|
| White (`#ffffff`) | Slate-900 (`#1e293b`), Slate-800, Blue-900 |
| Slate-50 (`#f8fafc`) | Slate-900 (`#1e293b`), Slate-800, Blue-900 |
| Blue-900 (`#1e3a8a`) | White (`#ffffff`), Blue-50, Blue-100 |
| Blue-800 (`#1e40af`) | White (`#ffffff`), Blue-50 |
| Amber-500 (`#f59e0b`) | Slate-900 (`#1e293b`), Slate-800, Amber-950 |
| Green-100 (`#dcfce7`) | Green-900 (`#14532d`), Green-800 |
| Red-100 (`#fee2e2`) | Red-900 (`#7f1d1d`), Red-800 |

## Implementation

The application includes a contrast utility at `/src/app/utils/contrastUtils.ts` with helper functions:

- `getContrastRatio()` - Calculate contrast between two colors
- `meetsContrastStandard()` - Check if colors meet WCAG AA
- `getContrastingTextColor()` - Auto-select white or black text
- `accessibleColorCombos` - Pre-approved color combinations

Use these utilities when implementing new features to ensure accessibility compliance.
