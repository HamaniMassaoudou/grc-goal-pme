import sys
from datetime import datetime, date
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import UserAccount, RoleDefinition, SecurityAuditLog, SecuritySettings
from apps.organizations.models import Organization
from apps.governance.models import Collaborator
from apps.assets.models import Asset
from apps.risks.models import Risk
from apps.actions.models import CorrectiveAction, ActionComment
from apps.notifications.models import AppNotification
from apps.testing.models import TestProtocolLog, UserTestSheet
from apps.soa.services import generate_soa_for_organization


class Command(BaseCommand):
    help = 'Charge l\'intégralité des données de démonstration officielles de GRC-Goal-PME (ISO 27001)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== Démarrage du chargement des données de démonstration GRC-Goal-PME ==='))

        # 1. Rôles RBAC
        self.load_roles()

        # 2. Organisation de démonstration
        org = self.load_organization()

        # 3. Comptes Utilisateurs
        users_map = self.load_users(org)

        # 4. Collaborateurs
        self.load_collaborators(org, users_map)

        # 5. Actifs du SI
        assets_map = self.load_assets(org)

        # 6. Registre des Risques
        self.load_risks(org, assets_map)

        # 7. Plan d'Actions Correctives
        self.load_actions(org)

        # 8. Catalogue complet des 93 contrôles SoA ISO 27001:2022
        self.load_soa_controls(org)

        # 9. Protocole de Test et Fiches d'évaluation officielles
        self.load_testing_data(org)

        # 10. Notifications système & métier
        self.load_notifications()

        # 11. Journaux d'audit de sécurité
        self.load_audit_logs()

        # 12. Paramètres de sécurité
        self.load_security_settings()

        self.stdout.write(self.style.SUCCESS('=== Toutes les données de démonstration ont été chargées avec succès dans SQLite ! ==='))

    def load_roles(self):
        self.stdout.write('Chargement des 6 rôles RBAC...')
        roles_data = [
            {
                'id': 'role-super-admin',
                'code': 'SUPER_ADMIN',
                'name': 'Super Administrateur GRC',
                'description': 'Administration globale du système, configuration de la plateforme, gestion intégrale des utilisateurs, des rôles et des journaux d\'audit.',
                'is_system': True,
                'is_active': True,
                'color': 'bg-indigo-600',
                'permissions': {
                    'dashboard': ['view', 'export'],
                    'risks': ['view', 'create', 'update', 'delete', 'approve', 'export', 'manage'],
                    'soa': ['view', 'update', 'approve', 'export', 'manage'],
                    'actions': ['view', 'create', 'update', 'delete', 'approve', 'export', 'manage'],
                    'assets': ['view', 'create', 'update', 'delete', 'export', 'manage'],
                    'governance': ['view', 'update', 'manage'],
                    'users': ['view', 'create', 'update', 'delete', 'export', 'manage'],
                    'roles': ['view', 'create', 'update', 'delete', 'manage'],
                    'audit_logs': ['view', 'export', 'manage'],
                    'test_protocol': ['view', 'create', 'update', 'manage'],
                    'notifications': ['view', 'manage']
                }
            },
            {
                'id': 'role-org-admin',
                'code': 'ORG_ADMIN',
                'name': 'Administrateur Organisation (PME)',
                'description': 'Gestion opérationnelle de la PME : administration des comptes utilisateurs locaux, validation des plans d\'actions et pilotage de la conformité.',
                'is_system': True,
                'is_active': True,
                'color': 'bg-blue-600',
                'permissions': {
                    'dashboard': ['view', 'export'],
                    'risks': ['view', 'create', 'update', 'delete', 'approve', 'export'],
                    'soa': ['view', 'update', 'approve', 'export'],
                    'actions': ['view', 'create', 'update', 'delete', 'approve', 'export'],
                    'assets': ['view', 'create', 'update', 'delete', 'export'],
                    'governance': ['view', 'update'],
                    'users': ['view', 'create', 'update', 'export'],
                    'roles': ['view'],
                    'audit_logs': ['view', 'export'],
                    'test_protocol': ['view', 'create', 'update'],
                    'notifications': ['view', 'manage']
                }
            },
            {
                'id': 'role-rssi',
                'code': 'RSSI',
                'name': 'Responsable Sécurité / Référent GRC',
                'description': 'Expertise cybersécurité, évaluation des risques, déclaration d\'applicabilité SoA ISO 27001 et pilotage technique des remédiations.',
                'is_system': True,
                'is_active': True,
                'color': 'bg-emerald-600',
                'permissions': {
                    'dashboard': ['view', 'export'],
                    'risks': ['view', 'create', 'update', 'delete', 'approve', 'export'],
                    'soa': ['view', 'update', 'approve', 'export'],
                    'actions': ['view', 'create', 'update', 'delete', 'approve', 'export'],
                    'assets': ['view', 'create', 'update', 'delete', 'export'],
                    'governance': ['view', 'update'],
                    'users': ['view'],
                    'roles': ['view'],
                    'audit_logs': ['view', 'export'],
                    'test_protocol': ['view', 'create', 'update'],
                    'notifications': ['view', 'manage']
                }
            },
            {
                'id': 'role-risk-owner',
                'code': 'RISK_OWNER',
                'name': 'Responsable Métier / Propriétaire de Risque',
                'description': 'Propriétaire des actifs et des processus métier : qualification des menaces, propositions de réduction et exécution des actions.',
                'is_system': True,
                'is_active': True,
                'color': 'bg-amber-600',
                'permissions': {
                    'dashboard': ['view'],
                    'risks': ['view', 'create', 'update'],
                    'soa': ['view'],
                    'actions': ['view', 'create', 'update'],
                    'assets': ['view', 'create', 'update'],
                    'governance': ['view'],
                    'users': [],
                    'roles': [],
                    'audit_logs': [],
                    'test_protocol': ['view'],
                    'notifications': ['view']
                }
            },
            {
                'id': 'role-auditor',
                'code': 'AUDITOR',
                'name': 'Auditeur / Évaluateur Externe',
                'description': 'Consultation indépendante (lecture seule) des risques, de la SoA, des preuves documentaires, des actions et des journaux d\'audit.',
                'is_system': True,
                'is_active': True,
                'color': 'bg-purple-600',
                'permissions': {
                    'dashboard': ['view', 'export'],
                    'risks': ['view', 'export'],
                    'soa': ['view', 'export'],
                    'actions': ['view', 'export'],
                    'assets': ['view', 'export'],
                    'governance': ['view'],
                    'users': ['view'],
                    'roles': ['view'],
                    'audit_logs': ['view', 'export'],
                    'test_protocol': ['view', 'export'],
                    'notifications': ['view']
                }
            },
            {
                'id': 'role-viewer',
                'code': 'VIEWER',
                'name': 'Lecteur / Collaborateur Général',
                'description': 'Accès en lecture simple au tableau de bord, aux indicateurs clés et à la liste des actions qui lui sont assignées.',
                'is_system': True,
                'is_active': True,
                'color': 'bg-slate-600',
                'permissions': {
                    'dashboard': ['view'],
                    'risks': ['view'],
                    'soa': ['view'],
                    'actions': ['view'],
                    'assets': ['view'],
                    'governance': ['view'],
                    'users': [],
                    'roles': [],
                    'audit_logs': [],
                    'test_protocol': ['view'],
                    'notifications': ['view']
                }
            }
        ]

        for r_data in roles_data:
            RoleDefinition.objects.update_or_create(
                id=r_data['id'],
                defaults=r_data
            )
        self.stdout.write(self.style.SUCCESS('6 rôles RBAC initialisés.'))

    def load_organization(self):
        self.stdout.write('Chargement de l\'organisation démo Sirba Communication...')
        org, _ = Organization.objects.update_or_create(
            id='org-pme-demo',
            defaults={
                'slug': 'pme-demo',
                'name': 'PME Démonstration (Sirba Communication SARL)',
                'legal_name': 'Sirba Communication SARL',
                'sector': 'Services numériques, Communication & Conseil',
                'size': '15 collaborateurs (TPE/PME)',
                'address': 'Quartier Plateau, Boulevard de la République, Niamey, Niger',
                'phone': '+227 20 73 00 00',
                'contact_name': 'Abdoul Salam Issifi (Gérant)',
                'contact_email': 'direction@sirbacom.ne',
                'security_officer': 'Hamani Massaoudou (Référent GRC)',
                'description': 'Société de services numériques et conseil en communication, basée à Niamey. SI composé d’un parc de 15 postes, d’un serveur d’applications métier et d’une base de données clients critique.',
                'grc_scope': 'Système d’information global, postes de travail des 15 collaborateurs, messagerie professionnelle, base de données clients et processus de facturation.',
                'status': 'active',
                'is_demo': True,
                'creator_user_id': 'user-hamani',
                'created_at': date(2026, 10, 10)
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Organisation démo prête : {org.name}'))
        return org

    def load_users(self, org):
        self.stdout.write('Chargement des 6 utilisateurs de démonstration...')
        users_data = [
            {
                'id': 'user-hamani',
                'first_name': 'Hamani',
                'last_name': 'Massaoudou',
                'name': 'Hamani Massaoudou',
                'email': 'massaoudhamani10@gmail.com',
                'phone': '+227 90 00 00 01',
                'job_title': 'Concepteur GRC-Goal & Développeur B14',
                'department': 'Sécurité de l’Information & GRC',
                'organization': org,
                'organization_ids': [org.id],
                'organization_name': 'PME Démonstration / APSI-NE',
                'role_ids': ['role-super-admin', 'role-rssi'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': False,
                'failed_login_attempts': 0,
                'avatar_color': 'bg-indigo-600',
                'is_staff': True,
                'is_superuser': True
            },
            {
                'id': 'user-issifi',
                'first_name': 'Abdoul Salam',
                'last_name': 'Issifi',
                'name': 'Abdoul Salam Issifi',
                'email': 'direction@sirbacom.ne',
                'phone': '+227 96 12 34 56',
                'job_title': 'Responsable de Sirba Communication (Testeur tiers B14)',
                'department': 'Direction Générale',
                'organization': org,
                'organization_ids': [org.id],
                'organization_name': 'Sirba Communication',
                'role_ids': ['role-org-admin', 'role-risk-owner'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': False,
                'failed_login_attempts': 0,
                'avatar_color': 'bg-orange-600',
                'is_staff': False,
                'is_superuser': False
            },
            {
                'id': 'user-mentor',
                'first_name': 'Aboubacar',
                'last_name': 'Yacouba Mai Birni',
                'name': 'Aboubacar Yacouba Mai Birni',
                'email': 'mentor.grc@apsi.ne',
                'phone': '+227 91 88 77 66',
                'job_title': 'Mentor Référent GRC — APSI-NE',
                'department': 'Comité Pédagogique d’Excellence',
                'organization': org,
                'organization_ids': [org.id],
                'organization_name': 'Programme Cybersécurité Niger',
                'role_ids': ['role-auditor'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': False,
                'failed_login_attempts': 0,
                'avatar_color': 'bg-purple-600',
                'is_staff': False,
                'is_superuser': False
            },
            {
                'id': 'user-diallo',
                'first_name': 'Aïchatou',
                'last_name': 'Diallo',
                'name': 'Aïchatou Diallo',
                'email': 'a.diallo@sirbacom.ne',
                'phone': '+227 88 44 22 11',
                'job_title': 'Responsable Pôle Clients & Facturation',
                'department': 'Relation Client & Support',
                'organization': org,
                'organization_ids': [org.id],
                'organization_name': 'Sirba Communication',
                'role_ids': ['role-risk-owner'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': False,
                'failed_login_attempts': 0,
                'avatar_color': 'bg-emerald-600',
                'is_staff': False,
                'is_superuser': False
            },
            {
                'id': 'user-moussa',
                'first_name': 'Ibrahim',
                'last_name': 'Moussa',
                'name': 'Ibrahim Moussa',
                'email': 'i.moussa@sirbacom.ne',
                'phone': '+227 92 11 33 55',
                'job_title': 'Graphiste & Chargé de Projets Web',
                'department': 'Production & Création Digitale',
                'organization': org,
                'organization_ids': [org.id],
                'organization_name': 'Sirba Communication',
                'role_ids': ['role-viewer'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': False,
                'failed_login_attempts': 0,
                'avatar_color': 'bg-sky-600',
                'is_staff': False,
                'is_superuser': False
            },
            {
                'id': 'user-suspendu',
                'first_name': 'Compte',
                'last_name': 'Suspendu Test',
                'name': 'Compte Suspendu Test',
                'email': 'suspendu@demo.ne',
                'phone': '+227 99 99 99 99',
                'job_title': 'Ancien Collaborateur (Exemple de sécurité)',
                'department': 'Opérations Passées',
                'organization': org,
                'organization_ids': [org.id],
                'organization_name': 'Sirba Communication',
                'role_ids': ['role-viewer'],
                'status': 'suspendu',
                'must_change_password': False,
                'mfa_enabled': False,
                'failed_login_attempts': 3,
                'avatar_color': 'bg-rose-600',
                'is_staff': False,
                'is_superuser': False
            }
        ]

        users_map = {}
        for u_data in users_data:
            user, created = UserAccount.objects.get_or_create(
                id=u_data['id'],
                defaults={**u_data}
            )
            # Réinitialiser les champs et forcer le mot de passe PmeSecure2026!
            for k, v in u_data.items():
                setattr(user, k, v)
            user.set_password('PmeSecure2026!')
            user.save()
            users_map[user.id] = user

        self.stdout.write(self.style.SUCCESS(f'{len(users_map)} comptes utilisateurs initialisés avec le mot de passe "PmeSecure2026!".'))
        return users_map

    def load_collaborators(self, org, users_map):
        self.stdout.write('Chargement des 6 collaborateurs...')
        collabs_data = [
            {
                'id': 'collab-01',
                'organization': org,
                'user': users_map.get('user-hamani'),
                'full_name': 'Hamani Massaoudou',
                'email': 'massaoudhamani10@gmail.com',
                'phone': '+227 90 00 00 01',
                'department': 'Sécurité & GRC',
                'job_title': 'Concepteur GRC-Goal & Référent Sécurité',
                'role_id': 'role-super-admin',
                'grc_responsibilities': 'Supervision globale de la sécurité, modélisation des risques, déclarations SoA et pilotage du projet B14.',
                'is_platform_user': True,
                'invitation_status': 'actif',
                'joined_at': date(2026, 10, 10)
            },
            {
                'id': 'collab-02',
                'organization': org,
                'user': users_map.get('user-issifi'),
                'full_name': 'Abdoul Salam Issifi',
                'email': 'direction@sirbacom.ne',
                'phone': '+227 96 12 34 56',
                'department': 'Direction Générale',
                'job_title': 'Directeur Général & Gérant',
                'role_id': 'role-org-admin',
                'grc_responsibilities': 'Arbitrage budgétaire, validation des plans de traitement des risques et responsable officiel de la conformité PME.',
                'is_platform_user': True,
                'invitation_status': 'actif',
                'joined_at': date(2026, 10, 12)
            },
            {
                'id': 'collab-03',
                'organization': org,
                'user': users_map.get('user-diallo'),
                'full_name': 'Aïchatou Diallo',
                'email': 'a.diallo@sirbacom.ne',
                'phone': '+227 88 44 22 11',
                'department': 'Relation Client & Support',
                'job_title': 'Responsable Pôle Clients & Facturation',
                'role_id': 'role-risk-owner',
                'grc_responsibilities': 'Propriétaire métier de l’actif « Base de données clients », qualification des impacts métier et suivi des contrôles d’accès.',
                'is_platform_user': True,
                'invitation_status': 'actif',
                'joined_at': date(2026, 10, 14)
            },
            {
                'id': 'collab-04',
                'organization': org,
                'user': users_map.get('user-moussa'),
                'full_name': 'Ibrahim Moussa',
                'email': 'i.moussa@sirbacom.ne',
                'phone': '+227 92 11 33 55',
                'department': 'Production & Création Digitale',
                'job_title': 'Graphiste & Chargé de Projets Web',
                'role_id': 'role-viewer',
                'grc_responsibilities': 'Application des bonnes pratiques de sécurité des postes de travail et signalement des courriels frauduleux.',
                'is_platform_user': True,
                'invitation_status': 'actif',
                'joined_at': date(2026, 10, 16)
            },
            {
                'id': 'collab-05',
                'organization': org,
                'user': None,
                'full_name': 'Ousmane Boureima',
                'email': 'comptabilite@sirbacom.ne',
                'phone': '+227 94 55 66 77',
                'department': 'Finance & Comptabilité',
                'job_title': 'Responsable Administratif et Financier',
                'role_id': 'role-risk-owner',
                'grc_responsibilities': 'Gestion des risques liés aux transactions financières, paiements fournisseurs et conformité fiscale.',
                'is_platform_user': False,
                'invitation_status': 'invite',
                'invited_at': date(2026, 10, 24)
            },
            {
                'id': 'collab-06',
                'organization': org,
                'user': None,
                'full_name': 'Mme Fatouma Saley',
                'email': 'secretariat@sirbacom.ne',
                'phone': '+227 97 22 88 44',
                'department': 'Accueil & Administration',
                'job_title': 'Assistante de Direction',
                'role_id': 'role-viewer',
                'grc_responsibilities': 'Contrôle d’accès physique à l’accueil, tenue du registre des visiteurs et gestion du courrier sensible.',
                'is_platform_user': False,
                'invitation_status': 'invite',
                'invited_at': date(2026, 10, 26)
            }
        ]

        for c_data in collabs_data:
            Collaborator.objects.update_or_create(
                id=c_data['id'],
                defaults=c_data
            )
        self.stdout.write(self.style.SUCCESS('6 collaborateurs initialisés.'))

    def load_assets(self, org):
        self.stdout.write('Chargement des 6 actifs du SI...')
        assets_data = [
            {
                'id': 'ast-01',
                'name': 'Base de données clients & prospects (PostgreSQL)',
                'category': 'database',
                'description': 'Contient les coordonnées, l’historique commercial, devis et coordonnées bancaires de 350 entreprises clientes au Niger et dans la sous-région.',
                'owner': 'Aïchatou Diallo',
                'criticality': 'Critique',
                'location': 'Serveur interne sécurisé Sirba HQ & Réplica Cloud',
                'organization': org,
                'created_at': date(2026, 10, 12)
            },
            {
                'id': 'ast-02',
                'name': 'Serveur de messagerie et suite collaborative (Google Workspace)',
                'category': 'service',
                'description': 'Canal principal des communications contractuelles, échanges de documents confidentiels et devis clients.',
                'owner': 'Hamani Massaoudou',
                'criticality': 'Élevée',
                'location': 'SaaS Cloud sécurisé (EU/Global)',
                'organization': org,
                'created_at': date(2026, 10, 13)
            },
            {
                'id': 'ast-03',
                'name': 'Application web vitrine & portail devis (sirbacom.ne)',
                'category': 'application',
                'description': 'Plateforme publique de présentation des services, réception des demandes de prestations et vitrine commerciale de l’entreprise.',
                'owner': 'Ibrahim Moussa',
                'criticality': 'Élevée',
                'location': 'Hébergeur Cloud infogéré (OVH/AWS)',
                'organization': org,
                'created_at': date(2026, 10, 14)
            },
            {
                'id': 'ast-04',
                'name': 'Parc de 15 ordinateurs portables collaborateurs (Windows 11)',
                'category': 'hardware',
                'description': 'Postes de travail utilisés au bureau et en déplacement par les consultants, équipes commerciales et la direction.',
                'owner': 'Hamani Massaoudou',
                'criticality': 'Moyenne',
                'location': 'Bureaux Niamey et usage nomade télétravail',
                'organization': org,
                'created_at': date(2026, 10, 15)
            },
            {
                'id': 'ast-05',
                'name': 'Dossiers financiers, facturation et paie (Logiciel SAGE)',
                'category': 'application',
                'description': 'Données comptables, bilans certifiés, contrats de travail et éléments de paie des collaborateurs.',
                'owner': 'Abdoul Salam Issifi',
                'criticality': 'Élevée',
                'location': 'Poste comptable dédié & Sauvegarde sur NAS local',
                'organization': org,
                'created_at': date(2026, 10, 15)
            },
            {
                'id': 'ast-06',
                'name': 'Système de vidéosurveillance et contrôle d’accès physique',
                'category': 'hardware',
                'description': '4 caméras IP et centrale d’enregistrement couvrant l’entrée principale, le couloir et la salle serveur.',
                'owner': 'Abdoul Salam Issifi',
                'criticality': 'Moyenne',
                'location': 'Locaux Sirba Communication (Plateau, Niamey)',
                'organization': org,
                'created_at': date(2026, 10, 16)
            }
        ]

        assets_map = {}
        for a_data in assets_data:
            asset, _ = Asset.objects.update_or_create(
                id=a_data['id'],
                defaults=a_data
            )
            assets_map[asset.id] = asset

        self.stdout.write(self.style.SUCCESS('6 actifs du SI initialisés.'))
        return assets_map

    def load_risks(self, org, assets_map):
        self.stdout.write('Chargement des 6 risques de sécurité...')
        risks_data = [
            {
                'id': 'rsk-01',
                'code': 'RSK-01',
                'title': 'Accès non autorisé à la base de données clients via identifiants dérobés',
                'description': 'Compromission des identifiants d’administration par ingénierie sociale ou mot de passe réutilisé, entraînant une exfiltration massive de données clients.',
                'asset': assets_map['ast-01'],
                'threat': 'Cybercriminel ou concurrent malveillant',
                'vulnerability': 'Absence temporaire de MFA sur la console d’administration de secours',
                'owner': 'Aïchatou Diallo',
                'probability': 4,
                'impact': 5,
                'score': 20,
                'level': 'Critique',
                'strategy': 'réduire',
                'treatment_notes': 'Déploiement obligatoire de la double authentification (TOTP) sur tous les comptes à privilèges, restriction par liste blanche IP et rotation des mots de passe d’accès DB.',
                'residual_probability': 2,
                'residual_impact': 2,
                'residual_score': 4,
                'residual_level': 'Moyen',
                'status': 'ouvert',
                'organization': org,
                'created_at': date(2026, 10, 15)
            },
            {
                'id': 'rsk-02',
                'code': 'RSK-02',
                'title': 'Infection par un rançongiciel (Ransomware) via une pièce jointe de phishing',
                'description': 'Un collaborateur ouvre une fausse facture reçue par courriel, déclenchant le chiffrement des partages réseau et des postes de travail.',
                'asset': assets_map['ast-04'],
                'threat': 'Groupes de cyberextorsion (Phishing ciblé)',
                'vulnerability': 'Sensibilisation hétérogène des 15 collaborateurs aux arnaques numériques',
                'owner': 'Hamani Massaoudou',
                'probability': 4,
                'impact': 4,
                'score': 16,
                'level': 'Critique',
                'strategy': 'réduire',
                'treatment_notes': 'Organisation d’un atelier de sensibilisation pratique au phishing pour toute l’équipe, filtrage anti-spam renforcé et sauvegardes hors-ligne immuables.',
                'residual_probability': 2,
                'residual_impact': 2,
                'residual_score': 4,
                'residual_level': 'Moyen',
                'status': 'ouvert',
                'organization': org,
                'created_at': date(2026, 10, 16)
            },
            {
                'id': 'rsk-03',
                'code': 'RSK-03',
                'title': 'Coupure électrique prolongée et défaillance de l’onduleur salle serveur',
                'description': 'Délestage du réseau urbain supérieur à 4 heures excédant l’autonomie des batteries de l’onduleur, provoquant l’arrêt brutal du serveur.',
                'asset': assets_map['ast-01'],
                'threat': 'Instabilité du réseau électrique / Tempête',
                'vulnerability': 'Batteries d’onduleur vieillissantes non testées depuis 12 mois',
                'owner': 'Abdoul Salam Issifi',
                'probability': 3,
                'impact': 3,
                'score': 9,
                'level': 'Élevé',
                'strategy': 'réduire',
                'treatment_notes': 'Remplacement préventif du pack batterie de l’onduleur et mise en place d’un groupe électrogène de relais partagé avec l’immeuble.',
                'residual_probability': 1,
                'residual_impact': 2,
                'residual_score': 2,
                'residual_level': 'Faible',
                'status': 'sous_contrôle',
                'organization': org,
                'created_at': date(2026, 10, 16)
            },
            {
                'id': 'rsk-04',
                'code': 'RSK-04',
                'title': 'Échec de restauration des données comptables lors d’un crash disque',
                'description': 'Découverte tardive que les fichiers de sauvegarde journaliers sont corrompus ou incomplets au moment où une restauration d’urgence est requise.',
                'asset': assets_map['ast-05'],
                'threat': 'Panne matérielle soudaine du disque dur principal',
                'vulnerability': 'Absence de test périodique formalisé de restauration à blanc',
                'owner': 'Hamani Massaoudou',
                'probability': 2,
                'impact': 5,
                'score': 10,
                'level': 'Élevé',
                'strategy': 'réduire',
                'treatment_notes': 'Mise en place d’un protocole trimestriel obligatoire de restauration à blanc avec procès-verbal horodaté (PV de test).',
                'residual_probability': 1,
                'residual_impact': 2,
                'residual_score': 2,
                'residual_level': 'Faible',
                'status': 'clôturé',
                'organization': org,
                'created_at': date(2026, 10, 17)
            },
            {
                'id': 'rsk-05',
                'code': 'RSK-05',
                'title': 'Divulgation fortuite de documents confidentiels par perte d’un ordinateur portable',
                'description': 'Oubli ou vol d’un ordinateur de consultant dans un taxi ou lieu public, sans chiffrement complet du disque.',
                'asset': assets_map['ast-04'],
                'threat': 'Vol d’opportunité ou perte accidentelle',
                'vulnerability': 'Disques durs des portables non chiffrés par BitLocker',
                'owner': 'Hamani Massaoudou',
                'probability': 2,
                'impact': 3,
                'score': 6,
                'level': 'Moyen',
                'strategy': 'réduire',
                'treatment_notes': 'Activation généralisée de BitLocker TPM sur les 15 portables et formalisation de la charte informatique d’usage nomade.',
                'residual_probability': 1,
                'residual_impact': 1,
                'residual_score': 1,
                'residual_level': 'Faible',
                'status': 'sous_contrôle',
                'organization': org,
                'created_at': date(2026, 10, 17)
            },
            {
                'id': 'rsk-06',
                'code': 'RSK-06',
                'title': 'Ralentissement temporaire du site vitrine lors d’un pic de consultations',
                'description': 'Accès momentanément dégradé sans impact sur les données ni les transactions financières.',
                'asset': assets_map['ast-03'],
                'threat': 'Afflux soudain de visiteurs',
                'vulnerability': 'Formule d’hébergement mutualisée basique',
                'owner': 'Ibrahim Moussa',
                'probability': 2,
                'impact': 1,
                'score': 2,
                'level': 'Faible',
                'strategy': 'accepter',
                'treatment_notes': 'Risque jugé acceptable au vu du faible impact commercial direct.',
                'residual_probability': 2,
                'residual_impact': 1,
                'residual_score': 2,
                'residual_level': 'Faible',
                'status': 'clôturé',
                'organization': org,
                'created_at': date(2026, 10, 18)
            }
        ]

        for r_data in risks_data:
            Risk.objects.update_or_create(
                id=r_data['id'],
                defaults=r_data
            )
        self.stdout.write(self.style.SUCCESS('6 risques de sécurité initialisés.'))

    def load_actions(self, org):
        self.stdout.write('Chargement des 5 actions correctives...')
        actions_data = [
            {
                'id': 'act-01',
                'code': 'ACT-01',
                'title': 'Activer l’authentification multifacteur (MFA) sur la console et base clients',
                'description': 'Configurer l’obligation de double facteur (TOTP via Google Authenticator / Microsoft Authenticator) pour tous les comptes administrateurs.',
                'source': 'risque',
                'linked_risk_id': 'rsk-01',
                'linked_control_code': 'A.8.5',
                'owner': 'Abdoul Salam Issifi',
                'priority': 'Critique',
                'due_date': date(2026, 11, 5),
                'status': 'en_cours',
                'evidence_of_closure': '',
                'organization': org,
                'created_at': date(2026, 10, 18),
                'comments': [
                    {
                        'id': 'c-1',
                        'author': 'Abdoul Salam Issifi',
                        'date': date(2026, 10, 20),
                        'text': 'Configuration effectuée sur le compte principal. Reste à tester sur les 2 accès de secours.'
                    }
                ]
            },
            {
                'id': 'act-02',
                'code': 'ACT-02',
                'title': 'Organiser une session de sensibilisation au phishing pour les 15 collaborateurs',
                'description': 'Animation d’un atelier pratique de 45 minutes sur la détection des faux courriels, pièces jointes suspectes et fraudes au virement.',
                'source': 'risque',
                'linked_risk_id': 'rsk-02',
                'linked_control_code': 'A.6.3',
                'owner': 'Hamani Massaoudou',
                'priority': 'Haute',
                'due_date': date(2026, 10, 24),
                'status': 'en_retard',
                'evidence_of_closure': '',
                'organization': org,
                'created_at': date(2026, 10, 16),
                'comments': [
                    {
                        'id': 'c-2',
                        'author': 'Hamani Massaoudou',
                        'date': date(2026, 10, 25),
                        'text': 'Support de présentation finalisé. Reportée de 3 jours pour synchronisation avec les déplacements de l’équipe.'
                    }
                ]
            },
            {
                'id': 'act-03',
                'code': 'ACT-03',
                'title': 'Tester la restauration à blanc de la sauvegarde comptable',
                'description': 'Valider la procédure de restauration sur une machine de test isolée pour vérifier l’intégrité des tables et le temps de reprise (RTO).',
                'source': 'soa_ecart',
                'linked_risk_id': 'rsk-04',
                'linked_control_code': 'A.8.13',
                'owner': 'Hamani Massaoudou',
                'priority': 'Haute',
                'due_date': date(2026, 10, 18),
                'status': 'cloturee',
                'evidence_of_closure': 'Procès-verbal de test PV-RESTORE-2026-10-18.pdf : restauration intégrale réussie en 28 minutes, intégrité vérifiée à 100%.',
                'organization': org,
                'created_at': date(2026, 10, 14),
                'closed_at': date(2026, 10, 18),
                'comments': [
                    {
                        'id': 'c-3',
                        'author': 'Hamani Massaoudou',
                        'date': date(2026, 10, 18),
                        'text': 'Test validé avec succès sans anomalie.'
                    }
                ]
            },
            {
                'id': 'act-04',
                'code': 'ACT-04',
                'title': 'Remplacer le pack de batteries de l’onduleur serveur',
                'description': 'Commande et remplacement physique des 4 batteries au plomb de l’onduleur salle serveur pour garantir 45 min d’autonomie.',
                'source': 'risque',
                'linked_risk_id': 'rsk-03',
                'linked_control_code': 'A.7.11',
                'owner': 'Équipe Infrastructure',
                'priority': 'Moyenne',
                'due_date': date(2026, 11, 12),
                'status': 'a_faire',
                'evidence_of_closure': '',
                'organization': org,
                'created_at': date(2026, 10, 21),
                'comments': []
            },
            {
                'id': 'act-05',
                'code': 'ACT-05',
                'title': 'Formaliser et faire signer la charte informatique d’usage acceptable',
                'description': 'Diffusion de la charte informatique rappelant l’interdiction d’installer des logiciels non autorisés et l’usage des clés USB personnelles.',
                'source': 'soa_ecart',
                'linked_risk_id': 'rsk-05',
                'linked_control_code': 'A.5.10',
                'owner': 'Direction Générale',
                'priority': 'Moyenne',
                'due_date': date(2026, 11, 20),
                'status': 'a_faire',
                'evidence_of_closure': '',
                'organization': org,
                'created_at': date(2026, 10, 22),
                'comments': []
            }
        ]

        for a_data in actions_data:
            comments = a_data.pop('comments', [])
            comments_json = [
                {
                    'id': c['id'],
                    'author': c['author'],
                    'date': str(c['date']),
                    'text': c['text']
                }
                for c in comments
            ]
            a_data['comments'] = comments_json
            action, _ = CorrectiveAction.objects.update_or_create(
                id=a_data['id'],
                defaults=a_data
            )
            for c in comments:
                ActionComment.objects.update_or_create(
                    id=c['id'],
                    defaults={
                        'author': c['author'],
                        'date': c['date'],
                        'text': c['text']
                    }
                )

        self.stdout.write(self.style.SUCCESS('5 actions correctives initialisées.'))

    def load_soa_controls(self, org):
        self.stdout.write('Chargement des 93 contrôles SoA ISO 27001:2022...')
        controls = generate_soa_for_organization(org, is_demo=True)
        self.stdout.write(self.style.SUCCESS(f'{len(controls)} contrôles SoA ISO 27001 générés et liés aux actions.'))

    def load_testing_data(self, org):
        self.stdout.write('Chargement du protocole et des fiches d\'évaluation B14...')
        # Protocole de test
        TestProtocolLog.objects.update_or_create(
            id='test-run-01',
            defaults={
                'date': date(2026, 10, 26),
                'tester_name': 'Abdoul Salam Issifi',
                'tester_role': 'Responsable de Sirba Communication',
                'organization_name': 'Sirba Communication / PME Démonstration',
                'duration_minutes': 25,
                'scenarios_completed': [
                    'Création et paramétrage du périmètre de l’organisation PME Démonstration',
                    'Enregistrement de l’actif « Base de données clients »',
                    'Création du risque « Accès non autorisé à la base de données clients » (P:4 x I:5 = 20 Critique)',
                    'Association de l’action corrective « Activer l’authentification multifacteur (MFA) »',
                    'Mise à jour de la mesure SoA A.8.5 avec justification, preuve et écart',
                    'Consultation du tableau de bord et vérification des indicateurs calculés'
                ],
                'feedback_notes': 'Interface très claire et compréhensible pour une PME sans service informatique dédié. Le calcul immédiat du score et la liaison directe avec les actions facilitent grandement la prise de décision.',
                'perceived_utility': 'Excellent',
                'signed_by_tester': True
            }
        )

        tasks_default = [
            {
                'taskId': 'T1',
                'num': 1,
                'taskTitle': 'Créer une organisation et consulter le tableau de bord initial',
                'targetRequirement': 'EF-01 / EF-08',
                'expectedResult': 'L’espace « PME Démonstration » est créé ; les indicateurs globaux s\'affichent sans blocage.',
                'successCriteria': 'Création sans erreur, indicateurs initialisés, tableau de bord compréhensible pour le dirigeant.',
                'status': 'valide',
                'executionTimeMinutes': 3,
                'observations': 'Prise en main immédiate. L’indicateur de maturité et le niveau de risque global sont très parlants.'
            },
            {
                'taskId': 'T2',
                'num': 2,
                'taskTitle': 'Recenser un actif critique et documenter sa cartographie',
                'targetRequirement': 'EF-02',
                'expectedResult': 'L\'actif « Base de données clients » est enregistré avec sa catégorie et criticité « Critique ».',
                'successCriteria': 'Actif présent dans l\'inventaire, propriétaire et localisation correctement enregistrés.',
                'status': 'valide',
                'executionTimeMinutes': 4,
                'observations': 'Les catégories prédéfinies correspondent exactement aux besoins d\'une PME de services.'
            },
            {
                'taskId': 'T3',
                'num': 3,
                'taskTitle': 'Évaluer un risque brut et calculer la matrice 5x5',
                'targetRequirement': 'EF-03 / EF-04',
                'expectedResult': 'Saisie probabilité 4 et impact 5 -> Score 20, niveau « Critique » selon le seuil B14 (§7).',
                'successCriteria': 'Calcul automatique exact, placement visuel sur la matrice 5x5 et proposition de traitement.',
                'status': 'valide',
                'executionTimeMinutes': 5,
                'observations': 'L\'ajustement par curseurs et le code couleur instantané rendent l\'évaluation intuitive.'
            },
            {
                'taskId': 'T4',
                'num': 4,
                'taskTitle': 'Déclarer l\'applicabilité d\'une mesure SoA ISO 27001:2022 et motiver l\'écart',
                'targetRequirement': 'EF-06 / EF-07',
                'expectedResult': 'Mesure A.8.5 déclarée applicable ; statut, justification, preuve et écart documentés.',
                'successCriteria': 'Mise à jour en temps réel des statistiques SoA et lien d\'action corrective proposé.',
                'status': 'valide',
                'executionTimeMinutes': 5,
                'observations': 'Le texte vulgarisé en français aide beaucoup. Les exemples de justifications évitent de bloquer.'
            },
            {
                'taskId': 'T5',
                'num': 5,
                'taskTitle': 'Créer et assigner une action corrective liée au risque',
                'targetRequirement': 'EF-05',
                'expectedResult': 'Action avec responsable assigné, priorité, échéance et statut « ouverte ».',
                'successCriteria': 'Lien bidirectionnel risque-action conservé, suivi visible dans le kanban des actions.',
                'status': 'valide',
                'executionTimeMinutes': 4,
                'observations': 'Lien direct depuis la fiche risque vers l\'action corrective très apprécié.'
            },
            {
                'taskId': 'T6',
                'num': 6,
                'taskTitle': 'Générer le rapport consolidé et signer la fiche d\'évaluation',
                'targetRequirement': 'EF-08 / Annexe C',
                'expectedResult': 'Export PDF officiel disponible, synthèse globale horodatée et accord formel signé.',
                'successCriteria': 'Génération sans erreur, mise en page A4 officielle exploitable pour soutenance B14.',
                'status': 'valide',
                'executionTimeMinutes': 4,
                'observations': 'Export PDF propre et complet. Permet de présenter les résultats directement en comité de direction.'
            }
        ]

        UserTestSheet.objects.update_or_create(
            id='sheet-issifi-01',
            defaults={
                'code': 'FT-2026-001',
                'user_id': 'user-issifi',
                'tester_name': 'Abdoul Salam Issifi',
                'tester_email': 'direction@sirbacom.ne',
                'tester_role': 'Directeur Général & Gérant',
                'organization_name': 'Sirba Communication (PME Niamey)',
                'session_title': 'Évaluation officielle B14 — Testeur tiers externe (Livrable 1 §4)',
                'date': date(2026, 10, 26),
                'duration_minutes': 25,
                'test_environment': 'Navigateur Google Chrome v122 / PC portable Windows 11 / Écran 1920x1080',
                'tasks': tasks_default,
                'global_score_percent': 100,
                'functionalities_understood': 'L’évaluation par curseurs Probabilité × Impact, le calcul instantané du score et le classement par couleur sur la matrice 5x5. La simplicité de création des actions correctives.',
                'difficulties_encountered': 'Le vocabulaire ISO 27001 peut paraître intimidant pour un non-initié sans les résumés vulgarisés intégrés. L’ajout de modèles de justifications a résolu ce point.',
                'suggestions': 'Conserver la clarté visuelle et proposer l\'export PDF individuel pour chaque fiche d\'évaluation.',
                'feedback_notes': 'Interface très claire et compréhensible pour une PME sans service informatique dédié. Le calcul immédiat du score et la liaison directe avec les actions facilitent grandement la prise de décision.',
                'perceived_utility': 'Indispensable',
                'recommendation_score': 10,
                'signed_by_tester': True,
                'signature_date': '2026-10-26',
                'mentor_or_evaluator_name': 'Aboubacar Yacouba Mai Birni (Mentor GRC)',
                'mentor_notes': 'Testeur tiers validé dans le cadre du projet B14 APSI-NE. Résultats cohérents avec le cahier des charges.',
                'mentor_validated': True
            }
        )

        UserTestSheet.objects.update_or_create(
            id='sheet-issifi-02',
            defaults={
                'code': 'FT-2026-002',
                'user_id': 'user-issifi',
                'tester_name': 'Abdoul Salam Issifi',
                'tester_email': 'direction@sirbacom.ne',
                'tester_role': 'Directeur Général & Gérant',
                'organization_name': 'Sirba Communication (PME Niamey)',
                'session_title': 'Test de validation post-correctifs — Contrôle d\'accès & Robustesse IAM',
                'date': date(2026, 10, 27),
                'duration_minutes': 18,
                'test_environment': 'Navigateur Firefox v124 / PC portable / AI Studio Web Preview',
                'tasks': tasks_default,
                'global_score_percent': 100,
                'functionalities_understood': 'Contrôle des rôles RBAC, cartographie des actifs et réévaluation résiduelle.',
                'difficulties_encountered': 'Aucune.',
                'suggestions': 'Maintenir la fluidité.',
                'feedback_notes': 'Validation complète.',
                'perceived_utility': 'Très utile',
                'recommendation_score': 10,
                'signed_by_tester': True,
                'signature_date': '2026-10-27',
                'mentor_or_evaluator_name': 'Aboubacar Yacouba Mai Birni',
                'mentor_notes': 'Validé sans réserve.',
                'mentor_validated': True
            }
        )
        self.stdout.write(self.style.SUCCESS('Protocole et 2 fiches de tests B14 initialisés.'))

    def load_notifications(self):
        self.stdout.write('Chargement des notifications...')
        notifs_data = [
            {
                'id': 'notif-hamani-1',
                'type': 'risk',
                'title': 'Alerte Risque Critique : RSK-01',
                'message': 'Le risque "Accès non autorisé à la base de données clients" est qualifié avec un score 20 (Probabilité 4 × Impact 5). Un plan de remédiation d\'urgence est attendu.',
                'resource_type': 'risks',
                'resource_id': 'rsk-01',
                'target_user_id': 'user-hamani',
                'is_read': False
            },
            {
                'id': 'notif-hamani-2',
                'type': 'action',
                'title': 'Échéance dépassée : ACT-01',
                'message': 'L\'action corrective "Déploiement MFA obligatoire sur la console d\'administration" est en retard par rapport à l\'échéance fixée au 2026-10-25.',
                'resource_type': 'actions',
                'resource_id': 'act-01',
                'target_user_id': 'user-hamani',
                'is_read': False
            },
            {
                'id': 'notif-hamani-3',
                'type': 'soa_gap',
                'title': 'Écart de conformité SoA : Mesure A.8.5',
                'message': 'La mesure A.8.5 (Authentification sécurisée) présente un écart constaté : l\'absence de double facteur sur les accès tiers et prestataires externes.',
                'resource_type': 'soa',
                'resource_id': 'A.8.5',
                'target_user_id': 'user-hamani',
                'is_read': False
            },
            {
                'id': 'notif-hamani-4',
                'type': 'security_alert',
                'title': 'Incident de sécurité IAM intercepté',
                'message': 'Tentative de connexion bloquée sur le compte suspendu (suspendu@demo.ne). L\'adresse IP source 197.214.22.99 a été consignée dans le journal d\'audit.',
                'resource_type': 'iam',
                'resource_id': 'user-suspendu',
                'target_user_id': 'user-hamani',
                'is_read': True
            },
            {
                'id': 'notif-hamani-5',
                'type': 'info',
                'title': 'Bienvenue sur la plateforme GRC-Goal',
                'message': 'Le système de pilotage GRC est opérationnel. Toutes vos permissions de Super Administrateur et RSSI sont actives.',
                'resource_type': 'dashboard',
                'resource_id': None,
                'target_user_id': 'user-hamani',
                'is_read': True
            },
            {
                'id': 'notif-issifi-1',
                'type': 'action',
                'title': 'Nouvelle action corrective assignée : ACT-02',
                'message': 'Vous avez été désigné responsable de l\'action "Mise en place de sauvegardes chiffrées automatiques journalières". Échéance : 2026-11-20.',
                'resource_type': 'actions',
                'resource_id': 'act-02',
                'target_user_id': 'user-issifi',
                'is_read': False
            }
        ]

        for n_data in notifs_data:
            AppNotification.objects.update_or_create(
                id=n_data['id'],
                defaults=n_data
            )
        self.stdout.write(self.style.SUCCESS(f'{len(notifs_data)} notifications initialisées.'))

    def load_audit_logs(self):
        self.stdout.write('Chargement des journaux d\'audit de sécurité...')
        logs_data = [
            {
                'id': 'log-01',
                'event_type': 'LOGIN_SUCCESS',
                'severity': 'info',
                'actor_id': 'user-hamani',
                'actor_name': 'Hamani Massaoudou',
                'actor_email': 'massaoudhamani10@gmail.com',
                'target_resource': 'authentification',
                'target_id': 'user-hamani',
                'details': 'Connexion réussie avec double authentification MFA TOTP validée.',
                'ip_address': '192.168.1.10 (Niamey, NE)'
            },
            {
                'id': 'log-02',
                'event_type': 'LOGIN_SUCCESS',
                'severity': 'info',
                'actor_id': 'user-issifi',
                'actor_name': 'Abdoul Salam Issifi',
                'actor_email': 'direction@sirbacom.ne',
                'target_resource': 'authentification',
                'target_id': 'user-issifi',
                'details': 'Ouverture de session administrateur organisation pour Sirba Communication.',
                'ip_address': '197.214.22.84 (Sirba HQ, Niamey)'
            },
            {
                'id': 'log-03',
                'event_type': 'LOGIN_FAILED',
                'severity': 'warning',
                'actor_id': 'system',
                'actor_name': 'Système GRC-Goal',
                'actor_email': 'security@grc-goal.local',
                'target_resource': 'authentification',
                'target_id': 'user-suspendu',
                'details': 'Tentative de connexion sur un compte suspendu (suspendu@demo.ne). Accès révoqué immédiatement.',
                'ip_address': '197.214.22.99'
            },
            {
                'id': 'log-04',
                'event_type': 'ORGANIZATION_CREATED',
                'severity': 'info',
                'actor_id': 'user-hamani',
                'actor_name': 'Hamani Massaoudou',
                'actor_email': 'massaoudhamani10@gmail.com',
                'target_resource': 'governance',
                'target_id': 'org-pme-demo',
                'details': 'Création et initialisation de l’espace PME Démonstration (Sirba Communication SARL) avec catalogue ISO 27001:2022.',
                'ip_address': '192.168.1.10'
            }
        ]

        for l_data in logs_data:
            SecurityAuditLog.objects.update_or_create(
                id=l_data['id'],
                defaults=l_data
            )
        self.stdout.write(self.style.SUCCESS(f'{len(logs_data)} journaux d\'audit initialisés.'))

    def load_security_settings(self):
        self.stdout.write('Chargement des paramètres de politique de sécurité...')
        SecuritySettings.objects.update_or_create(
            id=1,
            defaults={
                'password_min_length': 8,
                'password_require_uppercase': True,
                'password_require_numbers': True,
                'password_require_symbols': True,
                'max_failed_attempts': 5,
                'lockout_duration_minutes': 15,
                'session_timeout_minutes': 120,
                'mfa_mandatory_for_admins': True
            }
        )
        self.stdout.write(self.style.SUCCESS('Politique de sécurité initialisée.'))
