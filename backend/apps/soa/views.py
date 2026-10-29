from rest_framework import viewsets
from .models import SoAControl
from .serializers import SoAControlSerializer, SoAControlCreateSerializer


class SoAControlViewSet(viewsets.ModelViewSet):
    queryset = SoAControl.objects.all()
    serializer_class = SoAControlSerializer
    filterset_fields = ['organization', 'domain', 'is_applicable', 'implementation_status']
    search_fields = ['code', 'title']
    ordering = ['code']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SoAControlCreateSerializer
        return SoAControlSerializer
