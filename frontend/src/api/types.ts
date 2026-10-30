/**
 * Wire types for the Flask JSON API.
 *
 */

export interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  voc_index: number;
}

export interface AllData {
  timestamp: string[];
  temperature: number[];
  humidity: number[];
  voc_index: number[];
}

/** SQL AVG/MIN/MAX return NULL when the time window is empty. */
export type NullableNumber = number | null;

export interface Averages {
  avg_24h: NullableNumber;
  avg_72h: NullableNumber;
  avg_7d: NullableNumber;
}

export interface MinMax {
  min_24h: NullableNumber;
  max_24h: NullableNumber;
  min_72h: NullableNumber;
  max_72h: NullableNumber;
}

export interface Device {
  id: number;
  device_name: string;
  topic: string;
}

export interface AppNotification {
  id: number;
  timestamp: string;
  message: string;
  voc: number;
}

export interface CurrentDevice {
  selected_device: string;
}

export interface ApiMessage {
  message: string;
}

/**
 * Exactly the flat object returned by DatabaseManager.get_user_settings().
 * Booleans are already cast server-side.
 */
export interface Settings {
  advice1: string;
  advice2: string;
  advice3: string;
  advice4: string;
  advice5: string;
  advice6: string;

  fetch_sensor: number;
  fetch_averages: number;
  fetch_minmax: number;

  notifications: boolean;
  notification_threshold: number;
  cooldown: number;
  notification_message: string;

  email_notifications_on: boolean;
  email_notification_threshold: number;
  email_cooldown: number;
  email_address: string;

  esp_alarm_enabled: boolean;
  alarm_time: number;

  temp_notifications_enabled: boolean;
  temp_threshold: number;
  temp_cooldown: number;

  humi_notifications_enabled: boolean;
  humi_threshold: number;
  humi_cooldown: number;
}
