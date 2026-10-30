import { Outlet } from "react-router-dom";
import NotificationPanel from "../notifications/NotificationPanel";
import { useMenuToggle } from "../../hooks/useMenuToggle";
import { useNotifications } from "../../hooks/useNotifications";
import MenuToggle from "./MenuToggle";
import Sidebar from "./Sidebar";

interface LayoutProps {
  /**
   * The old templates use two grids:
   * - "grid"  -> .container-grid      (Home)
   * - "basic" -> .container-grid-basic (all other pages)
   */
  variant?: "grid" | "basic";
}

/**
 * Shared page chrome. Page components render bare sections (e.g.
 * `.main-section-chart`) and are placed after the sidebar, exactly where the
 * old templates put them.
 */
export default function Layout({ variant = "basic" }: LayoutProps) {
  const { closePanel } = useNotifications();
  const { menuOpen, toggleMenu, closeMenu } = useMenuToggle(closePanel);

  return (
    <div
      className={variant === "grid" ? "container-grid" : "container-grid-basic"}
    >
      <MenuToggle onClick={toggleMenu} />
      <NotificationPanel />
      <Sidebar open={menuOpen} onNavigate={closeMenu} />
      <Outlet />
    </div>
  );
}
