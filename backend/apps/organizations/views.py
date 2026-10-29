from rest_framework import viewsets
from .models import Organization
from .serializers import OrganizationSerializer, OrganizationCreateSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    filterset_fields = ['status', 'is_demo']
    search_fields = ['name', 'legal_name', 'sector']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrganizationCreateSerializer
        return OrganizationSerializer
