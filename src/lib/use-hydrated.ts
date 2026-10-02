import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False in the server-rendered HTML and until React has hydrated, then true.
 *
 * Forms keep their submit button disabled until then. Without this, pressing
 * it before the JavaScript loads (slow mobile connections) performs a native
 * GET submission: nothing is saved, the form comes back empty, and every
 * entered detail lands in the URL — browser history, server logs, referrers.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
