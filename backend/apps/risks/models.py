from django.db import models
import secrets


class Risk(models.Model):
    RISK_LEVEL_CHOICES = [
        ('Faible', 'Faible'),
        ('Moyen', 'Moyen'),
        ('Élevé', 'Élevé'),
        ('Critique', 'Critique'),
    ]
    
    RISK_STRATEGY_CHOICES = [
        ('réduire', 'Réduire'),
        ('accepter', 'Accepter'),
        ('transférer', 'Transférer'),
        ('éviter', 'Éviter'),
    ]
    
    RISK_STATUS_CHOICES = [
        ('ouvert', 'Ouvert'),
        ('sous_contrôle', 'Sous contrôle'),
        ('clôturé', 'Clôturé'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    asset = models.ForeignKey(
        'assets.Asset',
        on_delete=models.PROTECT,
        related_name='risks'
    )
    
    threat = models.CharField(max_length=500, verbose_name='Menace')
    vulnerability = models.CharField(max_length=500, verbose_name='Vulnérabilité')
    owner = models.CharField(max_length=200, verbose_name='Responsable')
    
    probability = models.IntegerField(default=3, verbose_name='Probabilité (1-5)')
    impact = models.IntegerField(default=3, verbose_name='Impact (1-5)')
    score = models.IntegerField(default=9, verbose_name='Score (1-25)')
    level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, default='Moyen')
    
    strategy = models.CharField(max_length=20, choices=RISK_STRATEGY_CHOICES, default='réduire')
    treatment_notes = models.TextField(blank=True, verbose_name='Notes de traitement')
    
    residual_probability = models.IntegerField(blank=True, null=True, verbose_name='Probabilité résiduelle')
    residual_impact = models.IntegerField(blank=True, null=True, verbose_name='Impact résiduel')
    residual_score = models.IntegerField(blank=True, null=True, verbose_name='Score résiduel')
    residual_level = models.CharField(max_length=20, choices=RISK_LEVEL_CHOICES, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=RISK_STATUS_CHOICES, default='ouvert')
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='risks'
    )
    
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    
    class Meta:
        db_table = 'risks'
        verbose_name = 'Risque'
        verbose_name_plural = 'Risques'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.title}"
