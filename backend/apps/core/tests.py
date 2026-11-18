import io
import hashlib
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import UserAccount
from apps.organizations.models import Organization
from apps.core.models import EvidenceFile


class EvidenceFileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(
            id='org-evidence-test',
            name='Organisation Preuve Test',
            sector='Technologies',
            size='15 collaborateurs'
        )
        self.user = UserAccount.objects.create_user(
            email='auditeur.preuve@test.ne',
            password='PmeSecure2026!',
            id='user-evidence-test',
            name='Auditeur Preuve',
            organization_id=self.org.id,
            is_staff=True,
            status='actif'
        )
        login_resp = self.client.post('/api/auth/users/login/', {
            'email': 'auditeur.preuve@test.ne',
            'password': 'PmeSecure2026!'
        }, format='json')
        token = login_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_upload_evidence_and_sha256_hash_calculation(self):
        file_content = b"Politique de securite des mots de passe - Validite 2026 - ISO 27001:2022 A.5.1"
        expected_hash = hashlib.sha256(file_content).hexdigest()

        uploaded_file = SimpleUploadedFile(
            name="PSSI_Mots_de_Passe_2026.pdf",
            content=file_content,
            content_type="application/pdf"
        )

        response = self.client.post('/api/evidences/', {
            'title': 'Politique de Mots de Passe Signée',
            'file': uploaded_file,
            'linked_type': 'soa_control',
            'linked_id': 'A.5.1',
            'notes': 'Approuvée par la Direction en session du 15 Octobre 2026',
            'organization': self.org.id
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertEqual(data['title'], 'Politique de Mots de Passe Signée')
        self.assertEqual(data['sha256_hash'], expected_hash)
        self.assertEqual(data['linked_type'], 'soa_control')
        self.assertEqual(data['linked_id'], 'A.5.1')

        # Vérifier le filtrage par linked_id
        list_resp = self.client.get('/api/evidences/?linked_type=soa_control&linked_id=A.5.1')
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        # Handle paginated or non-paginated results
        results = list_resp.data.get('results', list_resp.data) if isinstance(list_resp.data, dict) else list_resp.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['sha256_hash'], expected_hash)
