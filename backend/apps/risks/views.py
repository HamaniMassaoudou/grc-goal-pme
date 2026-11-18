from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Risk
from .serializers import RiskSerializer, RiskCreateSerializer
from apps.users.permissions import HasRolePermission


class RiskViewSet(viewsets.ModelViewSet):
    serializer_class = RiskSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['level', 'status', 'strategy']
    search_fields = ['code', 'title', 'owner']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filtrer les risques selon l'organisation de l'utilisateur connecté.
        """
        user = self.request.user
        
        # Super-administrateurs voient tous les risques
        if user.is_superuser or user.is_staff:
            return Risk.objects.all()
        
        # Filtrer par organisation
        user_orgs = user.organization_ids or [user.organization_id]
        return Risk.objects.filter(organization_id__in=user_orgs)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RiskCreateSerializer
        return RiskSerializer
    
    def perform_create(self, serializer):
        perm = HasRolePermission('risks', 'create')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de créer un risque.")
        serializer.save()
    
    def perform_update(self, serializer):
        perm = HasRolePermission('risks', 'update')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de modifier ce risque.")
        serializer.save()
    
    def perform_destroy(self, instance):
        perm = HasRolePermission('risks', 'delete')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de supprimer ce risque.")
        instance.delete()
