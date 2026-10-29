export type NotificationType = 
  | 'risk_created' 
  | 'risk_critical' 
  | 'action_assigned' 
  | 'action_overdue' 
  | 'action_closed' 
  | 'soa_gap' 
  | 'soa_updated'
  | 'security_alert' 
  | 'account_status' 
  | 'system';

export type NotificationPriority = 'critique' | 'haute' | 'moyenne' | 'info';

export type NotificationCategory = 'risques' | 'actions' | 'soa' | 'iam' | 'gouvernance';

export interface AppNotification {
  id: string;
  recipientUserId: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string; // ISO string
  isRead: boolean;
  readAt?: string | null;
  targetModule?: string; // e.g. 'risks', 'actions', 'soa', 'iam', 'governance'
  targetResourceId?: string; // e.g. 'RSK-01', 'act-123', 'A.8.5'
  actionUrl?: string;
  actionLabel?: string; // e.g. "Consulter le risque", "Voir l'action"
  organizationId?: string;
}
