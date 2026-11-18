from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import UserAccount, RoleDefinition
from apps.organizations.models import Organization
from apps.actions.models import CorrectiveAction


class ActionCorrectiveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(
            id='org-act-test',
            name='Organisation Action Test',
            sector='Industrie',
            size='20 personnes',
            contact_name='Chef de projet',
            contact_email='cp@test.ne',
            security_officer='RSSI Action',
            description='Scope'
        )
        self.role = RoleDefinition.objects.create(
            id='role-action-mgr',
            code='ACTION_MGR',
            name='Gestionnaire d Actions',
            is_system=False,
            permissions={'actions': ['view', 'create', 'update', 'delete', 'manage']}
        )
        self.user = UserAccount.objects.create_user(
            email='action.manager@test.ne',
            password='PmeSecure2026!',
            id='user-action-mgr',
            name='Action Manager',
            first_name='Action',
            last_name='Manager',
            organization_id=self.org.id,
            role_ids=['role-action-mgr'],
            is_staff=True,
            status='actif'
        )
        login_resp = self.client.post('/api/auth/users/login/', {
            'email': 'action.manager@test.ne',
            'password': 'PmeSecure2026!'
        }, format='json')
        token = login_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_create_and_close_corrective_action(self):
        # 1. Création de l'action
        response = self.client.post('/api/actions/', {
            'code': 'ACT-TEST-01',
            'title': 'Déploiement antivirus managé EDR',
            'description': 'Installation EDR sur les 15 postes',
            'source': 'risque',
            'linked_risk_id': 'rsk-01',
            'linked_control_code': 'A.8.7',
            'owner': 'Hamani Massaoudou',
            'priority': 'Haute',
            'due_date': '2026-11-30',
            'status': 'en_cours',
            'organization': self.org.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        action_id = response.data['id']

        # 2. Clôture de l'action via patch
        patch_resp = self.client.patch(f'/api/actions/{action_id}/', {
            'status': 'cloturee',
            'evidence_of_closure': 'Tous les agents ont été déployés et vérifiés.'
        }, format='json')
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)

        # 3. Vérification en base de données
        action = CorrectiveAction.objects.get(id=action_id)
        self.assertEqual(action.status, 'cloturee')
        self.assertEqual(action.evidence_of_closure, 'Tous les agents ont été déployés et vérifiés.')
