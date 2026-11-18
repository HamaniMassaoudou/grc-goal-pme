from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TestProtocolLog, UserTestSheet
from .serializers import TestProtocolLogSerializer, UserTestSheetSerializer


class TestProtocolLogViewSet(viewsets.ModelViewSet):
    queryset = TestProtocolLog.objects.all()
    serializer_class = TestProtocolLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['signed_by_tester']
    search_fields = ['tester_name', 'organization_name']
    ordering = ['-date']


class UserTestSheetViewSet(viewsets.ModelViewSet):
    queryset = UserTestSheet.objects.all()
    serializer_class = UserTestSheetSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['user_id', 'mentor_validated', 'signed_by_tester']
    search_fields = ['code', 'tester_name', 'session_title']
    ordering = ['-date', '-created_at']
