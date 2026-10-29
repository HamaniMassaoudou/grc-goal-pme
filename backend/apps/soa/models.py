from django.db import models
import secrets


class SoAControl(models.Model):
    SOA_DOMAIN_CHOICES = [
        ('A.5 Contrôles organisationnels', 'A.5 Contrôles organisationnels'),
        ('A.6 Contrôles relatifs aux personnes', 'A.6 Contrôles relatifs aux personnes'),
        ('A.7 Contrôles physiques', 'A.7 Contrôles physiques'),
        ('A.8 Contrôles technologiques', 'A.8 Contrôles technologiques'),
    ]
    
    IMPLEMENTATION_STATUS_CHOICES = [
        ('non_commence', 'Non commencé'),
        ('planifie', 'Planifié'),
        ('partiellement_mis_en_oeuvre', 'Partiellement mis en œuvre'),
        ('mis_en_oeuvre', 'Mis en œuvre'),
        ('non_applicable', 'Non applicable'),
    ]
    
    MATURITY_LEVEL_CHOICES = [(i, str(i)) for i in range(1, 6)]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    code = models.CharField(max_length=20, verbose_name='Code (ex: A.5.1)')
    title = models.CharField(max_length=300)
    domain = models.CharField(max_length=100, choices=SOA_DOMAIN_CHOICES)
    description = models.TextField()
    
    is_applicable = models.BooleanField(default=True, verbose_name='Applicable')
    justification = models.TextField(blank=True, verbose_name='Justification')
    
    implementation_status = models.CharField(
        max_length=50,
        choices=IMPLEMENTATION_STATUS_CHOICES,
        default='non_commence',
        verbose_name='Statut de mise en œuvre'
    )
    
    maturity_level = models.IntegerField(
        choices=MATURITY_LEVEL_CHOICES,
        default=1,
        verbose_name='Niveau de maturité (1-5)'
    )
    
    evidence_ref = models.CharField(max_length=500, blank=True, verbose_name='Référence de preuve')
    gap_description = models.TextField(blank=True, verbose_name='Écart constaté')
    
    linked_action_id = models.CharField(max_length=100, blank=True, null=True)
    
    last_review_date = models.DateField()
    reviewed_by = models.CharField(max_length=200, verbose_name='Révisé par')
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='soa_controls',
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'soa_controls'
        verbose_name = 'Contrôle SoA'
        verbose_name_plural = 'Contrôles SoA'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.title}"
