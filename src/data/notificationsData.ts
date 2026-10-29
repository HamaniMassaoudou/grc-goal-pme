import { AppNotification } from '../types/notification';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // Notifications pour Hamani Massaoudou (Super Admin & RSSI - user-hamani)
  {
    id: 'notif-hamani-1',
    recipientUserId: 'user-hamani',
    type: 'risk_critical',
    priority: 'critique',
    category: 'risques',
    title: 'Alerte Risque Critique : RSK-01',
    message: 'Le risque "Accès non autorisé à la base de données clients" est qualifié avec un score 20 (Probabilité 4 × Impact 5). Un plan de remédiation d\'urgence est attendu.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // il y a 2 heures
    isRead: false,
    targetModule: 'risks',
    targetResourceId: 'rsk-01',
    actionLabel: 'Examiner le risque RSK-01',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'notif-hamani-2',
    recipientUserId: 'user-hamani',
    type: 'action_overdue',
    priority: 'haute',
    category: 'actions',
    title: 'Échéance dépassée : ACT-01',
    message: 'L\'action corrective "Déploiement MFA obligatoire sur la console d\'administration" est en retard par rapport à l\'échéance fixée au 2026-10-25.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isRead: false,
    targetModule: 'actions',
    targetResourceId: 'act-01',
    actionLabel: 'Voir le plan d\'action',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'notif-hamani-3',
    recipientUserId: 'user-hamani',
    type: 'soa_gap',
    priority: 'haute',
    category: 'soa',
    title: 'Écart de conformité SoA : Mesure A.8.5',
    message: 'La mesure A.8.5 (Authentification sécurisée) présente un écart constaté : l\'absence de double facteur sur les accès tiers et prestataires externes.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isRead: false,
    targetModule: 'soa',
    targetResourceId: 'A.8.5',
    actionLabel: 'Consulter la mesure A.8.5',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'notif-hamani-4',
    recipientUserId: 'user-hamani',
    type: 'security_alert',
    priority: 'critique',
    category: 'iam',
    title: 'Incident de sécurité IAM intercepté',
    message: 'Tentative de connexion bloquée sur le compte suspendu (suspendu@demo.ne). L\'adresse IP source 197.214.22.99 a été consignée dans le journal d\'audit.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    targetModule: 'iam',
    actionLabel: 'Consulter le journal d\'audit',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'notif-hamani-5',
    recipientUserId: 'user-hamani',
    type: 'system',
    priority: 'info',
    category: 'gouvernance',
    title: 'Bienvenue sur la plateforme GRC-Goal',
    message: 'Le système de pilotage GRC est opérationnel. Toutes vos permissions de Super Administrateur et RSSI sont actives.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    targetModule: 'dashboard',
    actionLabel: 'Accéder au tableau de bord',
    organizationId: 'org-pme-demo'
  },

  // Notifications pour Abdoul Salam Issifi (Admin PME & Propriétaire de risque - user-issifi)
  {
    id: 'notif-issifi-1',
    recipientUserId: 'user-issifi',
    type: 'action_assigned',
    priority: 'haute',
    category: 'actions',
    title: 'Nouvelle action corrective assignée : ACT-02',
    message: 'Vous avez été désigné responsable de l\'action "Mise en place de sauvegardes chiffrées automatiques journalières". Échéance : 2026-11-20.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isRead: false,
    targetModule: 'actions',
    targetResourceId: 'act-02',
    actionLabel: 'Consulter l\'action ACT-02',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'notif-issifi-2',
    recipientUserId: 'user-issifi',
    type: 'risk_critical',
    priority: 'critique',
    category: 'risques',
    title: 'Risque élevé sous votre responsabilité : RSK-02',
    message: 'Le risque "Indisponibilité du serveur web de production" (Score 12 - Élevé) requiert votre validation pour le choix de la stratégie de traitement.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    isRead: false,
    targetModule: 'risks',
    targetResourceId: 'rsk-02',
    actionLabel: 'Voir le risque RSK-02',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'notif-issifi-3',
    recipientUserId: 'user-issifi',
    type: 'account_status',
    priority: 'info',
    category: 'iam',
    title: 'Validation de votre double facteur MFA',
    message: 'Votre méthode d\'authentification forte (MFA TOTP) a été configurée avec succès pour le compte direction@sirbacom.ne.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    targetModule: 'iam',
    actionLabel: 'Gérer mon compte',
    organizationId: 'org-pme-demo'
  },

  // Notifications pour Aboubacar Yacouba Mai Birni (Auditeur & Mentor - user-mentor)
  {
    id: 'notif-mentor-1',
    recipientUserId: 'user-mentor',
    type: 'system',
    priority: 'haute',
    category: 'gouvernance',
    title: 'Fiche d\'évaluation de test soumise pour validation',
    message: 'La fiche de test utilisateur FT-2026-001 (Sirba Communication) est prête pour votre revue mentorale et validation d\'audit.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    isRead: false,
    targetModule: 'test-protocol',
    targetResourceId: 'ft-01',
    actionLabel: 'Examiner la fiche de test',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'notif-mentor-2',
    recipientUserId: 'user-mentor',
    type: 'soa_updated',
    priority: 'moyenne',
    category: 'soa',
    title: 'Mise à jour de la Déclaration d\'Applicabilité (SoA)',
    message: 'La mesure A.5.1 (Politiques de sécurité de l\'information) a été mise à jour avec la mention "mis en œuvre" et la preuve documentée.',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    targetModule: 'soa',
    targetResourceId: 'A.5.1',
    actionLabel: 'Vérifier la mesure A.5.1',
    organizationId: 'org-pme-demo'
  },

  // Notifications pour Aïchatou Diallo (user-diallo)
  {
    id: 'notif-diallo-1',
    recipientUserId: 'user-diallo',
    type: 'system',
    priority: 'moyenne',
    category: 'gouvernance',
    title: 'Revue de l\'inventaire des actifs planifiée',
    message: 'Veuillez vérifier les attributs et criticité des 5 actifs informationnels placés sous votre responsabilité.',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    isRead: false,
    targetModule: 'assets',
    actionLabel: 'Accéder aux actifs',
    organizationId: 'org-pme-demo'
  },

  // Notifications pour Ibrahim Moussa (user-moussa)
  {
    id: 'notif-moussa-1',
    recipientUserId: 'user-moussa',
    type: 'system',
    priority: 'info',
    category: 'gouvernance',
    title: 'Accès accordé au portail GRC-Goal',
    message: 'Votre compte lecteur est actif. Vous pouvez consulter les synthèses des risques et le plan d\'action.',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    targetModule: 'dashboard',
    actionLabel: 'Consulter le tableau de bord',
    organizationId: 'org-pme-demo'
  }
];
