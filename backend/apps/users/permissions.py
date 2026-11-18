from rest_framework import permissions
from .models import UserAccount, RoleDefinition


class HasRolePermission(permissions.BasePermission):
    """
    Permission personnalisée basée sur les rôles et les permissions RBAC.
    Vérifie si l'utilisateur a la permission spécifique sur la ressource demandée.
    """
    
    def __init__(self, resource: str, action: str):
        self.resource = resource
        self.action = action
        super().__init__()
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.status != 'actif':
            return False
        
        # Les super-administrateurs ont tous les droits
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # Récupérer les rôles de l'utilisateur
        user_roles = RoleDefinition.objects.filter(
            id__in=request.user.role_ids,
            is_active=True
        )
        
        # Vérifier si un des rôles a la permission requise
        for role in user_roles:
            role_permissions = role.permissions or {}
            resource_permissions = role_permissions.get(self.resource, [])
            
            # 'manage' donne tous les droits sur la ressource
            if 'manage' in resource_permissions or self.action in resource_permissions:
                return True
        
        return False


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission réservée aux super-administrateurs.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.is_superuser or request.user.is_staff


class IsOrgAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permission pour les administrateurs d'organisation ou super-administrateurs.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # Vérifier si l'utilisateur a le rôle d'admin d'organisation
        user_roles = RoleDefinition.objects.filter(
            id__in=request.user.role_ids,
            is_active=True
        )
        
        for role in user_roles:
            if role.code == 'ORG_ADMIN':
                return True
        
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission : l'utilisateur peut modifier ses propres données, lecture seule pour les autres.
    """
    
    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Écriture autorisée uniquement pour le propriétaire
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'id'):
            return obj.id == request.user.id
        
        return False


class CanManageUsers(permissions.BasePermission):
    """
    Permission pour gérer les utilisateurs (création, modification, suppression).
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # Vérifier les permissions RBAC pour la ressource 'users'
        user_roles = RoleDefinition.objects.filter(
            id__in=request.user.role_ids,
            is_active=True
        )
        
        required_action = None
        if request.method in ['POST']:
            required_action = 'create'
        elif request.method in ['PUT', 'PATCH']:
            required_action = 'update'
        elif request.method == 'DELETE':
            required_action = 'delete'
        
        if not required_action:
            return True  # Lecture autorisée
        
        for role in user_roles:
            role_permissions = role.permissions or {}
            user_permissions = role_permissions.get('users', [])
            
            if 'manage' in user_permissions or required_action in user_permissions:
                return True
        
        return False


class CanManageRoles(permissions.BasePermission):
    """
    Permission pour gérer les rôles et permissions.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # Vérifier les permissions RBAC pour la ressource 'roles'
        user_roles = RoleDefinition.objects.filter(
            id__in=request.user.role_ids,
            is_active=True
        )
        
        required_action = None
        if request.method in ['POST']:
            required_action = 'create'
        elif request.method in ['PUT', 'PATCH']:
            required_action = 'update'
        elif request.method == 'DELETE':
            required_action = 'delete'
        
        if not required_action:
            return True  # Lecture autorisée
        
        for role in user_roles:
            role_permissions = role.permissions or {}
            role_perms = role_permissions.get('roles', [])
            
            if 'manage' in role_perms or required_action in role_perms:
                return True
        
        return False


class CanViewAuditLogs(permissions.BasePermission):
    """
    Permission pour consulter les journaux d'audit.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # Vérifier les permissions RBAC pour la ressource 'audit_logs'
        user_roles = RoleDefinition.objects.filter(
            id__in=request.user.role_ids,
            is_active=True
        )
        
        for role in user_roles:
            role_permissions = role.permissions or {}
            audit_permissions = role_permissions.get('audit_logs', [])
            
            if 'view' in audit_permissions or 'manage' in audit_permissions:
                return True
        
        return False


class IsOrganizationMember(permissions.BasePermission):
    """
    Permission : l'utilisateur doit être membre de l'organisation.
    Vérifie l'appartenance à l'organisation via organization_id ou organization_ids.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les super-administrateurs peuvent accéder à toutes les organisations
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # Pour les autres, l'appartenance sera vérifiée au niveau du queryset
        return True
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.is_staff:
            return True
        
        # Vérifier si l'objet appartient à l'organisation de l'utilisateur
        if hasattr(obj, 'organization_id'):
            user_orgs = request.user.organization_ids or [request.user.organization_id]
            return obj.organization_id in user_orgs
        
        return False
