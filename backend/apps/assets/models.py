from django.db import models
import secrets


class Asset(models.Model):
    ASSET_CATEGORY_CHOICES = [
        ('application', 'Application'),
        ('database', 'Base de données'),
        ('server', 'Serveur'),
        ('document', 'Document'),
        ('service', 'Service'),
        ('hardware', 'Matériel'),
        ('process', 'Processus'),
    ]
    
    ASSET_CRITICALITY_CHOICES = [
        ('Faible', 'Faible'),
        ('Moyenne', 'Moyenne'),
        ('Élevée', 'Élevée'),
        ('Critique', 'Critique'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=ASSET_CATEGORY_CHOICES)
    description = models.TextField()
    owner = models.CharField(max_length=200, verbose_name='Propriétaire')
    criticality = models.CharField(max_length=20, choices=ASSET_CRITICALITY_CHOICES)
    location = models.CharField(max_length=200, blank=True)
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='assets'
    )
    
    created_at = models.DateField(auto_now_add=True)
    
    class Meta:
        db_table = 'assets'
        verbose_name = 'Actif'
        verbose_name_plural = 'Actifs'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
