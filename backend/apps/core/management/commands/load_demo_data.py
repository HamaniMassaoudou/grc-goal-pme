import os
import sys
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from apps.users.models import UserAccount, RoleDefinition, SecurityAuditLog, SecuritySettings
from apps.organizations.models import Organization
from apps.governance.models import Collaborator
from apps.assets.models import Asset
from apps.risks.models import Risk
from apps.soa.models import SoAControl
from apps.actions.models import CorrectiveAction


class Command(BaseCommand):
    help = 'Load demo data from frontend TypeScript files into Django database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Loading demo data...'))
        
        # Load roles
        self.load_roles()
        
        # Load organization
        org = self.load_organization()
        
        # Load users
        self.load_users(org)
        
        # Load collaborators
        self.load_collaborators(org)
        
        # Load assets
        self.load_assets(org)
        
        # Load risks
        self.load_risks(org)
        
        # Load actions
        self.load_actions(org)
        
        # Load SoA controls
        self.load_soa_controls(org)
        
        # Load security settings
        self.load_security_settings()
        
        self.stdout.write(self.style.SUCCESS('Demo data loaded successfully!'))

    def load_roles(self):
        self.stdout.write('Loading roles...')
        
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
                'name': 'Lecteur / Collaborateur PME',
                'description': 'Consultation restreinte au tableau de bord général et aux actions de sensibilisation qui lui sont directement assignées.',
                'is_system': True,
                'is_active': True,
                'color': 'bg-slate-500',
                'permissions': {
                    'dashboard': ['view'],
                    'risks': ['view'],
                    'soa': [],
                    'actions': ['view'],
                    'assets': ['view'],
                    'governance': ['view'],
                    'users': [],
                    'roles': [],
                    'audit_logs': [],
                    'test_protocol': [],
                    'notifications': ['view']
                }
            }
        ]
        
        for role_data in roles_data:
            RoleDefinition.objects.get_or_create(
                id=role_data['id'],
                defaults=role_data
            )
        
        self.stdout.write(self.style.SUCCESS('Roles loaded successfully'))

    def load_organization(self):
        self.stdout.write('Loading organization...')
        
        org, created = Organization.objects.get_or_create(
            id='org-pme-demo',
            defaults={
                'slug': 'pme-demo',
                'name': 'PME Démonstration',
                'legal_name': 'Sirba Communication SARL',
                'sector': 'Services numériques, Communication & Conseil',
                'size': '15 collaborateurs (TPE/PME)',
                'address': 'Niamey, Niger',
                'phone': '+227 20 00 00 00',
                'contact_name': 'Abdoul Salam Issifi',
                'contact_email': 'direction@sirbacom.ne',
                'security_officer': 'Hamani Massaoudou',
                'description': 'Organisation de démonstration pour le projet GRC-Goal-PME',
                'grc_scope': 'Systèmes d\'information, Données clients, Processus métier',
                'status': 'active',
                'is_demo': True,
                'creator_user_id': 'user-hamani'
            }
        )
        
        self.stdout.write(self.style.SUCCESS(f'Organization {"created" if created else "already exists"}'))
        return org

    def load_users(self, org):
        self.stdout.write('Loading users...')
        
        users_data = [
            {
                'id': 'user-hamani',
                'first_name': 'Hamani',
                'last_name': 'Massaoudou',
                'name': 'Hamani Massaoudou',
                'email': 'massaoudhamani10@gmail.com',
                'phone': '+227 90 00 00 01',
                'job_title': 'Concepteur GRC-Goal & Développeur B14',
                'department': 'Sécurité de l\'Information & GRC',
                'organization_id': org.id,
                'organization_ids': [org.id],
                'organization_name': org.name,
                'role_ids': ['role-super-admin', 'role-rssi'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': True,
                'mfa_secret': 'JBSWY3DPEHPK3PXP',
                'avatar_color': 'bg-indigo-600'
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
                'organization_id': org.id,
                'organization_ids': [org.id],
                'organization_name': 'Sirba Communication',
                'role_ids': ['role-org-admin', 'role-risk-owner'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': True,
                'mfa_secret': 'KRSXG5CTMVRXEZLU',
                'avatar_color': 'bg-orange-600'
            },
            {
                'id': 'user-mentor',
                'first_name': 'Aboubacar',
                'last_name': 'Yacouba Mai Birni',
                'name': 'Aboubacar Yacouba Mai Birni',
                'email': 'mentor.grc@apsi.ne',
                'phone': '+227 91 88 77 66',
                'job_title': 'Mentor Référent GRC — APSI-NE',
                'department': 'Comité Pédagogique d\'Excellence',
                'organization_id': org.id,
                'organization_ids': [org.id],
                'organization_name': 'Programme Cybersécurité Niger',
                'role_ids': ['role-auditor'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': False,
                'avatar_color': 'bg-purple-600'
            },
            {
                'id': 'user-diallo',
                'first_name': 'Aïchatou',
                'last_name': 'Diallo',
                'name': 'Aïchatou Diallo',
                'email': 'a.diallo@sirbacom.ne',
                'phone': '+227 88 44 22 11',
                'job_title': 'Responsable Systèmes d\'Information & Actifs',
                'department': 'Systèmes d\'Information',
                'organization_id': org.id,
                'organization_ids': [org.id],
                'organization_name': 'Sirba Communication',
                'role_ids': ['role-risk-owner'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': False,
                'avatar_color': 'bg-teal-600'
            },
            {
                'id': 'user-moussa',
                'first_name': 'Ibrahim',
                'last_name': 'Moussa',
                'name': 'Ibrahim Moussa',
                'email': 'i.moussa@sirbacom.ne',
                'phone': '+227 94 33 22 11',
                'job_title': 'Opérateur Support & Collaborateur',
                'department': 'Exploitation & Support',
                'organization_id': org.id,
                'organization_ids': [org.id],
                'organization_name': 'Sirba Communication',
                'role_ids': ['role-viewer'],
                'status': 'actif',
                'must_change_password': False,
                'mfa_enabled': False,
                'avatar_color': 'bg-slate-600'
            },
            {
                'id': 'user-suspendu',
                'first_name': 'Compte',
                'last_name': 'Suspendu Test',
                'name': 'Compte Suspendu Test',
                'email': 'suspendu@demo.ne',
                'job_title': 'Ancien Collaborateur',
                'department': 'Département Commercial',
                'organization_id': org.id,
                'organization_ids': [org.id],
                'organization_name': 'PME Démonstration',
                'role_ids': ['role-viewer'],
                'status': 'suspendu',
                'must_change_password': False,
                'mfa_enabled': False,
                'failed_login_attempts': 3,
                'avatar_color': 'bg-rose-600'
            }
        ]
        
        default_password = 'PmeSecure2026!'
        
        for user_data in users_data:
            user, created = UserAccount.objects.get_or_create(
                id=user_data['id'],
                defaults={**user_data, 'password': default_password}
            )
            if created:
                user.set_password(default_password)
                user.save()
        
        self.stdout.write(self.style.SUCCESS('Users loaded successfully'))

    def load_collaborators(self, org):
        self.stdout.write('Loading collaborators...')
        
        collaborators_data = [
            {
                'id': 'collab-1',
                'organization': org,
                'full_name': 'Hamani Massaoudou',
                'email': 'massaoudhamani10@gmail.com',
                'phone': '+227 90 00 00 01',
                'department': 'Sécurité de l\'Information & GRC',
                'job_title': 'Concepteur GRC-Goal',
                'role_id': 'role-super-admin',
                'grc_responsibilities': 'Pilotage global du projet GRC-Goal-PME',
                'is_platform_user': True,
                'invitation_status': 'actif',
                'invited_at': datetime(2026, 10, 10).date(),
                'joined_at': datetime(2026, 10, 10).date()
            },
            {
                'id': 'collab-2',
                'organization': org,
                'full_name': 'Abdoul Salam Issifi',
                'email': 'direction@sirbacom.ne',
                'phone': '+227 96 12 34 56',
                'department': 'Direction Générale',
                'job_title': 'Directeur',
                'role_id': 'role-org-admin',
                'grc_responsibilities': 'Validation des plans d\'actions',
                'is_platform_user': True,
                'invitation_status': 'actif',
                'invited_at': datetime(2026, 10, 12).date(),
                'joined_at': datetime(2026, 10, 12).date()
            }
        ]
        
        for collab_data in collaborators_data:
            Collaborator.objects.get_or_create(
                id=collab_data['id'],
                defaults=collab_data
            )
        
        self.stdout.write(self.style.SUCCESS('Collaborators loaded successfully'))

    def load_assets(self, org):
        self.stdout.write('Loading assets...')
        
        assets_data = [
            {
                'id': 'asset-1',
                'organization': org,
                'name': 'Base de données clients',
                'category': 'database',
                'description': 'Base de données PostgreSQL contenant les informations clients',
                'owner': 'Aïchatou Diallo',
                'criticality': 'Critique',
                'location': 'Serveur principal datacenter'
            },
            {
                'id': 'asset-2',
                'organization': org,
                'name': 'Serveur de messagerie',
                'category': 'server',
                'description': 'Serveur Exchange pour les emails internes et externes',
                'owner': 'Aïchatou Diallo',
                'criticality': 'Élevée',
                'location': 'Datacenter principal'
            },
            {
                'id': 'asset-3',
                'organization': org,
                'name': 'Application web CRM',
                'category': 'application',
                'description': 'Application de gestion de la relation client',
                'owner': 'Aïchatou Diallo',
                'criticality': 'Élevée',
                'location': 'Cloud Azure'
            },
            {
                'id': 'asset-4',
                'organization': org,
                'name': 'Parc de 15 laptops',
                'category': 'hardware',
                'description': 'Ordinateurs portables des collaborateurs',
                'owner': 'Ibrahim Moussa',
                'criticality': 'Moyenne',
                'location': 'Bureaux'
            },
            {
                'id': 'asset-5',
                'organization': org,
                'name': 'Procédures et PCA',
                'category': 'document',
                'description': 'Documentation des procédures et plan de continuité',
                'owner': 'Abdoul Salam Issifi',
                'criticality': 'Élevée',
                'location': 'SharePoint'
            },
            {
                'id': 'asset-6',
                'organization': org,
                'name': 'Archives physiques',
                'category': 'document',
                'description': 'Documents papier et contrats clients',
                'owner': 'Ibrahim Moussa',
                'criticality': 'Moyenne',
                'location': 'Local archives'
            }
        ]
        
        for asset_data in assets_data:
            Asset.objects.get_or_create(
                id=asset_data['id'],
                defaults=asset_data
            )
        
        self.stdout.write(self.style.SUCCESS('Assets loaded successfully'))

    def load_risks(self, org):
        self.stdout.write('Loading risks...')
        
        # Get assets for reference
        asset_db = Asset.objects.get(id='asset-1')
        asset_server = Asset.objects.get(id='asset-2')
        asset_crm = Asset.objects.get(id='asset-3')
        asset_laptops = Asset.objects.get(id='asset-4')
        asset_procedures = Asset.objects.get(id='asset-5')
        
        risks_data = [
            {
                'id': 'risk-1',
                'code': 'R-001',
                'title': 'Accès non autorisé à la base de données clients',
                'description': 'Un attaquant pourrait accéder aux données clients sensibles',
                'organization': org,
                'asset': asset_db,
                'probability': 4,
                'impact': 5,
                'score': 20,
                'level': 'Critique',
                'strategy': 'réduire',
                'owner': 'Aïchatou Diallo',
                'status': 'ouvert'
            },
            {
                'id': 'risk-2',
                'code': 'R-002',
                'title': 'Ransomware via phishing',
                'description': 'Attaque par phishing menant à une infection ransomware',
                'organization': org,
                'asset': asset_crm,
                'probability': 4,
                'impact': 4,
                'score': 16,
                'level': 'Critique',
                'strategy': 'réduire',
                'owner': 'Hamani Massaoudou',
                'status': 'ouvert'
            },
            {
                'id': 'risk-3',
                'code': 'R-003',
                'title': 'Coupure électrique prolongée',
                'description': 'Indisponibilité des systèmes suite à coupure électrique',
                'organization': org,
                'asset': asset_server,
                'probability': 3,
                'impact': 3,
                'score': 9,
                'level': 'Élevé',
                'strategy': 'réduire',
                'owner': 'Aïchatou Diallo',
                'status': 'sous_contrôle'
            },
            {
                'id': 'risk-4',
                'code': 'R-004',
                'title': 'Échec de restauration des sauvegardes',
                'description': 'Les sauvegardes ne peuvent pas être restaurées en cas de besoin',
                'organization': org,
                'asset': asset_server,
                'probability': 2,
                'impact': 5,
                'score': 10,
                'level': 'Élevé',
                'strategy': 'réduire',
                'owner': 'Ibrahim Moussa',
                'status': 'ouvert'
            },
            {
                'id': 'risk-5',
                'code': 'R-005',
                'title': 'Divulgation de documents confidentiels',
                'description': 'Fuite de documents sensibles par erreur humaine',
                'organization': org,
                'asset': asset_procedures,
                'probability': 2,
                'impact': 3,
                'score': 6,
                'level': 'Moyen',
                'strategy': 'réduire',
                'owner': 'Abdoul Salam Issifi',
                'status': 'ouvert'
            },
            {
                'id': 'risk-6',
                'code': 'R-006',
                'title': 'Ralentissement du site web',
                'description': 'Dégradation des performances du site web',
                'organization': org,
                'asset': asset_crm,
                'probability': 2,
                'impact': 1,
                'score': 2,
                'level': 'Faible',
                'strategy': 'accepter',
                'owner': 'Aïchatou Diallo',
                'status': 'clôturé'
            }
        ]
        
        for risk_data in risks_data:
            Risk.objects.get_or_create(
                id=risk_data['id'],
                defaults=risk_data
            )
        
        self.stdout.write(self.style.SUCCESS('Risks loaded successfully'))

    def load_actions(self, org):
        self.stdout.write('Loading actions...')
        
        actions_data = [
            {
                'id': 'action-1',
                'code': 'ACT-001',
                'title': 'Activer l\'authentification multi-facteurs',
                'description': 'Déployer MFA pour tous les comptes utilisateurs',
                'organization': org,
                'source': 'risque',
                'linked_risk_id': 'risk-2',
                'owner': 'Hamani Massaoudou',
                'priority': 'Critique',
                'due_date': datetime(2026, 11, 15).date(),
                'status': 'en_cours'
            },
            {
                'id': 'action-2',
                'code': 'ACT-002',
                'title': 'Formation au phishing',
                'description': 'Organiser une session de sensibilisation au phishing',
                'organization': org,
                'source': 'risque',
                'linked_risk_id': 'risk-2',
                'owner': 'Hamani Massaoudou',
                'priority': 'Haute',
                'due_date': datetime(2026, 10, 20).date(),
                'status': 'en_retard'
            },
            {
                'id': 'action-3',
                'code': 'ACT-003',
                'title': 'Test de restauration des sauvegardes',
                'description': 'Effectuer un test de restauration complet',
                'organization': org,
                'source': 'risque',
                'linked_risk_id': 'risk-4',
                'owner': 'Ibrahim Moussa',
                'priority': 'Haute',
                'due_date': datetime(2026, 10, 25).date(),
                'status': 'cloturee',
                'closed_at': datetime(2026, 10, 25).date()
            },
            {
                'id': 'action-4',
                'code': 'ACT-004',
                'title': 'Remplacement des batteries UPS',
                'description': 'Remplacer les batteries du onduleur principal',
                'organization': org,
                'source': 'risque',
                'linked_risk_id': 'risk-3',
                'owner': 'Ibrahim Moussa',
                'priority': 'Moyenne',
                'due_date': datetime(2026, 11, 30).date(),
                'status': 'a_faire'
            },
            {
                'id': 'action-5',
                'code': 'ACT-005',
                'title': 'Formalisation de la charte IT',
                'description': 'Rédiger et diffuser la charte d\'utilisation IT',
                'organization': org,
                'source': 'audit_interne',
                'owner': 'Abdoul Salam Issifi',
                'priority': 'Moyenne',
                'due_date': datetime(2026, 12, 15).date(),
                'status': 'a_faire'
            }
        ]
        
        for action_data in actions_data:
            CorrectiveAction.objects.get_or_create(
                id=action_data['id'],
                defaults=action_data
            )
        
        self.stdout.write(self.style.SUCCESS('Actions loaded successfully'))

    def load_soa_controls(self, org):
        self.stdout.write('Loading SoA controls...')
        
        # Load a minimal set of SoA controls for demo
        # In production, this would load all 93 ISO 27001:2022 controls
        controls_data = [
            {
                'id': 'soa-1',
                'code': 'A.5.1',
                'title': 'Politiques de sécurité de l\'information',
                'domain': 'A.5 Contrôles organisationnels',
                'description': 'Politiques pour la sécurité de l\'information',
                'is_applicable': True,
                'justification': 'Contrôle applicable',
                'implementation_status': 'mis_en_oeuvre',
                'maturity_level': 4,
                'evidence_ref': 'POL-SEC-001',
                'last_review_date': datetime(2026, 10, 15).date(),
                'reviewed_by': 'Hamani Massaoudou',
                'organization': org
            },
            {
                'id': 'soa-2',
                'code': 'A.5.7',
                'title': 'Menaces et vulnérabilités',
                'domain': 'A.5 Contrôles organisationnels',
                'description': 'Identification et gestion des menaces et vulnérabilités',
                'is_applicable': True,
                'justification': 'Contrôle applicable',
                'implementation_status': 'partiellement_mis_en_oeuvre',
                'maturity_level': 2,
                'evidence_ref': 'REG-RIS-001',
                'gap_description': 'Processus d\'évaluation à améliorer',
                'linked_action_id': 'action-4',
                'last_review_date': datetime(2026, 10, 15).date(),
                'reviewed_by': 'Hamani Massaoudou',
                'organization': org
            },
            {
                'id': 'soa-3',
                'code': 'A.6.1',
                'title': 'Sécurité lors du recrutement',
                'domain': 'A.6 Contrôles relatifs aux personnes',
                'description': 'Vérification des antécédents des candidats',
                'is_applicable': True,
                'justification': 'Contrôle applicable',
                'implementation_status': 'mis_en_oeuvre',
                'maturity_level': 3,
                'evidence_ref': 'PROC-REC-001',
                'last_review_date': datetime(2026, 10, 15).date(),
                'reviewed_by': 'Abdoul Salam Issifi',
                'organization': org
            }
        ]
        
        for control_data in controls_data:
            SoAControl.objects.get_or_create(
                id=control_data['id'],
                defaults=control_data
            )
        
        self.stdout.write(self.style.SUCCESS('SoA controls loaded successfully'))

    def load_security_settings(self):
        self.stdout.write('Loading security settings...')
        
        SecuritySettings.objects.get_or_create(
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
        
        self.stdout.write(self.style.SUCCESS('Security settings loaded successfully'))
