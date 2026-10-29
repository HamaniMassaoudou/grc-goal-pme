from rest_framework import viewsets
from .models import Collaborator
from .serializers import CollaboratorSerializer, CollaboratorCreateSerializer


class CollaboratorViewSet(viewsets.ModelViewSet):
    queryset = Collaborator.objects.all()
    serializer_class = CollaboratorSerializer
    filterset_fields = ['organization', 'invitation_status', 'is_platform_user']
    search_fields = ['full_name', 'email']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CollaboratorCreateSerializer
        return CollaboratorSerializer
