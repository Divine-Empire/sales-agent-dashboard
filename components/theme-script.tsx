/**
 * Runs before React hydrates, so the theme is correct on first paint — no
 * flash of light-then-dark (or vice versa) while JavaScript loads.
 *
 * Default is light (per spec), overridden only by an explicit stored choice.
 * We deliberately do NOT fall back to prefers-color-scheme: the ask was a
 * light default with a manual toggle, not an OS-following theme.
 */
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
