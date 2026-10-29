from rest_framework import serializers
from .models import Collaborator


class CollaboratorSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = Collaborator
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class CollaboratorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collaborator
        fields = [
            'organization', 'user', 'full_name', 'email', 'phone',
            'department', 'job_title', 'role_id', 'grc_responsibilities',
            'is_platform_user', 'invitation_status'
        ]
