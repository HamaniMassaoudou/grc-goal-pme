from django.test import TestCase
from datetime import date
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import UserAccount
from apps.testing.models import TestProtocolLog, UserTestSheet


class TestingProtocolTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserAccount.objects.create_user(
            email='evaluator@apsi.ne',
            password='PmeSecure2026!',
            id='user-evaluator',
            name='Évaluateur Officiel',
            organization_id='org-pme-demo'
        )
        login_resp = self.client.post('/api/auth/users/login/', {
            'email': 'evaluator@apsi.ne',
            'password': 'PmeSecure2026!'
        }, format='json')
        token = login_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_create_and_retrieve_user_test_sheet(self):
        sheet_data = {
            'code': 'FT-TEST-999',
            'tester_name': 'Testeur Qualité',
            'tester_email': 'testeur@pme.ne',
            'tester_role': 'Dirigeant',
            'organization_name': 'PME Test',
            'session_title': 'Session de certification B14',
            'date': '2026-10-29',
            'duration_minutes': 30,
            'test_environment': 'Chrome Windows 11',
            'tasks': [
                {
                    'taskId': 'T1',
                    'taskTitle': 'Création organisation',
                    'status': 'valide',
                    'observations': 'Très fluide'
                }
            ],
            'global_score_percent': 100,
            'functionalities_understood': 'Matrice et SoA',
            'difficulties_encountered': 'Aucune',
            'suggestions': 'Parfait',
            'feedback_notes': 'Outil indispensable',
            'perceived_utility': 'Indispensable',
            'recommendation_score': 10,
            'signed_by_tester': True,
            'signature_date': '2026-10-29',
            'mentor_validated': True
        }

        response = self.client.post('/api/test-sheets/', sheet_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        sheet = UserTestSheet.objects.get(code='FT-TEST-999')
        self.assertEqual(sheet.global_score_percent, 100)
        self.assertTrue(sheet.mentor_validated)
