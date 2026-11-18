from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Organization
from .serializers import OrganizationSerializer, OrganizationCreateSerializer
from apps.soa.services import generate_soa_for_organization
from apps.users.permissions import HasRolePermission


class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'is_demo']
    search_fields = ['name', 'legal_name', 'sector']
    
    def get_permissions(self):
        """
        Permettre la création publique d'organisation pour l'inscription.
        Les autres actions nécessitent une authentification.
        """
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filtrer les organisations selon l'utilisateur connecté.
        Les super-administrateurs voient toutes les organisations.
        Les autres voient uniquement leurs organisations.
        """
        user = self.request.user
        
        # Super-administrateurs voient toutes les organisations
        if user.is_superuser or user.is_staff:
            return Organization.objects.all()
        
        # Filtrer par les organisations de l'utilisateur
        user_orgs = user.organization_ids or [user.organization_id]
        return Organization.objects.filter(id__in=user_orgs)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrganizationCreateSerializer
        return OrganizationSerializer
    
    def perform_create(self, serializer):
        # Pour l'inscription publique, creator_user_id peut être None
        creator_id = self.request.user.id if self.request.user.is_authenticated else None
        org = serializer.save(creator_user_id=creator_id)
        generate_soa_for_organization(org, is_demo=False)
    
    def perform_update(self, serializer):
        from apps.users.permissions import HasRolePermission
        perm = HasRolePermission('governance', 'update')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de modifier cette organisation.")
        serializer.save()
