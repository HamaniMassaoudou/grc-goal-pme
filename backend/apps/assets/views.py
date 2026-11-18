from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Asset
from .serializers import AssetSerializer, AssetCreateSerializer
from apps.users.permissions import HasRolePermission


class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['category', 'criticality']
    search_fields = ['name', 'owner']
    
    def get_queryset(self):
        """
        Filtrer les actifs selon l'organisation de l'utilisateur connecté.
        """
        user = self.request.user
        
        # Super-administrateurs voient tous les actifs
        if user.is_superuser or user.is_staff:
            return Asset.objects.all()
        
        # Filtrer par organisation
        user_orgs = user.organization_ids or [user.organization_id]
        return Asset.objects.filter(organization_id__in=user_orgs)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AssetCreateSerializer
        return AssetSerializer
    
    def perform_create(self, serializer):
        perm = HasRolePermission('assets', 'create')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de créer un actif.")
        serializer.save()
    
    def perform_update(self, serializer):
        perm = HasRolePermission('assets', 'update')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de modifier cet actif.")
        serializer.save()
    
    def perform_destroy(self, instance):
        perm = HasRolePermission('assets', 'delete')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de supprimer cet actif.")
        instance.delete()
