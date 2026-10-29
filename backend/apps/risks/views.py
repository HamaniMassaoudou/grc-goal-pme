from rest_framework import viewsets
from .models import Risk
from .serializers import RiskSerializer, RiskCreateSerializer


class RiskViewSet(viewsets.ModelViewSet):
    queryset = Risk.objects.all()
    serializer_class = RiskSerializer
    filterset_fields = ['organization', 'level', 'status', 'strategy']
    search_fields = ['code', 'title', 'owner']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RiskCreateSerializer
        return RiskSerializer
