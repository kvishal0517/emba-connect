/**
 * Contrast Utilities for EMBA Connect
 * Ensures WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
 */

/**
 * Calculate relative luminance of a color
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

/**
 * Get contrasting text color (black or white) based on background
 * Returns the color with better contrast ratio
 */
export function getContrastingTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#1e293b'; // Default to slate-900

  const whiteContrast = getContrastRatio(rgb, [255, 255, 255]);
  const blackContrast = getContrastRatio(rgb, [30, 41, 59]); // slate-900

  // Return white if it has better contrast, otherwise black
  return whiteContrast > blackContrast ? '#ffffff' : '#1e293b';
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsContrastStandard(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) return false;

  const ratio = getContrastRatio(fgRgb, bgRgb);
  const minRatio = isLargeText ? 3 : 4.5;

  return ratio >= minRatio;
}

/**
 * Predefined color combinations with guaranteed contrast
 */
export const accessibleColorCombos = {
  // Navy backgrounds
  navyBg: {
    bg: '#1e3a8a', // blue-900
    text: '#ffffff',
    textSecondary: '#e0e7ff', // blue-100
    border: '#3b82f6', // blue-500
  },
  // White backgrounds
  whiteBg: {
    bg: '#ffffff',
    text: '#1e293b', // slate-900
    textSecondary: '#64748b', // slate-500
    border: '#cbd5e1', // slate-300
  },
  // Light gray backgrounds
  lightGrayBg: {
    bg: '#f8fafc', // slate-50
    text: '#1e293b', // slate-900
    textSecondary: '#475569', // slate-600
    border: '#e2e8f0', // slate-200
  },
  // Gold/Amber backgrounds
  goldBg: {
    bg: '#f59e0b', // amber-500
    text: '#1e293b', // slate-900 (dark text on gold)
    textSecondary: '#422006', // amber-950
    border: '#d97706', // amber-600
  },
  // Blue accent backgrounds
  blueAccentBg: {
    bg: '#dbeafe', // blue-100
    text: '#1e3a8a', // blue-900
    textSecondary: '#1e40af', // blue-800
    border: '#93c5fd', // blue-300
  },
  // Success/Green
  successBg: {
    bg: '#dcfce7', // green-100
    text: '#14532d', // green-900
    textSecondary: '#166534', // green-800
    border: '#86efac', // green-300
  },
  // Error/Red
  errorBg: {
    bg: '#fee2e2', // red-100
    text: '#7f1d1d', // red-900
    textSecondary: '#991b1b', // red-800
    border: '#fca5a5', // red-300
  },
  // Warning/Amber
  warningBg: {
    bg: '#fef3c7', // amber-100
    text: '#78350f', // amber-900
    textSecondary: '#92400e', // amber-800
    border: '#fcd34d', // amber-300
  },
};

/**
 * Get accessible text class based on background color
 */
export function getAccessibleTextClass(bgClass: string): string {
  const darkBackgrounds = [
    'bg-slate-900',
    'bg-slate-800',
    'bg-blue-900',
    'bg-blue-800',
    'bg-gray-900',
    'bg-gray-800',
    'bg-black',
  ];

  const mediumBackgrounds = [
    'bg-blue-600',
    'bg-blue-700',
    'bg-slate-600',
    'bg-slate-700',
    'bg-amber-600',
    'bg-amber-700',
  ];

  if (darkBackgrounds.some((bg) => bgClass.includes(bg))) {
    return 'text-white';
  }

  if (mediumBackgrounds.some((bg) => bgClass.includes(bg))) {
    return 'text-white';
  }

  return 'text-slate-900';
}
