import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import {
  getActiveNavIndex,
  navItems,
  routeNavItems,
} from "../../lib/navItems";

interface SidebarProps {
  open: boolean;
  onNavigate?: () => void;
}

/**
 * Sidebar shared by every page.
 *
 * Reproduces the old `.menu-section` markup and the highlight behaviour from
 * visual-elements.js (pathname match, then localStorage fallback).
 */
export default function Sidebar({ open, onNavigate }: SidebarProps) {
  const { pathname } = useLocation();
  const { isOpen: panelOpen, togglePanel } = useNotifications();

  const [savedIndex, setSavedIndex] = useState<number | null>(() => {
    const raw = localStorage.getItem("selectedMenuOption");
    if (raw === null) return null;

    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
  });

  const activeIndex = useMemo(
    () => getActiveNavIndex(pathname, savedIndex),
    [pathname, savedIndex],
  );

  const handleNavigate = (index: number) => {
    localStorage.setItem("selectedMenuOption", String(index));
    setSavedIndex(index);
    onNavigate?.();
  };

  return (
    <div className={`menu-section${open ? " open" : ""}`}>
      <div className="menu-div">
        <div className="menu-section-flex-container">
          <div className="logo">
            <h1>
              <img
                className="logo-image"
                src="/static/images/VOCMonitorLogo.png"
                title="Logo Image"
                alt="VOC Monitor logo"
              />
            </h1>
          </div>

          <nav className="sidebar-nav">
            <ul className="nav-list">
              {navItems.map((item) => {
                if (item.kind === "action") {
                  return (
                    <li key={item.label}>
                      <a
                        href="#"
                        id="toggleNotifications"
                        data-selected={panelOpen ? "true" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          // Old behaviour: opening the panel closes the mobile menu.
                          onNavigate?.();
                          togglePanel();
                        }}
                      >
                        <i className="material-icons md-light">{item.icon}</i>
                        <h4>{item.label}</h4>
                      </a>
                    </li>
                  );
                }

                const index = routeNavItems.findIndex(
                  (route) => route.to === item.to,
                );
                const selected = index === activeIndex;
                const content = (
                  <>
                    <i className="material-icons md-light">{item.icon}</i>
                    <h4>{item.label}</h4>
                  </>
                );

                return (
                  <li key={item.label}>
                    {item.migrated ? (
                      <Link
                        className="nav-list-link"
                        to={item.to}
                        data-selected={selected ? "true" : undefined}
                        onClick={() => handleNavigate(index)}
                      >
                        {content}
                      </Link>
                    ) : (
                      <a
                        className="nav-list-link"
                        href={item.to}
                        data-selected={selected ? "true" : undefined}
                        onClick={() => handleNavigate(index)}
                      >
                        {content}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
