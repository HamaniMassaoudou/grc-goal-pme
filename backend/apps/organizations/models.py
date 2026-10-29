from django.db import models
import secrets


class Organization(models.Model):
    ORGANIZATION_STATUS_CHOICES = [
        ('active', 'Active'),
        ('in_configuration', 'En configuration'),
        ('suspended', 'Suspendue'),
        ('archived', 'Archivée'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    name = models.CharField(max_length=200)
    legal_name = models.CharField(max_length=200, blank=True, verbose_name='Raison sociale')
    sector = models.CharField(max_length=200, verbose_name='Secteur')
    size = models.CharField(max_length=200, verbose_name='Taille')
    address = models.TextField(blank=True, verbose_name='Adresse')
    phone = models.CharField(max_length=50, blank=True)
    contact_name = models.CharField(max_length=200, verbose_name='Nom du contact')
    contact_email = models.EmailField(verbose_name='Email du contact')
    security_officer = models.CharField(max_length=200, verbose_name='RSSI / Référent GRC')
    description = models.TextField()
    grc_scope = models.TextField(blank=True, verbose_name='Périmètre GRC')
    status = models.CharField(max_length=30, choices=ORGANIZATION_STATUS_CHOICES, default='active')
    is_demo = models.BooleanField(default=False, verbose_name='Organisation de démonstration')
    creator_user_id = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True, blank=True, null=True)
    
    class Meta:
        db_table = 'organizations'
        verbose_name = 'Organisation'
        verbose_name_plural = 'Organisations'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
