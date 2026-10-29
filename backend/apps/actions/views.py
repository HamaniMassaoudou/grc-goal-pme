from rest_framework import viewsets
from .models import CorrectiveAction
from .serializers import CorrectiveActionSerializer, CorrectiveActionCreateSerializer


class CorrectiveActionViewSet(viewsets.ModelViewSet):
    queryset = CorrectiveAction.objects.all()
    serializer_class = CorrectiveActionSerializer
    filterset_fields = ['organization', 'source', 'priority', 'status']
    search_fields = ['code', 'title', 'owner']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CorrectiveActionCreateSerializer
        return CorrectiveActionSerializer
