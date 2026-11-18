import { 
  Organization, 
  Collaborator,
  Asset, 
  Risk, 
  SoAControl, 
  CorrectiveAction, 
  UserProfile, 
  TestProtocolLog, 
  TaskEvaluation, 
  UserTestSheet 
} from '../types/grc';
import { ISO27001_CONTROLS_CATALOG } from './iso27001Controls';

export const INITIAL_ORGANIZATION: Organization = {
  id: 'org-pme-demo',
  slug: 'pme-demo-sirba',
  name: 'PME Démonstration',
  legalName: 'Sirba Communication SARL',
  sector: 'Services numériques, Communication & Conseil',
  size: '15 collaborateurs (TPE/PME)',
  address: 'Avenue de l’Amitié, Quartier Plateau, BP 12040, Niamey, Niger',
  phone: '+227 20 72 34 56',
  contactName: 'M. Abdoul Salam Issifi',
  contactEmail: 'contact@sirba-communication.ne',
  securityOfficer: 'Hamani Massaoudou (Référent GRC)',
  description: 'Petite et Moyenne Entreprise ciblée par le projet B14 — Cadre d’application pour tester un outillage GRC léger et autonome.',
  grcScope: 'Système d’information global, serveurs, base de données clients, facturation et télétravail.',
  status: 'active',
  isDemo: true,
  creatorUserId: 'user-issifi',
  createdAt: '2026-10-10',
  updatedAt: '2026-10-27'
};

export const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    id: 'collab-issifi',
    organizationId: 'org-pme-demo',
    userId: 'user-issifi',
    fullName: 'Abdoul Salam Issifi',
    email: 'direction@sirbacom.ne',
    phone: '+227 96 12 34 56',
    department: 'Direction Générale',
    jobTitle: 'Responsable de Sirba Communication',
    roleId: 'role-org-admin',
    grcResponsibilities: 'Dirigeant & Administrateur PME : validation stratégique, arbitrage des risques majeurs et gouvernance générale.',
    isPlatformUser: true,
    invitationStatus: 'actif',
    joinedAt: '2026-10-12',
    createdAt: '2026-10-12'
  },
  {
    id: 'collab-hamani',
    organizationId: 'org-pme-demo',
    userId: 'user-hamani',
    fullName: 'Hamani Massaoudou',
    email: 'massaoudhamani10@gmail.com',
    phone: '+227 90 00 00 01',
    department: 'Sécurité de l’Information & GRC',
    jobTitle: 'Concepteur GRC-Goal & Référent SSI',
    roleId: 'role-super-admin',
    grcResponsibilities: 'Référent Sécurité : gestion du modèle de risques, évaluation SoA ISO 27001, paramétrage technique et conformité.',
    isPlatformUser: true,
    invitationStatus: 'actif',
    joinedAt: '2026-10-10',
    createdAt: '2026-10-10'
  },
  {
    id: 'collab-diallo',
    organizationId: 'org-pme-demo',
    userId: 'user-diallo',
    fullName: 'Aïchatou Diallo',
    email: 'a.diallo@sirbacom.ne',
    phone: '+227 88 44 22 11',
    department: 'Systèmes d’Information',
    jobTitle: 'Responsable SI & Cartographie',
    roleId: 'role-risk-owner',
    grcResponsibilities: 'Propriétaire d’actifs critiques (bases de données, serveurs), qualification des menaces et propositions de remédiation.',
    isPlatformUser: true,
    invitationStatus: 'actif',
    joinedAt: '2026-10-14',
    createdAt: '2026-10-14'
  },
  {
    id: 'collab-moussa',
    organizationId: 'org-pme-demo',
    userId: 'user-moussa',
    fullName: 'Ibrahim Moussa',
    email: 'i.moussa@sirbacom.ne',
    phone: '+227 94 33 22 11',
    department: 'Exploitation & Support',
    jobTitle: 'Opérateur Support & Collaborateur',
    roleId: 'role-viewer',
    grcResponsibilities: 'Collaborateur opérationnel : application des consignes de sécurité, exécution des actions de sensibilisation.',
    isPlatformUser: true,
    invitationStatus: 'actif',
    joinedAt: '2026-10-18',
    createdAt: '2026-10-18'
  },
  {
    id: 'collab-mentor',
    organizationId: 'org-pme-demo',
    userId: 'user-mentor',
    fullName: 'Aboubacar Yacouba Mai Birni',
    email: 'mentor.grc@apsi.ne',
    phone: '+227 91 88 77 66',
    department: 'Comité Pédagogique d’Excellence',
    jobTitle: 'Mentor Référent GRC — APSI-NE',
    roleId: 'role-auditor',
    grcResponsibilities: 'Auditeur & Mentor externe : revue indépendante de la conformité ISO 27001, évaluation du protocole de test B14.',
    isPlatformUser: true,
    invitationStatus: 'actif',
    joinedAt: '2026-10-09',
    createdAt: '2026-10-09'
  },
  {
    id: 'collab-saley',
    organizationId: 'org-pme-demo',
    fullName: 'Mariama Saley',
    email: 'finances@sirbacom.ne',
    phone: '+227 92 11 22 33',
    department: 'Administration & Finances',
    jobTitle: 'Responsable Administrative et Financière',
    roleId: 'role-risk-owner',
    grcResponsibilities: 'Partie prenante finance : conformité RGPD/protection des données comptables, suivi des contrats prestataires.',
    isPlatformUser: false,
    invitationStatus: 'invite',
    invitedAt: '2026-10-24',
    createdAt: '2026-10-24'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-hamani',
    name: 'Hamani Massaoudou',
    email: 'massaoudhamani10@gmail.com',
    role: 'Administrateur GRC',
    title: 'Participant B14 & Concepteur GRC-Goal',
    organization: 'APSI-NE / PME Démonstration',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'user-issifi',
    name: 'Abdoul Salam Issifi',
    email: 'direction@sirbacom.ne',
    role: 'Responsable Métier',
    title: 'Responsable de Sirba Communication (Testeur tiers B14)',
    organization: 'Sirba Communication',
    avatarColor: 'bg-orange-600'
  },
  {
    id: 'user-mentor',
    name: 'Aboubacar Yacouba Mai Birni',
    email: 'mentor.grc@apsi.ne',
    role: 'Auditeur / Mentor',
    title: 'Mentor Référent GRC — APSI-NE',
    organization: 'Programme d’Excellence en Cybersécurité',
    avatarColor: 'bg-emerald-600'
  }
];

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast-01',
    name: 'Base de données clients',
    category: 'database',
    description: 'Fichiers clients, contacts décisionnaires, contrats en cours et historique de facturation.',
    owner: 'Direction Commerciale & SI',
    criticality: 'Critique',
    location: 'Serveur Cloud sécurisé / hébergement local',
    createdAt: '2026-10-12',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'ast-02',
    name: 'Serveur de messagerie d’entreprise',
    category: 'service',
    description: 'Comptes email professionnels des collaborateurs, échanges internes et avec les partenaires.',
    owner: 'Administrateur Système',
    criticality: 'Élevée',
    location: 'Hébergement mutualisé professionnel',
    createdAt: '2026-10-12',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'ast-03',
    name: 'Application Web métier & Facturation',
    category: 'application',
    description: 'Logiciel de gestion des devis, factures, encaissements et suivi des prestations.',
    owner: 'Responsable Financier',
    criticality: 'Élevée',
    location: 'Serveur interne PME',
    createdAt: '2026-10-13',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'ast-04',
    name: 'Parc de 15 ordinateurs portables',
    category: 'hardware',
    description: 'Postes de travail utilisés par les collaborateurs au bureau et en déplacement.',
    owner: 'Équipe Support',
    criticality: 'Moyenne',
    location: 'Locaux Niamey & nomadisme',
    createdAt: '2026-10-14',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'ast-05',
    name: 'Dossier des procédures & PCA',
    category: 'process',
    description: 'Procédures d’exploitation, sauvegardes et plan de continuité d’activité.',
    owner: 'Hamani Massaoudou',
    criticality: 'Élevée',
    location: 'Coffre-fort documentaire',
    createdAt: '2026-10-14',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'ast-06',
    name: 'Archives physiques & contrats signés',
    category: 'document',
    description: 'Dossiers papier confidentiels, statuts légaux et baux commerciaux.',
    owner: 'Direction Générale',
    criticality: 'Moyenne',
    location: 'Armoire forte salle de réunion',
    createdAt: '2026-10-15',
    organizationId: 'org-pme-demo'
  }
];

export const INITIAL_RISKS: Risk[] = [
  {
    id: 'rsk-01',
    code: 'RSK-01',
    title: 'Accès non autorisé à la base de données clients',
    description: 'Intrusion ou fuite de données suite à une compromission d’identifiants ou absence de double authentification.',
    assetId: 'ast-01',
    threat: 'Attaque par force brute ou vol d’identifiants administrateur',
    vulnerability: 'Absence d’authentification multifacteur (MFA) sur la console de gestion',
    owner: 'Abdoul Salam Issifi',
    probability: 4,
    impact: 5,
    score: 20, // 4 * 5 = 20 -> Critique
    level: 'Critique',
    strategy: 'réduire',
    treatmentNotes: 'Déploiement obligatoire de la MFA et restriction d’accès aux seules adresses IP autorisées.',
    residualProbability: 2,
    residualImpact: 2,
    residualScore: 4,
    residualLevel: 'Moyen',
    status: 'ouvert',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-25',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'rsk-02',
    code: 'RSK-02',
    title: 'Infection par rançongiciel (Ransomware) via hameçonnage',
    description: 'Chiffrement malveillant des postes et partages réseaux par un rançongiciel suite au clic sur un lien frauduleux.',
    assetId: 'ast-04',
    threat: 'Campagne de spear-phishing usurpant l’identité d’un client ou fournisseur',
    vulnerability: 'Sensibilisation insuffisante du personnel et absence de filtrage avancé des pièces jointes',
    owner: 'Hamani Massaoudou',
    probability: 4,
    impact: 4,
    score: 16, // 4 * 4 = 16 -> Critique
    level: 'Critique',
    strategy: 'réduire',
    treatmentNotes: 'Campagne de formation interne au phishing et durcissement de l’antivirus centralisé.',
    residualProbability: 2,
    residualImpact: 3,
    residualScore: 6,
    residualLevel: 'Moyen',
    status: 'sous_contrôle',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-24',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'rsk-03',
    code: 'RSK-03',
    title: 'Indisponibilité prolongée suite à coupure électrique',
    description: 'Arrêt inopiné du serveur local et corruption potentielle des fichiers lors d’un délestage prolongé.',
    assetId: 'ast-02',
    threat: 'Instabilité du réseau électrique public',
    vulnerability: 'Batteries d’onduleur dégradées (autonomie résiduelle inférieure à 5 minutes)',
    owner: 'Équipe Infrastructure',
    probability: 3,
    impact: 3,
    score: 9, // 3 * 3 = 9 -> Élevé
    level: 'Élevé',
    strategy: 'réduire',
    treatmentNotes: 'Remplacement immédiat des batteries et mise en place d’un arrêt automatique propre du serveur.',
    residualProbability: 1,
    residualImpact: 3,
    residualScore: 3,
    residualLevel: 'Faible',
    status: 'ouvert',
    createdAt: '2026-10-16',
    updatedAt: '2026-10-22',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'rsk-04',
    code: 'RSK-04',
    title: 'Perte de données de facturation par défaillance de sauvegarde',
    description: 'Incapacité à restaurer la comptabilité suite à un crash disque non détecté à temps.',
    assetId: 'ast-03',
    threat: 'Panne mécanique d’un disque dur ou corruption logique',
    vulnerability: 'Absence de test de restauration programmé et sauvegarde non déportée hors-site',
    owner: 'Hamani Massaoudou',
    probability: 2,
    impact: 5,
    score: 10, // 2 * 5 = 10 -> Élevé
    level: 'Élevé',
    strategy: 'réduire',
    treatmentNotes: 'Sauvegarde 3-2-1 automatisée vers un stockage chiffré externe et test mensuel.',
    residualProbability: 1,
    residualImpact: 2,
    residualScore: 2,
    residualLevel: 'Faible',
    status: 'sous_contrôle',
    createdAt: '2026-10-16',
    updatedAt: '2026-10-18',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'rsk-05',
    code: 'RSK-05',
    title: 'Divulgation de documents stratégiques lors du départ d’un salarié',
    description: 'Copie non autorisée de la grille tarifaire ou du code source avant la fin du contrat.',
    assetId: 'ast-06',
    threat: 'Fuite interne opportuniste ou départ vers un concurrent',
    vulnerability: 'Processus informel de départ et absence d’accord de confidentialité formalisé',
    owner: 'Direction Générale',
    probability: 2,
    impact: 3,
    score: 6, // 2 * 3 = 6 -> Moyen
    level: 'Moyen',
    strategy: 'réduire',
    treatmentNotes: 'Généralisation des accords de non-divulgation (NDA) et checklist de clôture des comptes.',
    residualProbability: 1,
    residualImpact: 2,
    residualScore: 2,
    residualLevel: 'Faible',
    status: 'sous_contrôle',
    createdAt: '2026-10-17',
    updatedAt: '2026-10-23',
    organizationId: 'org-pme-demo'
  },
  {
    id: 'rsk-06',
    code: 'RSK-06',
    title: 'Ralentissement temporaire du site vitrine lors d’un pic de consultations',
    description: 'Accès momentanément dégradé sans impact sur les données ni les transactions financières.',
    assetId: 'ast-03',
    threat: 'Afflux soudain de visiteurs',
    vulnerability: 'Formule d’hébergement mutualisée basique',
    owner: 'Équipe Communication',
    probability: 2,
    impact: 1,
    score: 2, // 2 * 1 = 2 -> Faible
    level: 'Faible',
    strategy: 'accepter',
    treatmentNotes: 'Risque jugé acceptable au vu du faible impact commercial direct.',
    residualProbability: 2,
    residualImpact: 1,
    residualScore: 2,
    residualLevel: 'Faible',
    status: 'clôturé',
    createdAt: '2026-10-18',
    updatedAt: '2026-10-20',
    organizationId: 'org-pme-demo'
  }
];

export const INITIAL_ACTIONS: CorrectiveAction[] = [
  {
    id: 'act-01',
    code: 'ACT-01',
    title: 'Activer l’authentification multifacteur (MFA) sur la console et base clients',
    description: 'Configurer l’obligation de double facteur (TOTP via Google Authenticator / Microsoft Authenticator) pour tous les comptes administrateurs.',
    source: 'risque',
    linkedRiskId: 'rsk-01',
    linkedControlCode: 'A.8.5',
    owner: 'Abdoul Salam Issifi',
    priority: 'Critique',
    dueDate: '2026-11-05',
    status: 'en_cours',
    evidenceOfClosure: '',
    comments: [
      {
        id: 'c-1',
        author: 'Abdoul Salam Issifi',
        date: '2026-10-20',
        text: 'Configuration effectuée sur le compte principal. Reste à tester sur les 2 accès de secours.'
      }
    ],
    organizationId: 'org-pme-demo',
    createdAt: '2026-10-18'
  },
  {
    id: 'act-02',
    code: 'ACT-02',
    title: 'Organiser une session de sensibilisation au phishing pour les 15 collaborateurs',
    description: 'Animation d’un atelier pratique de 45 minutes sur la détection des faux courriels, pièces jointes suspectes et fraudes au virement.',
    source: 'risque',
    linkedRiskId: 'rsk-02',
    linkedControlCode: 'A.6.3',
    owner: 'Hamani Massaoudou',
    priority: 'Haute',
    dueDate: '2026-10-24', // Date dépassée -> illustre EF-08 (actions en retard)
    status: 'en_retard',
    comments: [
      {
        id: 'c-2',
        author: 'Hamani Massaoudou',
        date: '2026-10-25',
        text: 'Support de présentation finalisé. Reportée de 3 jours pour synchronisation avec les déplacements de l’équipe.'
      }
    ],
    organizationId: 'org-pme-demo',
    createdAt: '2026-10-16'
  },
  {
    id: 'act-03',
    code: 'ACT-03',
    title: 'Tester la restauration à blanc de la sauvegarde comptable',
    description: 'Valider la procédure de restauration sur une machine de test isolée pour vérifier l’intégrité des tables et le temps de reprise (RTO).',
    source: 'soa_ecart',
    linkedRiskId: 'rsk-04',
    linkedControlCode: 'A.8.13',
    owner: 'Hamani Massaoudou',
    priority: 'Haute',
    dueDate: '2026-10-18',
    status: 'cloturee',
    evidenceOfClosure: 'Procès-verbal de test PV-RESTORE-2026-10-18.pdf : restauration intégrale réussie en 28 minutes, intégrité vérifiée à 100%.',
    comments: [
      {
        id: 'c-3',
        author: 'Hamani Massaoudou',
        date: '2026-10-18',
        text: 'Test validé avec succès sans anomalie.'
      }
    ],
    organizationId: 'org-pme-demo',
    createdAt: '2026-10-14',
    closedAt: '2026-10-18'
  },
  {
    id: 'act-04',
    code: 'ACT-04',
    title: 'Remplacer le pack de batteries de l’onduleur serveur',
    description: 'Commande et remplacement physique des 4 batteries au plomb de l’onduleur salle serveur pour garantir 45 min d’autonomie.',
    source: 'risque',
    linkedRiskId: 'rsk-03',
    linkedControlCode: 'A.7.11',
    owner: 'Équipe Infrastructure',
    priority: 'Moyenne',
    dueDate: '2026-11-12',
    status: 'a_faire',
    comments: [],
    organizationId: 'org-pme-demo',
    createdAt: '2026-10-21'
  },
  {
    id: 'act-05',
    code: 'ACT-05',
    title: 'Formaliser et faire signer la charte informatique d’usage acceptable',
    description: 'Diffusion de la charte informatique rappelant l’interdiction d’installer des logiciels non autorisés et l’usage des clés USB personnelles.',
    source: 'soa_ecart',
    linkedRiskId: 'rsk-05',
    linkedControlCode: 'A.5.10',
    owner: 'Direction Générale',
    priority: 'Moyenne',
    dueDate: '2026-11-20',
    status: 'a_faire',
    comments: [],
    organizationId: 'org-pme-demo',
    createdAt: '2026-10-22'
  }
];

// Génération de la SoA initiale pour les 93 contrôles ISO/IEC 27001:2022
export function generateInitialSoA(orgId: string = 'org-pme-demo'): SoAControl[] {
  return ISO27001_CONTROLS_CATALOG.map((item) => {
    let isApplicable = true;
    let justification = 'Mesure indispensable pour assurer la confidentialité, l’intégrité et la disponibilité des activités de la PME.';
    let implementationStatus: SoAControl['implementationStatus'] = 'partiellement_mis_en_oeuvre';
    let maturityLevel: SoAControl['maturityLevel'] = 2;
    let evidenceRef = '';
    let gapDescription = '';
    let linkedActionId: string | undefined = undefined;

    // Configuration réaliste des contrôles phares du scénario d'évaluation
    if (item.code === 'A.8.5') {
      // Authentification sécurisée (MFA) - Clé du scénario Annexe B
      isApplicable = true;
      justification = 'Applicable : Obligation stricte de sécuriser l’accès à la base de données clients et à la messagerie professionnelle.';
      implementationStatus = 'partiellement_mis_en_oeuvre';
      maturityLevel = 3;
      evidenceRef = 'Capture de configuration TOTP console administrateur v1.2';
      gapDescription = 'La double authentification n’est pas encore généralisée à l’ensemble des collaborateurs tiers.';
      linkedActionId = 'act-01';
    } else if (item.code === 'A.6.3') {
      // Sensibilisation et formation
      isApplicable = true;
      justification = 'Applicable : Le facteur humain représente le premier vecteur d’entrée des attaques par phishing.';
      implementationStatus = 'planifie';
      maturityLevel = 2;
      evidenceRef = 'Support de formation diaporama v1.0 prêt pour diffusion';
      gapDescription = 'La session prévue n’a pas encore été délivrée à la totalité du personnel.';
      linkedActionId = 'act-02';
    } else if (item.code === 'A.8.13') {
      // Sauvegardes
      isApplicable = true;
      justification = 'Applicable : Protection impérative contre les rançongiciels et les pannes matérielles.';
      implementationStatus = 'mis_en_oeuvre';
      maturityLevel = 4;
      evidenceRef = 'PV-RESTORE-2026-10-18.pdf & script de sauvegarde journalier cron';
      gapDescription = 'Aucun écart critique : les tests de restauration périodiques sont en place.';
      linkedActionId = 'act-03';
    } else if (item.code === 'A.5.10') {
      // Charte informatique
      isApplicable = true;
      justification = 'Applicable : Fixe le cadre contractuel d’usage des matériels et des données de l’entreprise.';
      implementationStatus = 'planifie';
      maturityLevel = 1;
      evidenceRef = 'Projet de charte informatique en cours de relecture';
      gapDescription = 'Absence de signature par les collaborateurs en poste.';
      linkedActionId = 'act-05';
    } else if (item.code === 'A.7.11') {
      // Climatisation / Électricité
      isApplicable = true;
      justification = 'Applicable : Les délestages fréquents nécessitent un dispositif d’alimentation ininterruptible fiable.';
      implementationStatus = 'partiellement_mis_en_oeuvre';
      maturityLevel = 2;
      evidenceRef = 'Facture d’achat de l’onduleur existant';
      gapDescription = 'Autonomie batterie trop faible en cas de coupure de plus de 5 minutes.';
      linkedActionId = 'act-04';
    } else if (item.code === 'A.8.4' || item.code === 'A.8.28' || item.code === 'A.8.25') {
      // Code source / Développement sécurisé - Cas d'exclusion typique PME non éditrice de logiciel
      isApplicable = false;
      justification = 'Non applicable : La PME ne développe pas de logiciels sur mesure en interne et s’appuie sur des solutions SaaS du marché certifiées.';
      implementationStatus = 'non_applicable';
      maturityLevel = 1;
      evidenceRef = 'Contrats fournisseurs SaaS avec engagement de maintenance éditeur';
      gapDescription = 'Non applicable.';
    } else if (item.code === 'A.7.6') {
      // Travail en zone sécurisée
      isApplicable = false;
      justification = 'Non applicable : La structure ne possède pas de salle blanche ni de zone d’accès restreint militaire ou bancaire haute sécurité.';
      implementationStatus = 'non_applicable';
      maturityLevel = 1;
      evidenceRef = 'Plan des locaux à bureau unique';
      gapDescription = 'Non applicable.';
    } else if (item.code === 'A.5.1' || item.code === 'A.5.2' || item.code === 'A.5.15' || item.code === 'A.8.1' || item.code === 'A.8.7' || item.code === 'A.8.20') {
      // Mesures de base mises en œuvre
      isApplicable = true;
      justification = 'Mesure fondamentale pour la gouvernance et le contrôle technique.';
      implementationStatus = 'mis_en_oeuvre';
      maturityLevel = 3;
      evidenceRef = 'Procédure documentée et vérifiée lors de l’audit initial';
      gapDescription = 'Contrôle opérationnel régulier requis.';
    } else if (item.code.startsWith('A.5')) {
      implementationStatus = 'partiellement_mis_en_oeuvre';
      maturityLevel = 2;
      evidenceRef = 'Documentation administrative PME';
      gapDescription = 'Formalisation écrite partielle des pratiques orales existantes.';
    } else {
      implementationStatus = 'non_commence';
      maturityLevel = 1;
      evidenceRef = '';
      gapDescription = 'À traiter selon le plan de maturité pluriannuel.';
    }

    return {
      id: `soa-${orgId}-${item.code.toLowerCase().replace('.', '-')}`,
      code: item.code,
      title: item.title,
      domain: item.domain,
      description: item.description,
      isApplicable,
      justification,
      implementationStatus,
      maturityLevel,
      evidenceRef,
      gapDescription,
      linkedActionId,
      lastReviewDate: '2026-10-20',
      reviewedBy: 'Hamani Massaoudou',
      organizationId: orgId
    };
  });
}

// Génération d'une SoA vierge / propre pour toute nouvelle organisation
export function generateCleanSoA(orgId: string): SoAControl[] {
  return ISO27001_CONTROLS_CATALOG.map((item) => ({
    id: `soa-${orgId}-${item.code.toLowerCase().replace('.', '-')}`,
    code: item.code,
    title: item.title,
    domain: item.domain,
    description: item.description,
    isApplicable: true,
    justification: 'Contrôle à évaluer dans le cadre de la démarche de conformité ISO/IEC 27001:2022.',
    implementationStatus: 'non_commence',
    maturityLevel: 1,
    evidenceRef: '',
    gapDescription: 'Évaluation initiale à réaliser par le référent GRC ou l’administrateur organisation.',
    lastReviewDate: new Date().toISOString().slice(0, 10),
    reviewedBy: 'Administrateur Organisation',
    organizationId: orgId
  }));
}

export const INITIAL_TEST_PROTOCOL: TestProtocolLog = {
  id: 'test-run-01',
  date: '2026-10-26',
  testerName: 'Abdoul Salam Issifi',
  testerRole: 'Responsable de Sirba Communication',
  organizationName: 'Sirba Communication / PME Démonstration',
  durationMinutes: 25,
  scenariosCompleted: [
    'Création et paramétrage du périmètre de l’organisation PME Démonstration',
    'Enregistrement de l’actif « Base de données clients »',
    'Création du risque « Accès non autorisé à la base de données clients » (P:4 x I:5 = 20 Critique)',
    'Association de l’action corrective « Activer l’authentification multifacteur (MFA) »',
    'Mise à jour de la mesure SoA A.8.5 avec justification, preuve et écart',
    'Consultation du tableau de bord et vérification des indicateurs calculés'
  ],
  feedbackNotes: 'Interface très claire et compréhensible pour une PME sans service informatique dédié. Le calcul immédiat du score et la liaison directe avec les actions facilitent grandement la prise de décision.',
  perceivedUtility: 'Excellent',
  signedByTester: true
};

export const DEFAULT_EVALUATION_TASKS: TaskEvaluation[] = [
  {
    taskId: 'T1',
    num: 1,
    taskTitle: 'Créer une organisation et consulter le tableau de bord initial',
    targetRequirement: 'EF-01 / EF-08',
    expectedResult: 'L’espace « PME Démonstration » est créé ; les indicateurs globaux s\'affichent sans blocage.',
    successCriteria: 'Création sans erreur, indicateurs initialisés, tableau de bord compréhensible pour le dirigeant.',
    status: 'valide',
    executionTimeMinutes: 3,
    observations: 'Prise en main immédiate. L’indicateur de maturité et le niveau de risque global sont très parlants.'
  },
  {
    taskId: 'T2',
    num: 2,
    taskTitle: 'Recenser un actif critique et documenter sa cartographie',
    targetRequirement: 'EF-02',
    expectedResult: 'L\'actif « Base de données clients » est enregistré avec sa catégorie et criticité « Critique ».',
    successCriteria: 'Actif présent dans l\'inventaire, propriétaire et localisation correctement enregistrés.',
    status: 'valide',
    executionTimeMinutes: 4,
    observations: 'Les catégories prédéfinies correspondent exactement aux besoins d\'une PME de services.'
  },
  {
    taskId: 'T3',
    num: 3,
    taskTitle: 'Évaluer un risque brut et calculer la matrice 5x5',
    targetRequirement: 'EF-03 / EF-04',
    expectedResult: 'Saisie probabilité 4 et impact 5 -> Score 20, niveau « Critique » selon le seuil B14 (§7).',
    successCriteria: 'Calcul automatique exact, placement visuel sur la matrice 5x5 et proposition de traitement.',
    status: 'valide',
    executionTimeMinutes: 5,
    observations: 'L\'ajustement par curseurs et le code couleur instantané rendent l\'évaluation intuitive.'
  },
  {
    taskId: 'T4',
    num: 4,
    taskTitle: 'Déclarer l\'applicabilité d\'une mesure SoA ISO 27001:2022 et motiver l\'écart',
    targetRequirement: 'EF-06 / EF-07',
    expectedResult: 'Mesure A.8.5 déclarée applicable ; statut, justification, preuve et écart documentés.',
    successCriteria: 'Mise à jour en temps réel des statistiques SoA et lien d\'action corrective proposé.',
    status: 'valide',
    executionTimeMinutes: 5,
    observations: 'Le texte vulgarisé en français aide beaucoup. Les exemples de justifications évitent de bloquer.'
  },
  {
    taskId: 'T5',
    num: 5,
    taskTitle: 'Créer et assigner une action corrective liée au risque',
    targetRequirement: 'EF-05',
    expectedResult: 'Action avec responsable assigné, priorité, échéance et statut « ouverte ».',
    successCriteria: 'Lien bidirectionnel risque-action conservé, suivi visible dans le kanban des actions.',
    status: 'valide',
    executionTimeMinutes: 4,
    observations: 'Lien direct depuis la fiche risque vers l\'action corrective très apprécié.'
  },
  {
    taskId: 'T6',
    num: 6,
    taskTitle: 'Générer le rapport consolidé et signer la fiche d\'évaluation',
    targetRequirement: 'EF-08 / Annexe C',
    expectedResult: 'Export PDF officiel disponible, synthèse globale horodatée et accord formel signé.',
    successCriteria: 'Génération sans erreur, mise en page A4 officielle exploitable pour soutenance B14.',
    status: 'valide',
    executionTimeMinutes: 4,
    observations: 'Export PDF propre et complet. Permet de présenter les résultats directement en comité de direction.'
  }
];

export const INITIAL_TEST_SHEETS: UserTestSheet[] = [
  {
    id: 'sheet-issifi-01',
    code: 'FT-2026-001',
    userId: 'user-issifi',
    testerName: 'Abdoul Salam Issifi',
    testerEmail: 'direction@sirbacom.ne',
    testerRole: 'Directeur Général & Gérant',
    organizationName: 'Sirba Communication (PME Niamey)',
    sessionTitle: 'Évaluation officielle B14 — Testeur tiers externe (Livrable 1 §4)',
    date: '2026-10-26',
    durationMinutes: 25,
    testEnvironment: 'Navigateur Google Chrome v122 / PC portable Windows 11 / Écran 1920x1080',
    tasks: DEFAULT_EVALUATION_TASKS.map(t => ({ ...t })),
    globalScorePercent: 100,
    functionalitiesUnderstood: 'L’évaluation par curseurs Probabilité × Impact, le calcul instantané du score et le classement par couleur sur la matrice 5x5. La simplicité de création des actions correctives.',
    difficultiesEncountered: 'Le vocabulaire ISO 27001 peut paraître intimidant pour un non-initié sans les résumés vulgarisés intégrés. L’ajout de modèles de justifications a résolu ce point.',
    suggestions: 'Conserver la clarté visuelle et proposer l\'export PDF individuel pour chaque fiche d\'évaluation.',
    feedbackNotes: 'Interface très claire et compréhensible pour une PME sans service informatique dédié. Le calcul immédiat du score et la liaison directe avec les actions facilitent grandement la prise de décision.',
    perceivedUtility: 'Indispensable',
    recommendationScore: 10,
    signedByTester: true,
    signatureDate: '2026-10-26',
    mentorOrEvaluatorName: 'Aboubacar Yacouba Mai Birni (Mentor GRC)',
    mentorNotes: 'Testeur tiers validé dans le cadre du projet B14 APSI-NE. Résultats cohérents avec le cahier des charges.',
    mentorValidated: true,
    createdAt: '2026-10-26T10:30:00Z',
    updatedAt: '2026-10-26T11:15:00Z'
  },
  {
    id: 'sheet-issifi-02',
    code: 'FT-2026-002',
    userId: 'user-issifi',
    testerName: 'Abdoul Salam Issifi',
    testerEmail: 'direction@sirbacom.ne',
    testerRole: 'Directeur Général & Gérant',
    organizationName: 'Sirba Communication (PME Niamey)',
    sessionTitle: 'Test de validation post-correctifs — Contrôle d\'accès & Robustesse IAM',
    date: '2026-10-27',
    durationMinutes: 18,
    testEnvironment: 'Navigateur Firefox v124 / PC portable / AI Studio Web Preview',
    tasks: [
      {
        taskId: 'T1',
        num: 1,
        taskTitle: 'Connexion sécurisée avec compte dédié et contrôle de rôle',
        targetRequirement: 'IAM-01 / EF-01',
        expectedResult: 'Authentification avec rôle « Responsable Métier », accès filtré aux modules.',
        successCriteria: 'Vérification du rôle, impossibilité de modifier les contrôles de gouvernance.',
        status: 'valide',
        executionTimeMinutes: 2,
        observations: 'Le profil Responsable Métier est parfaitement restreint en consultation sur les éléments administratifs.'
      },
      {
        taskId: 'T2',
        num: 2,
        taskTitle: 'Vérification de la cartographie des actifs et criticité',
        targetRequirement: 'EF-02',
        expectedResult: 'Consultation de l\'inventaire et vérification des propriétaires.',
        successCriteria: 'Filtres actifs par criticité et catégorie fonctionnels.',
        status: 'valide',
        executionTimeMinutes: 3,
        observations: 'Affichage clair et recherche instantanée.'
      },
      {
        taskId: 'T3',
        num: 3,
        taskTitle: 'Réévaluation du risque résiduel après mise en place de la MFA',
        targetRequirement: 'EF-03 / EF-04',
        expectedResult: 'Le risque brut (20 Critique) passe à un risque résiduel (4 Faible).',
        successCriteria: 'Calcul du score résiduel et affichage du delta de réduction.',
        status: 'valide',
        executionTimeMinutes: 4,
        observations: 'Visualisation immédiate de l\'efficacité des mesures sur la matrice de risque.'
      },
      {
        taskId: 'T4',
        num: 4,
        taskTitle: 'Consultation des contrôles SoA applicables au télétravail',
        targetRequirement: 'EF-06 / EF-07',
        expectedResult: 'Mesure A.6.7 vérifiée et preuve documentaire consultée.',
        successCriteria: 'Affichage de la charte de télétravail en référence documentaire.',
        status: 'valide',
        executionTimeMinutes: 3,
        observations: 'La distinction entre mesures organisationnelles et techniques est limpide.'
      },
      {
        taskId: 'T5',
        num: 5,
        taskTitle: 'Suivi de clôture de l\'action corrective MFA',
        targetRequirement: 'EF-05',
        expectedResult: 'Action passée à l\'état « Clôturée » avec commentaire explicatif.',
        successCriteria: 'Historique des commentaires horodaté et changement de statut enregistré.',
        status: 'valide',
        executionTimeMinutes: 3,
        observations: 'Workflow très fluide, parfait pour piloter les prestataires ou collaborateurs.'
      },
      {
        taskId: 'T6',
        num: 6,
        taskTitle: 'Export PDF de la fiche de test individuelle',
        targetRequirement: 'EF-08 / Annexe C',
        expectedResult: 'Aperçu avant impression A4 propre, logo GRC-Goal et signatures conservées.',
        successCriteria: 'Export PDF net, pas d\'éléments parasites d\'interface.',
        status: 'valide',
        executionTimeMinutes: 3,
        observations: 'Rendu officiel impeccable pour justifier de la réalisation des tests.'
      }
    ],
    globalScorePercent: 100,
    functionalitiesUnderstood: 'Gestion des profils d\'utilisateurs, calcul du risque résiduel après traitement, export PDF individualisé.',
    difficultiesEncountered: 'Aucune difficulté constatée lors de cette seconde itération.',
    suggestions: 'Permettre le téléchargement direct du PDF en un clic depuis le tableau récapitulatif des fiches.',
    feedbackNotes: 'La deuxième session confirme la maturité de l\'outil. GRC-Goal répond exactement aux besoins de conformité des PME nigériennes sans complexité superflue.',
    perceivedUtility: 'Indispensable',
    recommendationScore: 10,
    signedByTester: true,
    signatureDate: '2026-10-27',
    mentorOrEvaluatorName: 'Aboubacar Yacouba Mai Birni (Mentor GRC)',
    mentorNotes: 'Validation concluante du test de régression.',
    mentorValidated: true,
    createdAt: '2026-10-27T09:15:00Z',
    updatedAt: '2026-10-27T09:45:00Z'
  },
  {
    id: 'sheet-aichatou-01',
    code: 'FT-2026-003',
    userId: 'user-aichatou',
    testerName: 'Aïchatou Diallo',
    testerEmail: 'aichatou.diallo@sirbacom.ne',
    testerRole: 'Responsable Commerciale & Opérations',
    organizationName: 'Sirba Communication',
    sessionTitle: 'Évaluation ergonomique parcours Métier & Cartographie des actifs',
    date: '2026-10-25',
    durationMinutes: 30,
    testEnvironment: 'Navigateur Safari / MacBook Air / Écran Retina',
    tasks: [
      {
        taskId: 'T1',
        num: 1,
        taskTitle: 'Prise en main du tableau de bord et repérage visuel',
        targetRequirement: 'EF-01 / EF-08',
        expectedResult: 'Compréhension intuitive des 4 compteurs et du diagramme de conformité.',
        successCriteria: 'Identification directe des priorités sans formation préalable.',
        status: 'valide',
        executionTimeMinutes: 4,
        observations: 'Les jauges et couleurs permettent une compréhension immédiate.'
      },
      {
        taskId: 'T2',
        num: 2,
        taskTitle: 'Création d\'un actif métier (Fichier devis et facturation)',
        targetRequirement: 'EF-02',
        expectedResult: 'Actif classé en criticité Élevée.',
        successCriteria: 'Champs intuitifs et aide contextuelle.',
        status: 'valide',
        executionTimeMinutes: 5,
        observations: 'Très simple à renseigner.'
      },
      {
        taskId: 'T3',
        num: 3,
        taskTitle: 'Évaluation du risque de perte de données clients',
        targetRequirement: 'EF-03 / EF-04',
        expectedResult: 'Score 12 (Élevé) calculé automatiquement.',
        successCriteria: 'Compréhension du niveau de sévérité.',
        status: 'valide_avec_reserve',
        executionTimeMinutes: 7,
        observations: 'Besoin d\'un rappel sur la définition de la « vraisemblance » vs « impact financier ».'
      },
      {
        taskId: 'T4',
        num: 4,
        taskTitle: 'Consultation des mesures de sauvegarde SoA A.8.13',
        targetRequirement: 'EF-06 / EF-07',
        expectedResult: 'Mesure identifiée et statut vérifié.',
        successCriteria: 'Recherche textuelle dans le catalogue de 93 mesures.',
        status: 'valide',
        executionTimeMinutes: 5,
        observations: 'La recherche rapide par mot-clé fonctionne très bien.'
      },
      {
        taskId: 'T5',
        num: 5,
        taskTitle: 'Création d\'une action de sauvegarde hors site',
        targetRequirement: 'EF-05',
        expectedResult: 'Action assignée à l\'administrateur système.',
        successCriteria: 'Échéance fixée et priorité définie.',
        status: 'valide',
        executionTimeMinutes: 4,
        observations: 'Ajout fluide et assignation rapide.'
      },
      {
        taskId: 'T6',
        num: 6,
        taskTitle: 'Génération de la fiche récapitulative',
        targetRequirement: 'EF-08 / Annexe C',
        expectedResult: 'Visualisation et validation de la fiche.',
        successCriteria: 'Export prêt à être partagé avec la direction.',
        status: 'valide',
        executionTimeMinutes: 5,
        observations: 'Très pratique pour les revues d\'activité.'
      }
    ],
    globalScorePercent: 92,
    functionalitiesUnderstood: 'Tableau de bord, ajout d\'actifs, plan d\'actions correctives.',
    difficultiesEncountered: 'La terminologie pure de gestion des risques demande un court temps d\'adaptation pour un profil non technique.',
    suggestions: 'Ajouter des infobulles explicatives sur chaque niveau de probabilité.',
    feedbackNotes: 'Application très séduisante, moderne et fluide. Elle démystifie la sécurité pour les responsables de services.',
    perceivedUtility: 'Très utile',
    recommendationScore: 9,
    signedByTester: true,
    signatureDate: '2026-10-25',
    mentorOrEvaluatorName: 'Hamani Massaoudou (Concepteur B14)',
    mentorNotes: 'Remarques intégrées dans la version finale.',
    mentorValidated: true,
    createdAt: '2026-10-25T14:00:00Z',
    updatedAt: '2026-10-25T14:45:00Z'
  }
];
