from rest_framework import serializers
from .models import EvidenceFile


class EvidenceFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    formatted_size = serializers.SerializerMethodField()

    class Meta:
        model = EvidenceFile
        fields = [
            'id', 'title', 'file', 'filename', 'file_size', 'formatted_size',
            'mime_type', 'sha256_hash', 'linked_type', 'linked_id', 'notes',
            'uploaded_by_name', 'uploaded_by_email', 'organization',
            'created_at', 'updated_at', 'file_url'
        ]
        read_only_fields = [
            'id', 'sha256_hash', 'file_size', 'filename', 'mime_type',
            'uploaded_by_name', 'uploaded_by_email',
            'created_at', 'updated_at', 'file_url', 'formatted_size'
        ]
        extra_kwargs = {
            'title': {'required': False},
            'notes': {'required': False},
        }

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_formatted_size(self, obj):
        size = obj.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} Ko"
        return f"{size / (1024 * 1024):.2f} Mo"
