from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Collaborator
from .serializers import CollaboratorSerializer, CollaboratorCreateSerializer
from apps.users.permissions import HasRolePermission


class CollaboratorViewSet(viewsets.ModelViewSet):
    serializer_class = CollaboratorSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['invitation_status', 'is_platform_user']
    search_fields = ['full_name', 'email']
    
    def get_queryset(self):
        """
        Filtrer les collaborateurs selon l'organisation de l'utilisateur connecté.
        """
        user = self.request.user
        
        # Super-administrateurs voient tous les collaborateurs
        if user.is_superuser or user.is_staff:
            return Collaborator.objects.all()
        
        # Filtrer par organisation
        user_orgs = user.organization_ids or [user.organization_id]
        return Collaborator.objects.filter(organization_id__in=user_orgs)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CollaboratorCreateSerializer
        return CollaboratorSerializer
    
    def perform_create(self, serializer):
        perm = HasRolePermission('governance', 'create')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission d'ajouter un collaborateur.")
        serializer.save()
    
    def perform_update(self, serializer):
        perm = HasRolePermission('governance', 'update')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de modifier ce collaborateur.")
        serializer.save()
    
    def perform_destroy(self, instance):
        perm = HasRolePermission('governance', 'delete')
        if not perm.has_permission(self.request, self):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous n'avez pas la permission de supprimer ce collaborateur.")
        instance.delete()
