from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import secrets


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'email est obligatoire')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('status', 'actif')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superuser doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superuser doit avoir is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class UserAccount(AbstractBaseUser, PermissionsMixin):
    USER_STATUS_CHOICES = [
        ('actif', 'Actif'),
        ('suspendu', 'Suspendu'),
        ('desactive', 'Désactivé'),
        ('archive', 'Archivé'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True)
    job_title = models.CharField(max_length=200, verbose_name='Fonction')
    department = models.CharField(max_length=200, blank=True, verbose_name='Département')
    
    # Organization relationships
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    organization_ids = models.JSONField(default=list, blank=True)
    organization_name = models.CharField(max_length=200, blank=True)
    
    # Roles
    role_ids = models.JSONField(default=list, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=USER_STATUS_CHOICES, default='actif')
    
    # Password (using Django's built-in password hashing)
    password = models.CharField(max_length=128)
    
    # Password policy fields
    must_change_password = models.BooleanField(default=False)
    mfa_enabled = models.BooleanField(default=False, verbose_name='MFA activé')
    mfa_secret = models.CharField(max_length=100, blank=True, null=True)
    
    # Security
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateField(auto_now_add=True)
    last_login_at = models.DateTimeField(blank=True, null=True)
    last_login_ip = models.CharField(max_length=50, blank=True, null=True)
    
    # UI
    avatar_color = models.CharField(max_length=50, default='bg-indigo-600')
    
    # Django auth fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Compte utilisateur'
        verbose_name_plural = 'Comptes utilisateurs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.email})"
    
    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.first_name


class RoleDefinition(models.Model):
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False, verbose_name='Rôle système')
    is_active = models.BooleanField(default=True)
    color = models.CharField(max_length=50, default='bg-blue-600')
    permissions = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roles'
        verbose_name = 'Rôle'
        verbose_name_plural = 'Rôles'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class UserSession(models.Model):
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='sessions')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    ip = models.CharField(max_length=50, default='192.168.1.10')
    user_agent = models.TextField(blank=True)
    device = models.CharField(max_length=200, default='Navigateur')
    is_current = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'user_sessions'
        verbose_name = 'Session utilisateur'
        verbose_name_plural = 'Sessions utilisateurs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session {self.user.name} - {self.created_at}"


class SecurityAuditLog(models.Model):
    SECURITY_EVENT_TYPES = [
        ('LOGIN_SUCCESS', 'Connexion réussie'),
        ('LOGIN_FAILED', 'Échec de connexion'),
        ('ACCOUNT_LOCKED', 'Compte verrouillé'),
        ('ACCOUNT_UNLOCKED', 'Compte déverrouillé'),
        ('LOGOUT', 'Déconnexion'),
        ('SESSION_REVOKED', 'Session révoquée'),
        ('ALL_SESSIONS_REVOKED', 'Toutes sessions révoquées'),
        ('USER_CREATED', 'Utilisateur créé'),
        ('USER_UPDATED', 'Utilisateur modifié'),
        ('USER_DELETED', 'Utilisateur supprimé'),
        ('USER_STATUS_CHANGED', 'Statut utilisateur modifié'),
        ('PASSWORD_RESET', 'Mot de passe réinitialisé'),
        ('PASSWORD_CHANGED', 'Mot de passe changé'),
        ('MFA_TOGGLED', 'MFA modifié'),
        ('ROLE_CREATED', 'Rôle créé'),
        ('ROLE_UPDATED', 'Rôle modifié'),
        ('ROLE_DELETED', 'Rôle supprimé'),
        ('ROLE_ASSIGNED', 'Rôle assigné'),
        ('PERMISSION_DENIED', 'Permission refusée'),
        ('EXPORT_EXECUTED', 'Export exécuté'),
        ('SECURITY_SETTINGS_UPDATED', 'Paramètres sécurité mis à jour'),
        ('ORGANIZATION_CREATED', 'Organisation créée'),
        ('ORGANIZATION_UPDATED', 'Organisation modifiée'),
        ('ORGANIZATION_SWITCHED', 'Organisation changée'),
        ('COLLABORATOR_INVITED', 'Collaborateur invité'),
        ('COLLABORATOR_UPDATED', 'Collaborateur modifié'),
        ('COLLABORATOR_REMOVED', 'Collaborateur supprimé'),
    ]
    
    SEVERITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Avertissement'),
        ('critical', 'Critique'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, default=secrets.token_urlsafe)
    timestamp = models.DateTimeField(auto_now_add=True)
    event_type = models.CharField(max_length=50, choices=SECURITY_EVENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    
    actor_id = models.CharField(max_length=100)
    actor_name = models.CharField(max_length=200)
    actor_email = models.EmailField()
    
    target_resource = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100, blank=True, null=True)
    details = models.TextField()
    
    ip_address = models.CharField(max_length=50, default='192.168.1.10')
    user_agent = models.TextField(blank=True, null=True)  # Capture du user-agent pour plus de contexte
    
    class Meta:
        db_table = 'security_audit_logs'
        verbose_name = 'Journal d\'audit'
        verbose_name_plural = 'Journaux d\'audit'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.event_type} - {self.actor_name} - {self.timestamp}"


class SecuritySettings(models.Model):
    id = models.AutoField(primary_key=True)
    password_min_length = models.IntegerField(default=8)
    password_require_uppercase = models.BooleanField(default=True)
    password_require_numbers = models.BooleanField(default=True)
    password_require_symbols = models.BooleanField(default=True)
    max_failed_attempts = models.IntegerField(default=5)
    lockout_duration_minutes = models.IntegerField(default=15)
    session_timeout_minutes = models.IntegerField(default=120)
    mfa_mandatory_for_admins = models.BooleanField(default=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'security_settings'
        verbose_name = 'Paramètres de sécurité'
        verbose_name_plural = 'Paramètres de sécurité'
    
    def __str__(self):
        return f"Security Settings (ID: {self.id})"


class InvitationToken(models.Model):
    """
    Token d'invitation pour l'inscription de nouveaux utilisateurs.
    """
    id = models.AutoField(primary_key=True)
    token = models.CharField(max_length=255, unique=True, db_index=True)
    email = models.EmailField()
    organization_id = models.CharField(max_length=50)
    role_ids = models.JSONField(default=list)  # Liste des rôles à attribuer
    invited_by = models.CharField(max_length=50)  # ID de l'utilisateur qui a invité
    invited_by_name = models.CharField(max_length=255)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'En attente'),
            ('accepted', 'Accepté'),
            ('expired', 'Expiré'),
            ('revoked', 'Révoqué')
        ],
        default='pending'
    )
    
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'invitation_tokens'
        verbose_name = 'Token d\'invitation'
        verbose_name_plural = 'Tokens d\'invitation'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invitation pour {self.email} ({self.status})"
    
    def is_valid(self):
        from django.utils import timezone
        return (
            self.status == 'pending' and
            self.expires_at > timezone.now()
        )
