export type NotificationSeverity = "critical" | "warning" | "info" | "success";
export type NotificationCategory = "incident" | "ssl" | "system" | "maintenance";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: NotificationSeverity;
  category: NotificationCategory;
  targetUrl?: string;
  opdCode?: string;
}

export interface NotificationChannelConfig {
  id: string;
  name: string;
  type: "telegram" | "email" | "webhook";
  destination: string;
  isEnabled: boolean;
  subscribedCategories: NotificationCategory[];
  minSeverity: NotificationSeverity;
}

export interface RecipientContact {
  id: string;
  opdCode: string;
  opdName: string;
  picName: string;
  email: string;
  telegramHandle?: string;
  phone: string;
  isAlertActive: boolean;
}
