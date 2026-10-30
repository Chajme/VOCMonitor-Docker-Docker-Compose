import { useContext } from "react";
import {
  NotificationContext,
  type NotificationContextValue,
} from "../components/notifications/NotificationProvider";

export function useNotifications(): NotificationContextValue {
  const value = useContext(NotificationContext);

  if (!value) {
    throw new Error(
      "useNotifications must be used within <NotificationProvider>",
    );
  }

  return value;
}
