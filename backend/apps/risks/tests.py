from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import UserAccount, RoleDefinition
from apps.organizations.models import Organization
from apps.assets.models import Asset
from apps.risks.models import Risk


class RiskBusinessLogicTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.org = Organization.objects.create(
            id='org-risk-test',
            name='Organisation Test Risques',
            sector='Technologies',
            size='10-50',
            contact_name='Directeur Test',
            contact_email='contact@test.ne',
            security_officer='Test RSSI',
            description='Test GRC scope'
        )
        self.asset = Asset.objects.create(
            id='ast-test-1',
            name='Serveur Base de Données',
            category='database',
            description='Données sensibles',
            owner='Test Owner',
            criticality='Critique',
            organization=self.org
        )
        self.role = RoleDefinition.objects.create(
            id='role-risk-mgr',
            code='RISK_MGR',
            name='Gestionnaire des Risques',
            is_system=False,
            permissions={'risks': ['view', 'create', 'update', 'delete', 'manage']}
        )
        self.user = UserAccount.objects.create_user(
            email='risk.officer@test.ne',
            password='PmeSecure2026!',
            id='user-risk-officer',
            name='Risk Officer',
            first_name='Risk',
            last_name='Officer',
            organization_id=self.org.id,
            role_ids=['role-risk-mgr'],
            is_staff=True,
            status='actif'
        )
        login_resp = self.client.post('/api/auth/users/login/', {
            'email': 'risk.officer@test.ne',
            'password': 'PmeSecure2026!'
        }, format='json')
        token = login_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_risk_score_calculation_critical(self):
        # Probabilité 4 * Impact 5 = 20 -> Niveau Critique (seuil >= 15)
        response = self.client.post('/api/risks/', {
            'code': 'RSK-TEST-01',
            'title': 'Test Risque Critique',
            'description': 'Attaque par ransomware non contenue',
            'asset': self.asset.id,
            'threat': 'Ransomware',
            'vulnerability': 'Absence de segmentation',
            'owner': 'Hamani Massaoudou',
            'probability': 4,
            'impact': 5,
            'strategy': 'réduire',
            'treatment_notes': 'Mise en place PRA et sauvegarde immuable',
            'residual_probability': 1,
            'residual_impact': 2,
            'organization': self.org.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertEqual(data['score'], 20)
        self.assertEqual(data['level'], 'Critique')
        self.assertEqual(data['residual_score'], 2)
        self.assertEqual(data['residual_level'], 'Faible')

    def test_risk_score_calculation_medium(self):
        # Probabilité 2 * Impact 3 = 6 -> Niveau Moyen (seuil 4..7)
        response = self.client.post('/api/risks/', {
            'code': 'RSK-TEST-02',
            'title': 'Test Risque Moyen',
            'description': 'Panne climatisation salle serveur',
            'asset': self.asset.id,
            'threat': 'Surchauffe',
            'vulnerability': 'Un seul groupe de climatisation',
            'owner': 'Hamani Massaoudou',
            'probability': 2,
            'impact': 3,
            'strategy': 'réduire',
            'treatment_notes': 'Contrat de maintenance 4h',
            'residual_probability': 1,
            'residual_impact': 3,
            'organization': self.org.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data
        self.assertEqual(data['score'], 6)
        self.assertEqual(data['level'], 'Moyen')
        self.assertEqual(data['residual_score'], 3)
        self.assertEqual(data['residual_level'], 'Faible')

    def test_risk_persistence_and_update(self):
        # Création initiale
        response = self.client.post('/api/risks/', {
            'code': 'RSK-TEST-03',
            'title': 'Test Mise à Jour Risque',
            'description': 'Description initiale',
            'asset': self.asset.id,
            'threat': 'Ingénierie sociale',
            'vulnerability': 'Manque de sensibilisation',
            'owner': 'Hamani Massaoudou',
            'probability': 3,
            'impact': 3,
            'strategy': 'réduire',
            'organization': self.org.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        risk_id = response.data['id']

        # Modification du risque
        update_resp = self.client.patch(f'/api/risks/{risk_id}/', {
            'strategy': 'transférer',
            'treatment_notes': 'Souscription cyber-assurance'
        }, format='json')
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)

        # Vérification en base de données SQLite
        risk = Risk.objects.get(id=risk_id)
        self.assertEqual(risk.strategy, 'transférer')
        self.assertEqual(risk.treatment_notes, 'Souscription cyber-assurance')
