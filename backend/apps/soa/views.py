from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import SoAControl
from .serializers import SoAControlSerializer, SoAControlCreateSerializer
from apps.users.permissions import HasRolePermission


class SoAControlViewSet(viewsets.ModelViewSet):
    serializer_class = SoAControlSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    filterset_fields = ['domain', 'is_applicable', 'implementation_status']
    search_fields = ['code', 'title']
    ordering = ['code']
    
    def get_queryset(self):
        """
        Filtrer les contrôles SoA selon l'organisation de l'utilisateur connecté.
        """
        user = self.request.user
        
        # Super-administrateurs voient tous les contrôles
        if user.is_superuser or user.is_staff:
            return SoAControl.objects.all()
        
        # Filtrer par organisation
        user_orgs = user.organization_ids or [user.organization_id]
        return SoAControl.objects.filter(organization_id__in=user_orgs)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SoAControlCreateSerializer
        return SoAControlSerializer
    
    def perform_update(self, serializer):
        perm = HasRolePermission('soa', 'update')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de modifier ce contrôle SoA.")
        serializer.save()
