/**
 * One typed function per Flask endpoint.
 *
 * Body formats are intentional and mirror the current backend:
 * - form-encoded: /update_settings, /new_device
 * - JSON:         /default_settings, /notification_clear, /delete_notification,
 *                 /devices_clear, /delete_device, /select_device
 */
import { apiGet, apiPostForm, apiPostJson } from "./client";
import type {
  AllData,
  ApiMessage,
  AppNotification,
  Averages,
  CurrentDevice,
  Device,
  MinMax,
  SensorReading,
  Settings,
} from "./types";

/* ------------------------------------------------------------------ data */

export const getAllData = () => apiGet<AllData>("/all-data");

/** `/data` also triggers notification checks server-side. */
export const getLatestReading = () => apiGet<SensorReading>("/data");

export const getAverages = () => apiGet<Averages>("/avg");

export const getMinMax = () => apiGet<MinMax>("/minmax");

/* -------------------------------------------------------------- settings */

export const getSettings = () => apiGet<Settings>("/get_settings");

export const updateSettings = (form: URLSearchParams | FormData) =>
  apiPostForm<ApiMessage>("/update_settings", form);

export const resetSettings = () => apiPostJson<ApiMessage>("/default_settings", {});

/* --------------------------------------------------------- notifications */

export const getNotificationHistory = () =>
  apiGet<AppNotification[]>("/notification_history");

export const clearNotifications = () =>
  apiPostJson<ApiMessage>("/notification_clear", {});

export const deleteNotification = (id: number) =>
  apiPostJson<ApiMessage>("/delete_notification", { id });

/* --------------------------------------------------------------- devices */

export const getDevices = () => apiGet<Device[]>("/devices_list");

export const newDevice = (deviceName: string, topic: string) => {
  const form = new URLSearchParams();
  form.set("device_name", deviceName);
  form.set("topic", topic);
  return apiPostForm<ApiMessage>("/new_device", form);
};

export const clearDevices = () => apiPostJson<ApiMessage>("/devices_clear", {});

export const deleteDevice = (id: number, deviceName: string, topic: string) =>
  apiPostJson<ApiMessage>("/delete_device", {
    id,
    device_name: deviceName,
    topic,
  });

export const selectDevice = (id: number, deviceName: string, topic: string) =>
  apiPostJson<ApiMessage>("/select_device", {
    id,
    topic,
    device_name: deviceName,
  });

export const getCurrentDevice = () => apiGet<CurrentDevice>("/current_device");
