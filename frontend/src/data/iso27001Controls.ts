import { SoAControl } from '../types/grc';

// Catalogue officiel simplifié ISO/IEC 27001:2022 (Annexe A)
// Réparti selon les 4 thèmes normalisés:
// A.5 Contrôles organisationnels (37)
// A.6 Contrôles relatifs aux personnes (8)
// A.7 Contrôles physiques (14)
// A.8 Contrôles technologiques (34)

export interface RawControl {
  code: string;
  title: string;
  domain: SoAControl['domain'];
  description: string;
}

export const ISO27001_CONTROLS_CATALOG: RawControl[] = [
  // A.5 Contrôles organisationnels (37 mesures)
  {
    code: 'A.5.1',
    title: 'Politiques de sécurité de l’information',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Définition, approbation par la direction, publication et révision régulière des politiques de sécurité.'
  },
  {
    code: 'A.5.2',
    title: 'Rôles et responsabilités liés à la sécurité de l’information',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Attribution claire des responsabilités en matière de sécurité de l’information.'
  },
  {
    code: 'A.5.3',
    title: 'Séparation des tâches',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Séparation des fonctions et des zones de responsabilité pour réduire les opportunités d’altération.'
  },
  {
    code: 'A.5.4',
    title: 'Responsabilités de la direction',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Exigence que la direction exige du personnel qu’il applique la sécurité selon les politiques établies.'
  },
  {
    code: 'A.5.5',
    title: 'Contact avec les autorités',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Maintien de contacts appropriés avec les autorités compétentes (cyberdéfense, régulateurs).'
  },
  {
    code: 'A.5.6',
    title: 'Contact avec des groupes d’intérêt spécialisés',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Participation à des forums, associations de cybersécurité pour maintenir la veille.'
  },
  {
    code: 'A.5.7',
    title: 'Renseignement sur les menaces (Threat intelligence)',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Collecte et analyse des informations sur les menaces émergentes.'
  },
  {
    code: 'A.5.8',
    title: 'Sécurité de l’information dans la gestion de projet',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Intégration de la sécurité dans la conduite de tous les projets de l’entreprise.'
  },
  {
    code: 'A.5.9',
    title: 'Inventaire des informations et des autres actifs associés',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Identification et tenue à jour d’un registre complet des actifs matériels, logiciels et données.'
  },
  {
    code: 'A.5.10',
    title: 'Utilisation acceptable de l’information et des autres actifs associés',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Règles d’usage acceptable (charte informatique) documentées et diffusées.'
  },
  {
    code: 'A.5.11',
    title: 'Restitution des actifs',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Procédure formelle de restitution de tous les actifs lors du départ d’un employé ou sous-traitant.'
  },
  {
    code: 'A.5.12',
    title: 'Classification de l’information',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Classification selon les exigences légales, la valeur, la criticité et la sensibilité.'
  },
  {
    code: 'A.5.13',
    title: 'Étiquetage des informations',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Procédures d’étiquetage des informations conformément au schéma de classification.'
  },
  {
    code: 'A.5.14',
    title: 'Transfert d’informations',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Règles et contrôles pour protéger l’information lors de transferts internes ou externes.'
  },
  {
    code: 'A.5.15',
    title: 'Contrôle d’accès',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Règles d’accès aux informations et ressources basées sur les besoins métier (Need-to-Know).'
  },
  {
    code: 'A.5.16',
    title: 'Gestion des identités',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Cycle de vie complet de l’attribution, modification et révocation des identités des utilisateurs.'
  },
  {
    code: 'A.5.17',
    title: 'Informations d’authentification',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Gestion sécurisée des secrets d’authentification (mots de passe, tokens, clés de chiffrement).'
  },
  {
    code: 'A.5.18',
    title: 'Droits d’accès',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Attribution, révision périodique et suppression des droits d’accès aux systèmes.'
  },
  {
    code: 'A.5.19',
    title: 'Sécurité de l’information dans les relations avec les fournisseurs',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Exigences contractuelles de sécurité imposées aux prestataires externes.'
  },
  {
    code: 'A.5.20',
    title: 'Prise en compte de la sécurité dans les accords avec les fournisseurs',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Clauses de confidentialité et garanties de sécurité formalisées dans les contrats.'
  },
  {
    code: 'A.5.21',
    title: 'Gestion de la sécurité dans la chaîne d’approvisionnement des TIC',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Processus de gestion des risques liés à la chaîne logistique des produits et services TIC.'
  },
  {
    code: 'A.5.22',
    title: 'Surveillance, revue et gestion du changement des services fournisseurs',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Audit et évaluation périodique de la conformité des prestations des sous-traitants.'
  },
  {
    code: 'A.5.23',
    title: 'Sécurité de l’information dans l’utilisation de services en nuage (Cloud)',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Critères et procédures encadrant l’acquisition, l’usage et la gestion des services Cloud.'
  },
  {
    code: 'A.5.24',
    title: 'Planification et préparation de la gestion des incidents de sécurité',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Mise en place d’une procédure de réponse aux incidents pour assurer une réaction rapide.'
  },
  {
    code: 'A.5.25',
    title: 'Évaluation et décision sur les événements de sécurité de l’information',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Critères d’évaluation pour déterminer si un événement constitue un incident de sécurité avéré.'
  },
  {
    code: 'A.5.26',
    title: 'Réponse aux incidents de sécurité de l’information',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Actions de traitement, de confinement, d’éradication et de rétablissement.'
  },
  {
    code: 'A.5.27',
    title: 'Tirage d’enseignements des incidents de sécurité de l’information',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Retour d’expérience (post-mortem) pour corriger les vulnérabilités exploitées.'
  },
  {
    code: 'A.5.28',
    title: 'Collecte de preuves',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Préservation intègre des preuves numériques exploitables pour des enquêtes.'
  },
  {
    code: 'A.5.29',
    title: 'Sécurité de l’information lors de perturbations (Continuité)',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Plans de maintien du niveau de sécurité en situation de crise ou de sinistre.'
  },
  {
    code: 'A.5.30',
    title: 'Préparation des TIC pour la continuité des activités',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Plan de reprise d’activité informatique (PRA/PCA) testé régulièrement.'
  },
  {
    code: 'A.5.31',
    title: 'Exigences légales, statutaires, réglementaires et contractuelles',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Identification et veille sur l’ensemble des obligations juridiques applicables.'
  },
  {
    code: 'A.5.32',
    title: 'Droits de propriété intellectuelle',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Protection des logiciels licenciés et des brevets/droits d’auteur de l’organisation.'
  },
  {
    code: 'A.5.33',
    title: 'Protection des enregistrements',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Archivage sécurisé des registres et pièces comptables contre toute altération.'
  },
  {
    code: 'A.5.34',
    title: 'Protection des données à caractère personnel et de la vie privée',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Conformité avec la législation relative à la protection des données (Loi nationale / RGPD).'
  },
  {
    code: 'A.5.35',
    title: 'Revue indépendante de la sécurité de l’information',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Audits de sécurité réguliers réalisés par des personnes indépendantes des activités auditées.'
  },
  {
    code: 'A.5.36',
    title: 'Conformité aux politiques et normes de sécurité',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Contrôles périodiques pour vérifier l’application réelle des règles par les opérationnels.'
  },
  {
    code: 'A.5.37',
    title: 'Procédures documentées d’exploitation',
    domain: 'A.5 Contrôles organisationnels',
    description: 'Documentation formelle des processus réguliers d’administration et d’exploitation des systèmes.'
  },

  // A.6 Contrôles relatifs aux personnes (8 mesures)
  {
    code: 'A.6.1',
    title: 'Sélection des candidats (Screening)',
    domain: 'A.6 Contrôles relatifs aux personnes',
    description: 'Vérifications préalables des antécédents professionnels et références avant recrutement.'
  },
  {
    code: 'A.6.2',
    title: 'Conditions d’embauche',
    domain: 'A.6 Contrôles relatifs aux personnes',
    description: 'Engagements de confidentialité et obligations de sécurité stipulés dans les contrats de travail.'
  },
  {
    code: 'A.6.3',
    title: 'Sensibilisation, éducation et formation à la sécurité',
    domain: 'A.6 Contrôles relatifs aux personnes',
    description: 'Sessions régulières de sensibilisation aux risques (phishing, mots de passe, ingénierie sociale).'
  },
  {
    code: 'A.6.4',
    title: 'Procédure disciplinaire',
    domain: 'A.6 Contrôles relatifs aux personnes',
    description: 'Processus formalisé de sanctions en cas de violation délibérée des règles de sécurité.'
  },
  {
    code: 'A.6.5',
    title: 'Responsabilités après cessation ou modification de l’emploi',
    domain: 'A.6 Contrôles relatifs aux personnes',
    description: 'Maintien des obligations de confidentialité même après la rupture contractuelle.'
  },
  {
    code: 'A.6.6',
    title: 'Accords de confidentialité ou de non-divulgation (NDA)',
    domain: 'A.6 Contrôles relatifs aux personnes',
    description: 'Signature formelle d’accords de non-divulgation avec les employés, stagiaires et partenaires.'
  },
  {
    code: 'A.6.7',
    title: 'Télétravail',
    domain: 'A.6 Contrôles relatifs aux personnes',
    description: 'Règles spécifiques de sécurité applicables au travail à distance ou nomade.'
  },
  {
    code: 'A.6.8',
    title: 'Signalement des événements liés à la sécurité',
    domain: 'A.6 Contrôles relatifs aux personnes',
    description: 'Canal simple et incitatif permettant aux salariés de remonter tout incident ou doute.'
  },

  // A.7 Contrôles physiques (14 mesures)
  {
    code: 'A.7.1',
    title: 'Périmètres physiques de sécurité',
    domain: 'A.7 Contrôles physiques',
    description: 'Barrières et protections délimitant les zones abritant les informations et équipements.'
  },
  {
    code: 'A.7.2',
    title: 'Contrôles des accès physiques',
    domain: 'A.7 Contrôles physiques',
    description: 'Contrôle des entrées par badge, clé sécurisée et registre des visiteurs externes.'
  },
  {
    code: 'A.7.3',
    title: 'Sécurisation des bureaux, des pièces et des installations',
    domain: 'A.7 Contrôles physiques',
    description: 'Verrouillage des bureaux sensibles et isolation des salles techniques.'
  },
  {
    code: 'A.7.4',
    title: 'Surveillance physique de la sécurité',
    domain: 'A.7 Contrôles physiques',
    description: 'Systèmes de vidéosurveillance ou rondes de sécurité pour surveiller les locaux.'
  },
  {
    code: 'A.7.5',
    title: 'Protection contre les menaces physiques et environnementales',
    domain: 'A.7 Contrôles physiques',
    description: 'Prévention contre les incendies, inondations, séismes, surtensions et poussières.'
  },
  {
    code: 'A.7.6',
    title: 'Travail dans les zones sécurisées',
    domain: 'A.7 Contrôles physiques',
    description: 'Règles de comportement strictes dans les salles serveurs et archives sensibles.'
  },
  {
    code: 'A.7.7',
    title: 'Bureau propre et écran verrouillé (Clean desk / Clear screen)',
    domain: 'A.7 Contrôles physiques',
    description: 'Verrouillage automatique des sessions et rangement des documents papier confidentiels.'
  },
  {
    code: 'A.7.8',
    title: 'Emplacement et protection du matériel',
    domain: 'A.7 Contrôles physiques',
    description: 'Positionnement du matériel informatique pour minimiser les risques de dommages ou regards indiscrets.'
  },
  {
    code: 'A.7.9',
    title: 'Sécurité des matériels hors des locaux de l’organisation',
    domain: 'A.7 Contrôles physiques',
    description: 'Protection des ordinateurs portables et disques amovibles en déplacement.'
  },
  {
    code: 'A.7.10',
    title: 'Supports de stockage de données',
    domain: 'A.7 Contrôles physiques',
    description: 'Gestion sécurisée, contrôle d’inventaire et chiffrement des supports amovibles (clés USB, SSD).'
  },
  {
    code: 'A.7.11',
    title: 'Services généraux et utilités (Électricité, Climatisation)',
    domain: 'A.7 Contrôles physiques',
    description: 'Onduleurs, groupes électrogènes et climatisation adaptés pour éviter les coupures brutes.'
  },
  {
    code: 'A.7.12',
    title: 'Sécurité du câblage',
    domain: 'A.7 Contrôles physiques',
    description: 'Protection des câbles électriques et de télécommunication contre l’interception ou les dommages.'
  },
  {
    code: 'A.7.13',
    title: 'Maintenance du matériel',
    domain: 'A.7 Contrôles physiques',
    description: 'Contrats de maintenance préventive et curative assurés par des techniciens habilités.'
  },
  {
    code: 'A.7.14',
    title: 'Élimination sécurisée ou réutilisation du matériel',
    domain: 'A.7 Contrôles physiques',
    description: 'Démagnétisation ou destruction physique certifiée des disques durs avant mise au rebut.'
  },

  // A.8 Contrôles technologiques (34 mesures)
  {
    code: 'A.8.1',
    title: 'Équipements terminaux des utilisateurs',
    domain: 'A.8 Contrôles technologiques',
    description: 'Configuration durcie, chiffrement du disque dur BitLocker/FileVault et gestion de flotte.'
  },
  {
    code: 'A.8.2',
    title: 'Droits d’accès privilégiés',
    domain: 'A.8 Contrôles technologiques',
    description: 'Restriction stricte et traçabilité des comptes administrateurs racine/domain admin.'
  },
  {
    code: 'A.8.3',
    title: 'Restriction d’accès à l’information',
    domain: 'A.8 Contrôles technologiques',
    description: 'Cloisonnement des répertoires partagés et accès aux bases selon les profils métiers.'
  },
  {
    code: 'A.8.4',
    title: 'Accès au code source',
    domain: 'A.8 Contrôles technologiques',
    description: 'Contrôle d’accès aux dépôts Git, révision de code et protection contre les fuites de secrets.'
  },
  {
    code: 'A.8.5',
    title: 'Authentification sécurisée (MFA)',
    domain: 'A.8 Contrôles technologiques',
    description: 'Déploiement obligatoire de l’authentification multifacteur pour tous les accès distants et critiques.'
  },
  {
    code: 'A.8.6',
    title: 'Gestion de la capacité',
    domain: 'A.8 Contrôles technologiques',
    description: 'Surveillance des ressources (disque, RAM, bande passante) pour anticiper les saturations.'
  },
  {
    code: 'A.8.7',
    title: 'Protection contre les programmes malveillants',
    domain: 'A.8 Contrôles technologiques',
    description: 'Antivirus/EDR installé et mis à jour automatiquement sur tous les serveurs et postes.'
  },
  {
    code: 'A.8.8',
    title: 'Gestion des vulnérabilités techniques',
    domain: 'A.8 Contrôles technologiques',
    description: 'Scans réguliers de vulnérabilités et politique rigoureuse de déploiement des correctifs.'
  },
  {
    code: 'A.8.9',
    title: 'Gestion des configurations',
    domain: 'A.8 Contrôles technologiques',
    description: 'Standards de configuration sécurisée (baselines) établis pour les systèmes et logiciels.'
  },
  {
    code: 'A.8.10',
    title: 'Suppression des informations',
    domain: 'A.8 Contrôles technologiques',
    description: 'Effacement sécurisé et irréversible des fichiers temporaires ou périmés.'
  },
  {
    code: 'A.8.11',
    title: 'Masquage des données',
    domain: 'A.8 Contrôles technologiques',
    description: 'Pseudonymisation ou masquage des données sensibles dans les environnements de test.'
  },
  {
    code: 'A.8.12',
    title: 'Prévention contre les fuites de données (DLP)',
    domain: 'A.8 Contrôles technologiques',
    description: 'Mesures pour détecter et empêcher l’extraction illégitime de données sensibles.'
  },
  {
    code: 'A.8.13',
    title: 'Sauvegardes des informations',
    domain: 'A.8 Contrôles technologiques',
    description: 'Sauvegardes régulières (règle 3-2-1), chiffrées, immuables et tests périodiques de restauration.'
  },
  {
    code: 'A.8.14',
    title: 'Redondance des moyens de traitement de l’information',
    domain: 'A.8 Contrôles technologiques',
    description: 'Moyens redondants pour assurer la disponibilité des services stratégiques.'
  },
  {
    code: 'A.8.15',
    title: 'Journalisation des événements (Logging)',
    domain: 'A.8 Contrôles technologiques',
    description: 'Génération et archivage des journaux d’audit (connexions, erreurs, modifications critiques).'
  },
  {
    code: 'A.8.16',
    title: 'Activités de surveillance (Monitoring)',
    domain: 'A.8 Contrôles technologiques',
    description: 'Supervision continue du réseau et alertes en cas de comportement anormal ou suspect.'
  },
  {
    code: 'A.8.17',
    title: 'Synchronisation des horloges (NTP)',
    domain: 'A.8 Contrôles technologiques',
    description: 'Synchronisation automatique sur une source de temps certifiée pour la corrélation des logs.'
  },
  {
    code: 'A.8.18',
    title: 'Utilisation de programmes utilitaires à privilèges',
    domain: 'A.8 Contrôles technologiques',
    description: 'Encadrement strict des scripts et outils administratifs puissants susceptibles de contourner la sécurité.'
  },
  {
    code: 'A.8.19',
    title: 'Installation de logiciels sur les systèmes opérationnels',
    domain: 'A.8 Contrôles technologiques',
    description: 'Interdiction d’installation arbitraire de logiciels non homologués par les utilisateurs finaux.'
  },
  {
    code: 'A.8.20',
    title: 'Sécurité des réseaux',
    domain: 'A.8 Contrôles technologiques',
    description: 'Pare-feu, filtrage des flux et segmentation des réseaux internes et Wi-Fi invités.'
  },
  {
    code: 'A.8.21',
    title: 'Sécurité des services réseau',
    domain: 'A.8 Contrôles technologiques',
    description: 'Garanties de sécurité et niveaux de service intégrés dans les contrats des FAI et opérateurs.'
  },
  {
    code: 'A.8.22',
    title: 'Cloisonnement des réseaux',
    domain: 'A.8 Contrôles technologiques',
    description: 'Segmentation en sous-réseaux (VLAN) isolant la production, la bureautique et les invités.'
  },
  {
    code: 'A.8.23',
    title: 'Filtrage Web',
    domain: 'A.8 Contrôles technologiques',
    description: 'Blocage des sites web malveillants, illicites ou connus pour diffuser des virus.'
  },
  {
    code: 'A.8.24',
    title: 'Utilisation de la cryptographie',
    domain: 'A.8 Contrôles technologiques',
    description: 'Application de standards cryptographiques robustes (TLS 1.3, AES-256) pour les données au repos et en transit.'
  },
  {
    code: 'A.8.25',
    title: 'Cycle de développement sécurisé (SSDLC)',
    domain: 'A.8 Contrôles technologiques',
    description: 'Intégration de la sécurité dès la conception des logiciels développés en interne.'
  },
  {
    code: 'A.8.26',
    title: 'Exigences de sécurité des applications',
    domain: 'A.8 Contrôles technologiques',
    description: 'Spécification systématique des besoins de sécurité lors de l’acquisition ou mise à jour logicielle.'
  },
  {
    code: 'A.8.27',
    title: 'Architecture des systèmes et principes d’ingénierie sécurisée',
    domain: 'A.8 Contrôles technologiques',
    description: 'Principes de sécurité par défaut (Security by Design, moindre privilège, défense en profondeur).'
  },
  {
    code: 'A.8.28',
    title: 'Codage sécurisé (Secure coding)',
    domain: 'A.8 Contrôles technologiques',
    description: 'Application des recommandations OWASP pour éviter les failles (injections SQL, XSS).'
  },
  {
    code: 'A.8.29',
    title: 'Tests de sécurité lors du développement et de l’acceptation',
    domain: 'A.8 Contrôles technologiques',
    description: 'Tests de pénétration et revues de sécurité avant mise en production de tout nouveau service.'
  },
  {
    code: 'A.8.30',
    title: 'Développement externalisé',
    domain: 'A.8 Contrôles technologiques',
    description: 'Supervision et audit du code développé par des agences ou prestataires tiers.'
  },
  {
    code: 'A.8.31',
    title: 'Séparation des environnements de développement, de test et d’exploitation',
    domain: 'A.8 Contrôles technologiques',
    description: 'Cloisonnement hermétique entre environnement de dev/recette et serveur de production.'
  },
  {
    code: 'A.8.32',
    title: 'Gestion des changements',
    domain: 'A.8 Contrôles technologiques',
    description: 'Procédure formelle de validation et de documentation de toute modification sur les systèmes critiques.'
  },
  {
    code: 'A.8.33',
    title: 'Informations de test',
    domain: 'A.8 Contrôles technologiques',
    description: 'Utilisation de jeux de données anonymisés ou synthétiques lors des tests logiciels.'
  },
  {
    code: 'A.8.34',
    title: 'Protection des systèmes d’information lors des audits',
    domain: 'A.8 Contrôles technologiques',
    description: 'Planification des tests d’audit pour éviter toute interruption ou dégradation de service.'
  }
];
