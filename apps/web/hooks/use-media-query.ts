import * as React from "react";

/** Tailwind `lg` breakpoint — app shell requires at least this width. */
export const LG_BREAKPOINT = 1024;

/**
 * Subscribe to a CSS media query.
 * Returns `undefined` until mounted (SSR-safe), then boolean.
 */
export function useMediaQuery(query: string): boolean | undefined {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** `true` when viewport is below Tailwind `lg` (1024px). */
export function useIsBelowLg(): boolean {
  const matches = useMediaQuery(`(max-width: ${LG_BREAKPOINT - 1}px)`);
  // Default to true (show gate) until measured — avoids flashing desktop UI on phones
  return matches ?? true;
}
