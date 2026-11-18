from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import CorrectiveAction
from .serializers import CorrectiveActionSerializer, CorrectiveActionCreateSerializer
from apps.users.permissions import HasRolePermission


class CorrectiveActionViewSet(viewsets.ModelViewSet):
    serializer_class = CorrectiveActionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['source', 'priority', 'status']
    search_fields = ['code', 'title', 'owner']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filtrer les actions selon l'organisation de l'utilisateur connecté.
        """
        user = self.request.user
        
        # Super-administrateurs voient toutes les actions
        if user.is_superuser or user.is_staff:
            return CorrectiveAction.objects.all()
        
        # Filtrer par organisation
        user_orgs = user.organization_ids or [user.organization_id]
        return CorrectiveAction.objects.filter(organization_id__in=user_orgs)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CorrectiveActionCreateSerializer
        return CorrectiveActionSerializer
    
    def perform_create(self, serializer):
        perm = HasRolePermission('actions', 'create')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de créer une action.")
        serializer.save()
    
    def perform_update(self, serializer):
        perm = HasRolePermission('actions', 'update')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de modifier cette action.")
        serializer.save()
    
    def perform_destroy(self, instance):
        perm = HasRolePermission('actions', 'delete')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de supprimer cette action.")
        instance.delete()
