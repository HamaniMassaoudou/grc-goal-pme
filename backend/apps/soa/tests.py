from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import UserAccount, RoleDefinition
from apps.organizations.models import Organization
from apps.soa.models import SoAControl
from apps.soa.services import generate_soa_for_organization


class SoAControlsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(
            id='org-soa-test',
            name='Organisation SoA Test',
            sector='Services',
            size='15 collaborateurs',
            contact_name='Dirigeant',
            contact_email='dir@test.ne',
            security_officer='RSSI Test',
            description='Périmètre complet'
        )
        self.role = RoleDefinition.objects.create(
            id='role-soa-mgr',
            code='SOA_MGR',
            name='Gestionnaire SoA',
            is_system=False,
            permissions={'soa': ['view', 'create', 'update', 'delete', 'manage']}
        )
        self.user = UserAccount.objects.create_user(
            email='auditor@test.ne',
            password='PmeSecure2026!',
            id='user-auditor-test',
            name='Auditeur Test',
            first_name='Auditeur',
            last_name='Test',
            organization_id=self.org.id,
            role_ids=['role-soa-mgr'],
            is_staff=True,
            status='actif'
        )
        login_resp = self.client.post('/api/auth/users/login/', {
            'email': 'auditor@test.ne',
            'password': 'PmeSecure2026!'
        }, format='json')
        token = login_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_soa_catalog_generation_exactly_93_controls(self):
        controls = generate_soa_for_organization(self.org, is_demo=True)
        self.assertEqual(len(controls), 93)

        # Vérifier présence des 4 thèmes ISO 27001:2022
        domains = set(c.domain for c in controls)
        self.assertIn('A.5 Contrôles organisationnels', domains)
        self.assertIn('A.6 Contrôles relatifs aux personnes', domains)
        self.assertIn('A.7 Contrôles physiques', domains)
        self.assertIn('A.8 Contrôles technologiques', domains)

    def test_soa_api_returns_all_controls_without_truncation(self):
        # Générer les 93 contrôles
        generate_soa_for_organization(self.org, is_demo=True)

        # Interroger l'endpoint API
        response = self.client.get('/api/soa-controls/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # S'assurer que le viewset sans pagination renvoie bien une liste de 93 items
        data = response.data
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 93)

    def test_soa_control_update_via_api(self):
        generate_soa_for_organization(self.org, is_demo=True)
        control = SoAControl.objects.filter(code='A.5.1', organization=self.org).first()
        self.assertIsNotNone(control)

        # Mettre à jour le statut et la justification
        patch_resp = self.client.patch(f'/api/soa-controls/{control.id}/', {
            'implementation_status': 'partiellement_mis_en_oeuvre',
            'maturity_level': 3,
            'justification': 'Politiques définies mais révision annuelle en cours'
        }, format='json')
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)

        # Vérifier en base
        control.refresh_from_db()
        self.assertEqual(control.implementation_status, 'partiellement_mis_en_oeuvre')
        self.assertEqual(control.maturity_level, 3)
        self.assertEqual(control.justification, 'Politiques définies mais révision annuelle en cours')
