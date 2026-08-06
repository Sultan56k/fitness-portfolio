/**
 * Carries "which pricing plan did they click?" from the Pricing section to the
 * Contact form.
 *
 * Without this the pricing CTAs scrolled to the form and the lead arrived with
 * no indication of which plan prompted it — the most useful qualifying detail
 * on the page was being thrown away at the moment of intent.
 *
 * A module-level store rather than context: Pricing and Contact are siblings
 * far apart in the tree, and threading a provider through the page for one
 * string would be heavier than the problem warrants.
 */

type Listener = (plan: string | null) => void;

let currentPlan: string | null = null;
const listeners = new Set<Listener>();

/** Record the plan a visitor clicked, and notify the contact form. */
export function setPlanIntent(plan: string | null): void {
  currentPlan = plan;
  listeners.forEach((listener) => listener(currentPlan));
}

export function getPlanIntent(): string | null {
  return currentPlan;
}

/**
 * Subscribe to plan changes. Returns an unsubscribe function.
 *
 * The cleanup deliberately returns void rather than `Set.delete`'s boolean —
 * React treats a truthy return from an effect cleanup as a mistake.
 */
export function subscribePlanIntent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
