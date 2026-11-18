from django.db import models
import secrets


class TestProtocolLog(models.Model):
    PERCEIVED_UTILITY_CHOICES = [
        ('Excellent', 'Excellent'),
        ('Très utile', 'Très utile'),
        ('Utile', 'Utile'),
        ('À améliorer', 'À améliorer'),
    ]

    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    date = models.DateField()
    tester_name = models.CharField(max_length=200, verbose_name='Nom du testeur')
    tester_role = models.CharField(max_length=200, verbose_name='Rôle du testeur')
    organization_name = models.CharField(max_length=200, verbose_name='Organisation')
    duration_minutes = models.IntegerField(default=0, verbose_name='Durée (minutes)')
    scenarios_completed = models.JSONField(default=list, blank=True, verbose_name='Scénarios complétés')
    feedback_notes = models.TextField(blank=True, verbose_name='Remarques générales')
    perceived_utility = models.CharField(
        max_length=50,
        choices=PERCEIVED_UTILITY_CHOICES,
        default='Très utile',
        verbose_name='Utilité perçue'
    )
    signed_by_tester = models.BooleanField(default=False, verbose_name='Signé par le testeur')

    class Meta:
        db_table = 'test_protocol_logs'
        verbose_name = 'Journal de protocole de test'
        verbose_name_plural = 'Journaux de protocole de test'
        ordering = ['-date']

    def __str__(self):
        return f"Protocole {self.date} - {self.tester_name}"


class UserTestSheet(models.Model):
    PERCEIVED_UTILITY_CHOICES = [
        ('Indispensable', 'Indispensable'),
        ('Très utile', 'Très utile'),
        ('Utile', 'Utile'),
        ('Moyennement utile', 'Moyennement utile'),
        ('À améliorer', 'À améliorer'),
    ]

    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    code = models.CharField(max_length=50, unique=True, verbose_name='Code fiche')
    user_id = models.CharField(max_length=100, blank=True, null=True, verbose_name='ID utilisateur')
    tester_name = models.CharField(max_length=200, verbose_name='Nom du testeur')
    tester_email = models.EmailField(verbose_name='Courriel du testeur')
    tester_role = models.CharField(max_length=200, verbose_name='Fonction du testeur')
    organization_name = models.CharField(max_length=200, verbose_name='Organisation')
    session_title = models.CharField(max_length=300, verbose_name='Titre de la session')
    date = models.DateField(verbose_name='Date d\'évaluation')
    duration_minutes = models.IntegerField(default=0, verbose_name='Durée en minutes')
    test_environment = models.CharField(max_length=300, verbose_name='Environnement de test')
    tasks = models.JSONField(default=list, blank=True, verbose_name='Tâches évaluées')
    global_score_percent = models.IntegerField(default=0, verbose_name='Score global (%)')
    functionalities_understood = models.TextField(blank=True, verbose_name='Fonctionnalités comprises')
    difficulties_encountered = models.TextField(blank=True, verbose_name='Difficultés rencontrées')
    suggestions = models.TextField(blank=True, verbose_name='Suggestions d\'amélioration')
    feedback_notes = models.TextField(blank=True, verbose_name='Commentaires généraux')
    perceived_utility = models.CharField(
        max_length=50,
        choices=PERCEIVED_UTILITY_CHOICES,
        default='Très utile',
        verbose_name='Utilité perçue'
    )
    recommendation_score = models.IntegerField(default=10, verbose_name='Score de recommandation (1-10)')
    signed_by_tester = models.BooleanField(default=False, verbose_name='Signé')
    signature_date = models.CharField(max_length=50, blank=True, verbose_name='Date de signature')
    mentor_or_evaluator_name = models.CharField(max_length=200, blank=True, verbose_name='Mentor / Évaluateur')
    mentor_notes = models.TextField(blank=True, verbose_name='Observations du mentor')
    mentor_validated = models.BooleanField(default=False, verbose_name='Validé par le mentor')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_test_sheets'
        verbose_name = 'Fiche d\'évaluation de test'
        verbose_name_plural = 'Fiches d\'évaluation de test'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.code} - {self.tester_name} ({self.date})"
