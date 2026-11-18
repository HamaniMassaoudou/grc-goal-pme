export type RiskLevel = 'Faible' | 'Moyen' | 'Élevé' | 'Critique';

export type RiskStrategy = 'réduire' | 'accepter' | 'transférer' | 'éviter';

export type RiskStatus = 'ouvert' | 'sous_contrôle' | 'clôturé';

export type AssetCategory = 
  | 'application' 
  | 'database' 
  | 'server' 
  | 'document' 
  | 'service' 
  | 'hardware' 
  | 'process';

export type AssetCriticality = 'Faible' | 'Moyenne' | 'Élevée' | 'Critique';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  description: string;
  owner: string;
  criticality: AssetCriticality;
  location?: string;
  createdAt: string;
  organizationId: string;
}

export interface Risk {
  id: string;
  code: string;
  title: string;
  description: string;
  assetId: string;
  threat: string; // Menace
  vulnerability: string; // Vulnérabilité
  owner: string;
  probability: number; // 1 to 5
  impact: number; // 1 to 5
  score: number; // probability * impact (1 to 25)
  level: RiskLevel;
  strategy: RiskStrategy;
  treatmentNotes?: string;
  residualProbability?: number;
  residualImpact?: number;
  residualScore?: number;
  residualLevel?: RiskLevel;
  status: RiskStatus;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}

export type SoADomain = 
  | 'A.5 Contrôles organisationnels' 
  | 'A.6 Contrôles relatifs aux personnes' 
  | 'A.7 Contrôles physiques' 
  | 'A.8 Contrôles technologiques';

export type ImplementationStatus = 
  | 'non_commence' 
  | 'planifie' 
  | 'partiellement_mis_en_oeuvre' 
  | 'mis_en_oeuvre' 
  | 'non_applicable';

export interface SoAControl {
  id: string;
  code: string; // e.g. A.5.1, A.8.5
  title: string;
  domain: SoADomain;
  description: string;
  isApplicable: boolean;
  justification: string;
  implementationStatus: ImplementationStatus;
  maturityLevel: 1 | 2 | 3 | 4 | 5; // 1: Initial, 2: Reproductible, 3: Défini, 4: Maîtrisé, 5: Optimisé
  evidenceRef: string; // Preuve / Référence documentaire (ex. POL-01, logs, capture)
  gapDescription: string; // Écart constaté
  linkedActionId?: string;
  lastReviewDate: string;
  reviewedBy: string;
  organizationId?: string;
}

export type ActionPriority = 'Basse' | 'Moyenne' | 'Haute' | 'Critique';

export type ActionStatus = 'a_faire' | 'en_cours' | 'en_retard' | 'cloturee' | 'rejetee';

export interface ActionComment {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface CorrectiveAction {
  id: string;
  code: string;
  title: string;
  description: string;
  source: 'risque' | 'soa_ecart' | 'audit_interne';
  linkedRiskId?: string;
  linkedControlCode?: string;
  owner: string;
  priority: ActionPriority;
  dueDate: string;
  status: ActionStatus;
  evidenceOfClosure?: string; // Preuve de clôture
  comments: ActionComment[];
  organizationId: string;
  createdAt: string;
  closedAt?: string;
}

export type OrganizationStatus = 'active' | 'in_configuration' | 'suspended' | 'archived';

export interface Organization {
  id: string;
  slug?: string;
  name: string;
  legalName?: string; // Raison sociale / Nom commercial
  sector: string;
  size: string;
  address?: string; // Adresse / Localisation
  phone?: string;
  contactName: string; // Dirigeant / Représentant principal
  contactEmail: string; // Courriel professionnel de contact
  securityOfficer: string; // Référent Sécurité / Correspondant GRC
  description: string;
  grcScope?: string; // Périmètre GRC cible
  status: OrganizationStatus;
  isDemo?: boolean; // Indicateur d'organisation de démonstration B14
  creatorUserId?: string; // Utilisateur ayant créé l'organisation
  createdAt: string;
  updatedAt?: string;
}

export type CollaboratorInvitationStatus = 'actif' | 'invite' | 'desactive';

export interface Collaborator {
  id: string;
  organizationId: string;
  userId?: string; // Lié à un compte UserAccount si l'utilisateur a des identifiants
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  jobTitle: string;
  roleId: string; // Rôle RBAC (ex: role-org-admin, role-risk-owner, role-rssi, role-viewer)
  grcResponsibilities: string; // Responsabilités GRC (ex: Propriétaire de risque, Référent SSI, etc.)
  isPlatformUser: boolean; // Si le collaborateur possède un compte de connexion actif
  invitationStatus: CollaboratorInvitationStatus;
  invitedAt?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Administrateur GRC' | 'Responsable Métier' | 'Auditeur / Mentor';
  title: string;
  organization: string;
  avatarColor: string;
}

export interface TestProtocolLog {
  id: string;
  date: string;
  testerName: string;
  testerRole: string;
  organizationName: string;
  durationMinutes: number;
  scenariosCompleted: string[];
  feedbackNotes: string;
  perceivedUtility: 'Excellent' | 'Très utile' | 'Utile' | 'À améliorer';
  signedByTester: boolean;
}

export type TaskEvaluationStatus = 'valide' | 'valide_avec_reserve' | 'echec' | 'non_teste';

export interface TaskEvaluation {
  taskId: string;
  num: number;
  taskTitle: string;
  targetRequirement: string;
  expectedResult: string;
  successCriteria: string;
  status: TaskEvaluationStatus;
  executionTimeMinutes?: number;
  observations: string;
}

export type PerceivedUtilityLevel = 
  | 'Indispensable' 
  | 'Très utile' 
  | 'Utile' 
  | 'Moyennement utile' 
  | 'À améliorer';

export interface UserTestSheet {
  id: string;
  code: string; // Ex: "FT-2026-001"
  userId?: string; // ID utilisateur associé si existant
  testerName: string;
  testerEmail: string;
  testerRole: string;
  organizationName: string;
  sessionTitle: string; // Ex: "Évaluation B14 — Testeur externe officiel"
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  testEnvironment: string; // Ex: "Chrome 122 / Web SaaS / AI Studio"
  tasks: TaskEvaluation[];
  globalScorePercent: number; // 0-100%
  functionalitiesUnderstood: string;
  difficultiesEncountered: string;
  suggestions: string;
  feedbackNotes: string;
  perceivedUtility: PerceivedUtilityLevel;
  recommendationScore: number; // 1 to 10
  signedByTester: boolean;
  signatureDate: string;
  mentorOrEvaluatorName?: string;
  mentorNotes?: string;
  mentorValidated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceFile {
  id: string;
  title: string;
  filename: string;
  fileSize: number;
  formattedSize: string;
  mimeType: string;
  sha256Hash: string;
  linkedType: 'soa_control' | 'corrective_action' | 'risk' | 'general';
  linkedId: string;
  notes?: string;
  uploadedByName?: string;
  uploadedByEmail?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  fileUrl?: string;
}
