from rest_framework import viewsets
from .models import AppNotification
from .serializers import AppNotificationSerializer, AppNotificationUpdateSerializer


class AppNotificationViewSet(viewsets.ModelViewSet):
    queryset = AppNotification.objects.all()
    serializer_class = AppNotificationSerializer
    filterset_fields = ['type', 'is_read', 'target_user_id']
    search_fields = ['title', 'message']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return AppNotificationUpdateSerializer
        return AppNotificationSerializer
    
    def get_queryset(self):
        # Users can only see their own notifications
        return AppNotification.objects.filter(target_user_id=self.request.user.id)
