import { RoleDefinition } from '../types/auth';

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'role-super-admin',
    code: 'SUPER_ADMIN',
    name: 'Super Administrateur GRC',
    description: 'Administration globale du système, configuration de la plateforme, gestion intégrale des utilisateurs, des rôles et des journaux d’audit.',
    isSystem: true,
    isActive: true,
    color: 'bg-indigo-600',
    permissions: {
      dashboard: ['view', 'export'],
      risks: ['view', 'create', 'update', 'delete', 'approve', 'export', 'manage'],
      soa: ['view', 'update', 'approve', 'export', 'manage'],
      actions: ['view', 'create', 'update', 'delete', 'approve', 'export', 'manage'],
      assets: ['view', 'create', 'update', 'delete', 'export', 'manage'],
      governance: ['view', 'update', 'manage'],
      users: ['view', 'create', 'update', 'delete', 'export', 'manage'],
      roles: ['view', 'create', 'update', 'delete', 'manage'],
      audit_logs: ['view', 'export', 'manage'],
      test_protocol: ['view', 'create', 'update', 'manage'],
      notifications: ['view', 'manage']
    }
  },
  {
    id: 'role-org-admin',
    code: 'ORG_ADMIN',
    name: 'Administrateur Organisation (PME)',
    description: 'Gestion opérationnelle de la PME : administration des comptes utilisateurs locaux, validation des plans d’actions et pilotage de la conformité.',
    isSystem: true,
    isActive: true,
    color: 'bg-blue-600',
    permissions: {
      dashboard: ['view', 'export'],
      risks: ['view', 'create', 'update', 'delete', 'approve', 'export'],
      soa: ['view', 'update', 'approve', 'export'],
      actions: ['view', 'create', 'update', 'delete', 'approve', 'export'],
      assets: ['view', 'create', 'update', 'delete', 'export'],
      governance: ['view', 'update'],
      users: ['view', 'create', 'update', 'export'],
      roles: ['view'],
      audit_logs: ['view', 'export'],
      test_protocol: ['view', 'create', 'update'],
      notifications: ['view', 'manage']
    }
  },
  {
    id: 'role-rssi',
    code: 'RSSI',
    name: 'Responsable Sécurité / Référent GRC',
    description: 'Expertise cybersécurité, évaluation des risques, déclaration d’applicabilité SoA ISO 27001 et pilotage technique des remédiations.',
    isSystem: true,
    isActive: true,
    color: 'bg-emerald-600',
    permissions: {
      dashboard: ['view', 'export'],
      risks: ['view', 'create', 'update', 'delete', 'approve', 'export'],
      soa: ['view', 'update', 'approve', 'export'],
      actions: ['view', 'create', 'update', 'delete', 'approve', 'export'],
      assets: ['view', 'create', 'update', 'delete', 'export'],
      governance: ['view', 'update'],
      users: ['view'],
      roles: ['view'],
      audit_logs: ['view', 'export'],
      test_protocol: ['view', 'create', 'update'],
      notifications: ['view', 'manage']
    }
  },
  {
    id: 'role-risk-owner',
    code: 'RISK_OWNER',
    name: 'Responsable Métier / Propriétaire de Risque',
    description: 'Propriétaire des actifs et des processus métier : qualification des menaces, propositions de réduction et exécution des actions.',
    isSystem: true,
    isActive: true,
    color: 'bg-amber-600',
    permissions: {
      dashboard: ['view'],
      risks: ['view', 'create', 'update'],
      soa: ['view'],
      actions: ['view', 'create', 'update'],
      assets: ['view', 'create', 'update'],
      governance: ['view'],
      users: [],
      roles: [],
      audit_logs: [],
      test_protocol: ['view'],
      notifications: ['view']
    }
  },
  {
    id: 'role-auditor',
    code: 'AUDITOR',
    name: 'Auditeur / Évaluateur Externe',
    description: 'Consultation indépendante (lecture seule) des risques, de la SoA, des preuves documentaires, des actions et des journaux d’audit.',
    isSystem: true,
    isActive: true,
    color: 'bg-purple-600',
    permissions: {
      dashboard: ['view', 'export'],
      risks: ['view', 'export'],
      soa: ['view', 'export'],
      actions: ['view', 'export'],
      assets: ['view', 'export'],
      governance: ['view'],
      users: ['view'],
      roles: ['view'],
      audit_logs: ['view', 'export'],
      test_protocol: ['view', 'export'],
      notifications: ['view']
    }
  },
  {
    id: 'role-viewer',
    code: 'VIEWER',
    name: 'Lecteur / Collaborateur PME',
    description: 'Consultation restreinte au tableau de bord général et aux actions de sensibilisation qui lui sont directement assignées.',
    isSystem: true,
    isActive: true,
    color: 'bg-slate-500',
    permissions: {
      dashboard: ['view'],
      risks: ['view'],
      soa: [],
      actions: ['view'],
      assets: ['view'],
      governance: ['view'],
      users: [],
      roles: [],
      audit_logs: [],
      test_protocol: [],
      notifications: ['view']
    }
  }
];

export const ALL_RESOURCES_CONFIG: {
  id: import('../types/auth').ModuleResource;
  name: string;
  description: string;
}[] = [
  { id: 'dashboard', name: 'Tableau de bord', description: 'Indicateurs KPIs, matrice 5x5 et statistiques' },
  { id: 'risks', name: 'Registre des risques', description: 'Identification, évaluation P×I et traitement' },
  { id: 'soa', name: 'Déclaration (SoA) ISO 27001', description: '93 mesures, justifications, preuves et écarts' },
  { id: 'actions', name: 'Plan d’actions', description: 'Mesures correctives, remédiation et clôture' },
  { id: 'assets', name: 'Actifs informationnels', description: 'Cartographie des matériels, logiciels et données' },
  { id: 'governance', name: 'Gouvernance & Périmètre', description: 'Informations organisationnelles et politiques' },
  { id: 'users', name: 'Gestion des utilisateurs', description: 'Comptes, profils, états et réinitialisations' },
  { id: 'roles', name: 'Rôles & Permissions (RBAC)', description: 'Définition des droits d’accès et privilèges' },
  { id: 'audit_logs', name: 'Journal d’audit de sécurité', description: 'Traçabilité des connexions et actions sensibles' },
  { id: 'test_protocol', name: 'Protocole de test B14', description: 'Scénarios de test et fiches d’évaluation' },
  { id: 'notifications', name: 'Notifications & Alertes', description: 'Alertes, événements, échéances et tâches assignées' }
];

export const ALL_ACTIONS_CONFIG: {
  id: import('../types/auth').PermissionAction;
  label: string;
  description: string;
}[] = [
  { id: 'view', label: 'Consulter', description: 'Accéder en lecture seule à la ressource' },
  { id: 'create', label: 'Créer', description: 'Ajouter de nouvelles données' },
  { id: 'update', label: 'Modifier', description: 'Mettre à jour les données existantes' },
  { id: 'delete', label: 'Supprimer', description: 'Supprimer ou archiver des données' },
  { id: 'approve', label: 'Approuver', description: 'Valider formellement une clôture ou une décision' },
  { id: 'export', label: 'Exporter', description: 'Télécharger les données en CSV ou PDF' },
  { id: 'manage', label: 'Administrer', description: 'Contrôle total sur la fonctionnalité' }
];
