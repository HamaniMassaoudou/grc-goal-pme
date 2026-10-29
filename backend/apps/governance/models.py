from django.db import models
import secrets


class Collaborator(models.Model):
    INVITATION_STATUS_CHOICES = [
        ('actif', 'Actif'),
        ('invite', 'Invité'),
        ('desactive', 'Désactivé'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='collaborators'
    )
    user = models.ForeignKey(
        'users.UserAccount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='collaborator_roles'
    )
    full_name = models.CharField(max_length=200, verbose_name='Nom complet')
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=200, verbose_name='Département')
    job_title = models.CharField(max_length=200, verbose_name='Fonction')
    role_id = models.CharField(max_length=100, verbose_name='ID du rôle')
    grc_responsibilities = models.TextField(blank=True, verbose_name='Responsabilités GRC')
    is_platform_user = models.BooleanField(default=False, verbose_name='Utilisateur de la plateforme')
    invitation_status = models.CharField(max_length=20, choices=INVITATION_STATUS_CHOICES, default='invite')
    invited_at = models.DateField(blank=True, null=True)
    joined_at = models.DateField(blank=True, null=True)
    
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True, blank=True, null=True)
    
    class Meta:
        db_table = 'collaborators'
        verbose_name = 'Collaborateur'
        verbose_name_plural = 'Collaborateurs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.organization.name})"
