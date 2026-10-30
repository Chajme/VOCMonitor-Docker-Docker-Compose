import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearNotifications,
  deleteNotification,
  getNotificationHistory,
} from "../../api/endpoints";
import type { AppNotification } from "../../api/types";
import { useSocket } from "../../hooks/useSocket";

export interface NotificationContextValue {
  isOpen: boolean;
  notifications: AppNotification[];
  loading: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  refresh: () => Promise<void>;
  remove: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const NotificationContext =
  createContext<NotificationContextValue | null>(null);

/** Mirrors handleNotification() in modules/socket.js. */
function showBrowserNotification(message: string): void {
  if (typeof Notification === "undefined") {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(message);
    return;
  }

  if (Notification.permission !== "denied") {
    void Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(message);
      }
    });
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNotificationHistory();
      if (result.ok) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const openPanel = useCallback(() => {
    setIsOpen(true);
    void refresh();
  }, [refresh]);

  const closePanel = useCallback(() => setIsOpen(false), []);

  const togglePanel = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      void refresh();
    }
  }, [isOpen, refresh]);

  const remove = useCallback(
    async (id: number) => {
      try {
        const result = await deleteNotification(id);
        if (
          result.ok &&
          result.data?.message === "Notification successfully deleted!"
        ) {
          await refresh();
        } else {
          alert("Failed to delete notification.");
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        alert("Failed to delete notification.");
      }
    },
    [refresh],
  );

  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      const result = await clearNotifications();
      if (result.data?.message) {
        alert(result.data.message);
      } else if (!result.ok) {
        alert("Failed to clear.");
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      alert("Failed to clear.");
    }
  }, []);

  useSocket(showBrowserNotification);

  const value = useMemo<NotificationContextValue>(
    () => ({
      isOpen,
      notifications,
      loading,
      openPanel,
      closePanel,
      togglePanel,
      refresh,
      remove,
      clearAll,
    }),
    [
      isOpen,
      notifications,
      loading,
      openPanel,
      closePanel,
      togglePanel,
      refresh,
      remove,
      clearAll,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
