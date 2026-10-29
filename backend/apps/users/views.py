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


class RoleDefinitionViewSet(viewsets.ModelViewSet):
    queryset = RoleDefinition.objects.all()
    serializer_class = RoleDefinitionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_system', 'is_active']
    search_fields = ['code', 'name']


class UserAccountViewSet(viewsets.ModelViewSet):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'organization_id']
    search_fields = ['name', 'email']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserAccountCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserAccountUpdateSerializer
        return UserAccountSerializer
    
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
    queryset = SecurityAuditLog.objects.all()
    serializer_class = SecurityAuditLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['event_type', 'severity', 'actor_id']
    search_fields = ['actor_name', 'details']
    ordering = ['-timestamp']


class SecuritySettingsViewSet(viewsets.ModelViewSet):
    queryset = SecuritySettings.objects.all()
    serializer_class = SecuritySettingsSerializer
    permission_classes = [IsAuthenticated]

