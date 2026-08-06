import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWhatsAppLink(number: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

/**
 * Thousands-separated amount for display, e.g. 11000 → "11,000".
 *
 * Locale is pinned to en-US rather than left to the runtime: the server and the
 * browser must produce byte-identical output or React reports a hydration
 * mismatch, and the visitor's locale would vary that grouping.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}
