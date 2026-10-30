import { useEffect, useRef } from "react";
import { useNotifications } from "../../hooks/useNotifications";

/**
 * Slide-out notification panel.
 *
 * Markup and the inline `right` animation mirror the old
 * notifications-container exactly (see app/templates/*.html).
 */
export default function NotificationPanel() {
  const { isOpen, notifications, closePanel, remove, clearAll } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (panelRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("#toggleNotifications")) {
        return;
      }

      closePanel();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closePanel]);

  return (
    <div
      className="notifications-container"
      id="notificationPanel"
      ref={panelRef}
      style={{ right: isOpen ? "0px" : "-350px" }}
    >
      <button className="close-btn" id="closeNotifications" onClick={closePanel}>
        ×
      </button>

      <h2>Notifications</h2>

      <div className="clear-all-container">
        <i
          className="material-icons md-light"
          id="clearAll"
          style={{ cursor: "pointer" }}
          role="button"
          tabIndex={0}
          aria-label="Clear all notifications"
          onClick={() => void clearAll()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              void clearAll();
            }
          }}
        >
          clear_all
        </i>
        <label style={{ color: "white" }}>Clear All</label>
      </div>

      <ul id="notification-list">
        {notifications.map((notification) => (
          <li key={notification.id} data-id={notification.id}>
            <strong>{notification.timestamp}</strong>
            <br />
            <br />
            {notification.message} <br />
            <br />
            <em>VOC Level: {notification.voc}</em>
            <button
              className="delete-btn"
              onClick={() => void remove(notification.id)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
