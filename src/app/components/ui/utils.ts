import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Filter out Figma inspector props that shouldn't be passed to DOM elements
 */
export function filterFigmaProps<T extends Record<string, any>>(props: T): Partial<T> {
  const filtered: any = {};
  for (const key in props) {
    if (!key.startsWith('_fg')) {
      filtered[key] = props[key];
    }
  }
  return filtered;
}