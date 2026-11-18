from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserAccount, RoleDefinition, UserSession, SecurityAuditLog, SecuritySettings
from .serializers import (
    UserAccountSerializer, UserAccountCreateSerializer, UserAccountUpdateSerializer,
    RoleDefinitionSerializer, UserSessionSerializer, SecurityAuditLogSerializer,
    SecuritySettingsSerializer, LoginSerializer
)
from .permissions import (
    CanManageUsers, CanManageRoles, CanViewAuditLogs, IsSuperAdmin,
    IsOrganizationMember
)


class RoleDefinitionViewSet(viewsets.ModelViewSet):
    queryset = RoleDefinition.objects.all()
    serializer_class = RoleDefinitionSerializer
    permission_classes = [IsAuthenticated, CanManageRoles]
    filterset_fields = ['is_system', 'is_active']
    search_fields = ['code', 'name']
    
    def perform_update(self, serializer):
        # Empêcher la modification des rôles système
        instance = self.get_object()
        if instance.is_system and not (self.request.user.is_superuser or self.request.user.is_staff):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Les rôles système ne peuvent pas être modifiés.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Empêcher la suppression des rôles système
        if instance.is_system and not (self.request.user.is_superuser or self.request.user.is_staff):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Les rôles système ne peuvent pas être supprimés.")
        instance.delete()


class UserAccountViewSet(viewsets.ModelViewSet):
    serializer_class = UserAccountSerializer
    permission_classes = [IsAuthenticated, CanManageUsers]
    filterset_fields = ['status', 'organization_id']
    search_fields = ['name', 'email']
    
    def get_permissions(self):
        """
        Permettre la création publique d'utilisateur et la connexion.
        Les autres actions nécessitent une authentification.
        """
        if self.action in ['create', 'login']:
            return [AllowAny()]
        return [IsAuthenticated(), CanManageUsers()]
    
    def get_queryset(self):
        """
        Filtrer les utilisateurs selon l'organisation de l'utilisateur connecté.
        Les super-administrateurs voient tous les utilisateurs.
        """
        user = self.request.user

        # Super-administrateurs voient tous les utilisateurs
        if user.is_superuser or user.is_staff:
            return UserAccount.objects.all()

        # Filtrer par organisation (ForeignKey)
        if user.organization:
            return UserAccount.objects.filter(organization=user.organization)
        # Fallback pour les utilisateurs sans organisation
        ids = user.organization_ids or []
        if ids:
            return UserAccount.objects.filter(organization_id__in=ids)
        return UserAccount.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserAccountCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserAccountUpdateSerializer
        return UserAccountSerializer
    
    def perform_update(self, serializer):
        # Empêcher un utilisateur de se retirer ses propres droits d'admin
        if self.request.user.id == self.get_object().id:
            new_role_ids = serializer.validated_data.get('role_ids', [])
            if 'role-super-admin' in self.get_object().role_ids and 'role-super-admin' not in new_role_ids:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Vous ne pouvez pas retirer votre propre rôle Super Administrateur.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Empêcher un utilisateur de se supprimer lui-même
        if instance.id == self.request.user.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez pas supprimer votre propre compte.")
        instance.delete()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, email=email, password=password)
        
        if user is None:
            return Response(
                {'error': 'Email ou mot de passe incorrect'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if user.status != 'actif':
            return Response(
                {'error': 'Compte non actif'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Log the login
        SecurityAuditLog.objects.create(
            event_type='LOGIN_SUCCESS',
            severity='info',
            actor_id=user.id,
            actor_name=user.name,
            actor_email=user.email,
            target_resource='authentification',
            details='Connexion réussie',
            ip_address=request.META.get('REMOTE_ADDR', '192.168.1.10')
        )
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserAccountSerializer(user).data
        })
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            SecurityAuditLog.objects.create(
                event_type='LOGOUT',
                severity='info',
                actor_id=request.user.id,
                actor_name=request.user.name,
                actor_email=request.user.email,
                target_resource='authentification',
                details='Déconnexion',
                ip_address=request.META.get('REMOTE_ADDR', '192.168.1.10')
            )
            
            return Response({'message': 'Déconnexion réussie'})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserSessionViewSet(viewsets.ModelViewSet):
    queryset = UserSession.objects.all()
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['user', 'is_current']
    
    def get_queryset(self):
        return UserSession.objects.filter(user=self.request.user)


class SecurityAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SecurityAuditLogSerializer
    permission_classes = [IsAuthenticated, CanViewAuditLogs]
    filterset_fields = ['event_type', 'severity', 'actor_id']
    search_fields = ['actor_name', 'details']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        """
        Filtrer les logs selon l'organisation de l'utilisateur connecté.
        Les super-administrateurs voient tous les logs.
        """
        user = self.request.user
        
        # Super-administrateurs voient tous les logs
        if user.is_superuser or user.is_staff:
            return SecurityAuditLog.objects.all()
        
        # Filtrer par organisation (via actor_id correspondant aux utilisateurs de l'org)
        user_orgs = user.organization_ids or [user.organization_id]
        org_users = UserAccount.objects.filter(organization_id__in=user_orgs).values_list('id', flat=True)
        return SecurityAuditLog.objects.filter(actor_id__in=org_users)


class SecuritySettingsViewSet(viewsets.ModelViewSet):
    queryset = SecuritySettings.objects.all()
    serializer_class = SecuritySettingsSerializer
    permission_classes = [IsAuthenticated]

