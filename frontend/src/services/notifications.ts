import { AppNotification, NotificationPriority, NotificationCategory, NotificationType } from '../types/notification';
import { UserAccount, RoleDefinition } from '../types/auth';
import { Risk, CorrectiveAction, SoAControl } from '../types/grc';

/**
 * Filtre les notifications strictement destinées à un utilisateur donné
 * (Protection de la confidentialité et des permissions)
 */
export function getNotificationsForUser(
  notifications: AppNotification[],
  userId: string
): AppNotification[] {
  if (!userId) return [];
  return notifications
    .filter(n => n.recipientUserId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Calcule le nombre exact de notifications non lues d'un utilisateur
 */
export function getUnreadNotificationsCount(
  notifications: AppNotification[],
  userId: string
): number {
  if (!userId) return 0;
  return notifications.filter(n => n.recipientUserId === userId && !n.isRead).length;
}

/**
 * Marque une notification spécifique comme lue (avec vérification du destinataire)
 */
export function markNotificationAsRead(
  notifications: AppNotification[],
  notificationId: string,
  currentUserId: string
): AppNotification[] {
  return notifications.map(n => {
    if (n.id === notificationId && n.recipientUserId === currentUserId) {
      return {
        ...n,
        isRead: true,
        readAt: n.readAt || new Date().toISOString()
      };
    }
    return n;
  });
}

/**
 * Marque une notification comme non lue
 */
export function markNotificationAsUnread(
  notifications: AppNotification[],
  notificationId: string,
  currentUserId: string
): AppNotification[] {
  return notifications.map(n => {
    if (n.id === notificationId && n.recipientUserId === currentUserId) {
      return {
        ...n,
        isRead: false,
        readAt: null
      };
    }
    return n;
  });
}

/**
 * Marque l'intégralité des notifications de l'utilisateur comme lues
 */
export function markAllNotificationsAsRead(
  notifications: AppNotification[],
  currentUserId: string
): AppNotification[] {
  const now = new Date().toISOString();
  return notifications.map(n => {
    if (n.recipientUserId === currentUserId && !n.isRead) {
      return {
        ...n,
        isRead: true,
        readAt: now
      };
    }
    return n;
  });
}

/**
 * Supprime une notification appartenant à l'utilisateur
 */
export function deleteNotification(
  notifications: AppNotification[],
  notificationId: string,
  currentUserId: string
): AppNotification[] {
  return notifications.filter(n => !(n.id === notificationId && n.recipientUserId === currentUserId));
}

/**
 * Purge toutes les notifications lues de l'utilisateur
 */
export function clearReadNotifications(
  notifications: AppNotification[],
  currentUserId: string
): AppNotification[] {
  return notifications.filter(n => !(n.recipientUserId === currentUserId && n.isRead));
}

/**
 * Vérifie l'anti-doublon (déduplication) dans un intervalle de 5 minutes
 */
function isDuplicate(
  existingNotifications: AppNotification[],
  recipientUserId: string,
  type: NotificationType,
  targetResourceId?: string
): boolean {
  if (!targetResourceId) return false;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return existingNotifications.some(n => 
    n.recipientUserId === recipientUserId &&
    n.type === type &&
    n.targetResourceId === targetResourceId &&
    new Date(n.createdAt).getTime() > fiveMinutesAgo
  );
}

/**
 * DÉCLENCHEUR MÉTIER 1 : Création ou qualification d'un Risque
 * Notifie les RSSI, Administrateurs et le Responsable désigné
 */
export function dispatchRiskNotification(
  risk: Risk,
  accounts: UserAccount[],
  existingNotifications: AppNotification[]
): AppNotification[] {
  const newNotifs: AppNotification[] = [];
  const isHighOrCritical = risk.level === 'Critique' || risk.level === 'Élevé';

  // Destinataires : Super Admin, Org Admin, RSSI et Propriétaire du risque
  const recipients = accounts.filter(acc => {
    const hasAdminOrRssiRole = acc.roleIds.some(r => 
      r === 'role-super-admin' || r === 'role-org-admin' || r === 'role-rssi'
    );
    const isOwner = risk.owner && (
      acc.name.toLowerCase().includes(risk.owner.toLowerCase()) || 
      risk.owner.toLowerCase().includes(acc.name.toLowerCase())
    );
    return acc.status === 'actif' && (hasAdminOrRssiRole || isOwner);
  });

  const priority: NotificationPriority = risk.level === 'Critique' ? 'critique' : risk.level === 'Élevé' ? 'haute' : 'moyenne';
  const notifType: NotificationType = isHighOrCritical ? 'risk_critical' : 'risk_created';

  recipients.forEach(user => {
    if (!isDuplicate(existingNotifications, user.id, notifType, risk.id)) {
      newNotifs.push({
        id: `notif-risk-${Date.now()}-${user.id.slice(-4)}`,
        recipientUserId: user.id,
        type: notifType,
        priority,
        category: 'risques',
        title: isHighOrCritical 
          ? `Risque ${risk.level} : ${risk.code} — ${risk.title}`
          : `Risque enregistré : ${risk.code}`,
        message: `Le risque "${risk.title}" a été évalué avec un score ${risk.score} (P:${risk.probability} × I:${risk.impact}) sur l'actif lié. Stratégie retenue : ${risk.strategy}.`,
        createdAt: new Date().toISOString(),
        isRead: false,
        targetModule: 'risks',
        targetResourceId: risk.id,
        actionLabel: 'Examiner le risque'
      });
    }
  });

  return newNotifs;
}

/**
 * DÉCLENCHEUR MÉTIER 2 : Attribution ou mise à jour d'une Action Corrective
 * Notifie l'assigné direct et les coordinateurs GRC
 */
export function dispatchActionNotification(
  action: CorrectiveAction,
  accounts: UserAccount[],
  existingNotifications: AppNotification[],
  isNew: boolean
): AppNotification[] {
  const newNotifs: AppNotification[] = [];
  const isOverdue = action.status === 'en_retard';

  const recipients = accounts.filter(acc => {
    const isAssignee = action.owner && (
      acc.name.toLowerCase().includes(action.owner.toLowerCase()) || 
      action.owner.toLowerCase().includes(acc.name.toLowerCase())
    );
    const isRssiOrAdmin = acc.roleIds.some(r => r === 'role-super-admin' || r === 'role-rssi');
    return acc.status === 'actif' && (isAssignee || isRssiOrAdmin);
  });

  const notifType: NotificationType = isOverdue ? 'action_overdue' : 'action_assigned';
  const priority: NotificationPriority = isOverdue ? 'critique' : action.priority === 'Haute' ? 'haute' : 'moyenne';

  recipients.forEach(user => {
    if (!isDuplicate(existingNotifications, user.id, notifType, action.id)) {
      newNotifs.push({
        id: `notif-act-${Date.now()}-${user.id.slice(-4)}`,
        recipientUserId: user.id,
        type: notifType,
        priority,
        category: 'actions',
        title: isOverdue 
          ? `Échéance dépassée : ${action.code} (${action.title})`
          : `${isNew ? 'Nouvelle action assignée' : 'Mise à jour d’action'} : ${action.code}`,
        message: isOverdue
          ? `L'action corrective "${action.title}" requiert une régularisation immédiate (échéance passée le ${action.dueDate}).`
          : `Action "${action.title}" sous la responsabilité de ${action.owner}. Échéance prévue le ${action.dueDate}.`,
        createdAt: new Date().toISOString(),
        isRead: false,
        targetModule: 'actions',
        targetResourceId: action.id,
        actionLabel: 'Accéder au plan d’action'
      });
    }
  });

  return newNotifs;
}

/**
 * DÉCLENCHEUR MÉTIER 3 : Clôture d'action avec preuve
 * Notifie les validateurs (Admin / RSSI)
 */
export function dispatchActionClosedNotification(
  action: CorrectiveAction,
  actorName: string,
  accounts: UserAccount[],
  existingNotifications: AppNotification[]
): AppNotification[] {
  const newNotifs: AppNotification[] = [];
  const recipients = accounts.filter(acc => 
    acc.status === 'actif' && acc.roleIds.some(r => r === 'role-super-admin' || r === 'role-org-admin' || r === 'role-rssi')
  );

  recipients.forEach(user => {
    if (!isDuplicate(existingNotifications, user.id, 'action_closed', action.id)) {
      newNotifs.push({
        id: `notif-closed-${Date.now()}-${user.id.slice(-4)}`,
        recipientUserId: user.id,
        type: 'action_closed',
        priority: 'info',
        category: 'actions',
        title: `Action clôturée avec preuve : ${action.code}`,
        message: `L'action "${action.title}" a été clôturée par ${actorName}. Preuve enregistrée : "${action.evidenceOfClosure || 'Preuve de conformité jointe'}".`,
        createdAt: new Date().toISOString(),
        isRead: false,
        targetModule: 'actions',
        targetResourceId: action.id,
        actionLabel: 'Consulter la preuve'
      });
    }
  });

  return newNotifs;
}

/**
 * DÉCLENCHEUR MÉTIER 4 : Écart de conformité SoA ISO 27001
 * Notifie le RSSI et l'Auditeur
 */
export function dispatchSoAGapNotification(
  control: SoAControl,
  accounts: UserAccount[],
  existingNotifications: AppNotification[]
): AppNotification[] {
  const newNotifs: AppNotification[] = [];
  const recipients = accounts.filter(acc => 
    acc.status === 'actif' && acc.roleIds.some(r => r === 'role-rssi' || r === 'role-super-admin' || r === 'role-auditor')
  );

  recipients.forEach(user => {
    if (!isDuplicate(existingNotifications, user.id, 'soa_gap', control.code)) {
      newNotifs.push({
        id: `notif-soa-${Date.now()}-${user.id.slice(-4)}`,
        recipientUserId: user.id,
        type: 'soa_gap',
        priority: 'haute',
        category: 'soa',
        title: `Écart de conformité SoA : ${control.code}`,
        message: `Un écart a été documenté pour la mesure ${control.code} (${control.title}) : "${control.gapDescription || 'Mesure non conforme nécessitant une action corrective'}".`,
        createdAt: new Date().toISOString(),
        isRead: false,
        targetModule: 'soa',
        targetResourceId: control.code,
        actionLabel: 'Voir la Déclaration SoA'
      });
    }
  });

  return newNotifs;
}

/**
 * DÉCLENCHEUR MÉTIER 5 : Alerte de sécurité ou incident IAM
 * Notifie les Super Admins et Admins d'organisation
 */
export function dispatchSecurityAlertNotification(
  eventType: string,
  details: string,
  severity: 'info' | 'warning' | 'critical',
  accounts: UserAccount[],
  existingNotifications: AppNotification[]
): AppNotification[] {
  if (severity === 'info') return []; // Pas de notification bruyante pour les simples lectures

  const newNotifs: AppNotification[] = [];
  const recipients = accounts.filter(acc => 
    acc.status === 'actif' && acc.roleIds.some(r => r === 'role-super-admin' || r === 'role-org-admin')
  );

  const priority: NotificationPriority = severity === 'critical' ? 'critique' : 'haute';

  recipients.forEach(user => {
    newNotifs.push({
      id: `notif-sec-${Date.now()}-${user.id.slice(-4)}`,
      recipientUserId: user.id,
      type: 'security_alert',
      priority,
      category: 'iam',
      title: `Alerte sécurité IAM : ${eventType}`,
      message: details,
      createdAt: new Date().toISOString(),
      isRead: false,
      targetModule: 'iam',
      actionLabel: 'Ouvrir les journaux d’audit'
    });
  });

  return newNotifs;
}
