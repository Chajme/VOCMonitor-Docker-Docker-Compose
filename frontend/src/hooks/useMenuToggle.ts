import { useCallback, useEffect, useState } from "react";

/**
 * Mirrors visual-elements.js::setupMenuToggle.
 *
 * Below 1024px the sidebar is collapsible and the hamburger toggles it.
 * Opening the menu also closes the notification panel (handled by the caller
 * through `onOpen`).
 */
export function useMenuToggle(onOpen?: () => void) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const toggleMenu = useCallback(() => {
    if (window.innerWidth >= 1024) return;
    if (!menuOpen) onOpen?.();
    setMenuOpen((open) => !open);
  }, [menuOpen, onOpen]);

  useEffect(() => {
    const syncWithViewport = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };

    window.addEventListener("resize", syncWithViewport);
    syncWithViewport();
    return () => window.removeEventListener("resize", syncWithViewport);
  }, []);

  return { menuOpen, toggleMenu, closeMenu };
}
