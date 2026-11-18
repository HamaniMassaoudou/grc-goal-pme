import os
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.http import FileResponse, Http404
from .models import EvidenceFile
from .serializers import EvidenceFileSerializer


class EvidenceFileViewSet(viewsets.ModelViewSet):
    queryset = EvidenceFile.objects.all()
    serializer_class = EvidenceFileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['linked_type', 'linked_id', 'organization']
    search_fields = ['title', 'filename', 'notes', 'sha256_hash']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = EvidenceFile.objects.all()
        
        # Filtre par organisation si l'utilisateur n'est pas super-admin
        if not (user.is_superuser or user.is_staff):
            user_orgs = user.organization_ids or [user.organization_id]
            qs = qs.filter(organization_id__in=user_orgs)
            
        linked_type = self.request.query_params.get('linked_type')
        if linked_type:
            qs = qs.filter(linked_type=linked_type)
            
        linked_id = self.request.query_params.get('linked_id')
        if linked_id:
            qs = qs.filter(linked_id=linked_id)
            
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        file_obj = self.request.FILES.get('file')
        filename = file_obj.name if file_obj else ''
        file_size = file_obj.size if file_obj else 0
        mime_type = getattr(file_obj, 'content_type', '')

        # Auto-remplir l'organisation et l'utilisateur connecté
        org_id = self.request.data.get('organization') or getattr(user, 'organization_id', None)
        title = self.request.data.get('title') or filename or 'Preuve sans titre'

        serializer.save(
            title=title,
            filename=filename,
            file_size=file_size,
            mime_type=mime_type,
            uploaded_by_name=getattr(user, 'name', user.email),
            uploaded_by_email=user.email,
            organization_id=org_id
        )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        instance = self.get_object()
        if not instance.file or not os.path.exists(instance.file.path):
            raise Http404("Le fichier de preuve n'existe pas sur le serveur.")
        
        response = FileResponse(open(instance.file.path, 'rb'), content_type=instance.mime_type or 'application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{instance.filename}"'
        return response
