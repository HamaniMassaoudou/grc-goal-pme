from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import UserAccount, RoleDefinition, SecurityAuditLog, SecuritySettings


class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.role_super_admin = RoleDefinition.objects.create(
            id='role-super-admin',
            code='SUPER_ADMIN',
            name='Super Administrateur',
            is_system=True,
            permissions={'users': ['view', 'create', 'update', 'delete']}
        )
        self.user = UserAccount.objects.create_user(
            email='test.admin@pme.ne',
            password='PmeSecure2026!',
            id='user-test-admin',
            name='Admin Test',
            first_name='Admin',
            last_name='Test',
            organization_id='org-pme-demo',
            role_ids=['role-super-admin'],
            status='actif'
        )
        self.suspended_user = UserAccount.objects.create_user(
            email='suspended@pme.ne',
            password='PmeSecure2026!',
            id='user-suspended',
            name='Suspendu Test',
            first_name='Suspendu',
            last_name='Test',
            organization_id='org-pme-demo',
            role_ids=[],
            status='suspendu'
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/users/login/', {
            'email': 'test.admin@pme.ne',
            'password': 'PmeSecure2026!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'test.admin@pme.ne')

        # Vérifier que le journal d'audit a consigné la connexion
        audit = SecurityAuditLog.objects.filter(actor_email='test.admin@pme.ne', event_type='LOGIN_SUCCESS').first()
        self.assertIsNotNone(audit)

    def test_login_failed_invalid_credentials(self):
        response = self.client.post('/api/auth/users/login/', {
            'email': 'test.admin@pme.ne',
            'password': 'WrongPassword123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_refused_for_suspended_user(self):
        response = self.client.post('/api/auth/users/login/', {
            'email': 'suspended@pme.ne',
            'password': 'PmeSecure2026!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_access_to_user_list(self):
        login_resp = self.client.post('/api/auth/users/login/', {
            'email': 'test.admin@pme.ne',
            'password': 'PmeSecure2026!'
        }, format='json')
        token = login_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/auth/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
