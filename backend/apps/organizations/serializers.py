from rest_framework import serializers
from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrganizationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            'name', 'legal_name', 'sector', 'size', 'address', 'phone',
            'contact_name', 'contact_email', 'security_officer', 'description',
            'grc_scope', 'status', 'is_demo'
        ]
