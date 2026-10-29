from rest_framework import serializers
from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AssetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['name', 'category', 'description', 'owner', 'criticality', 'location', 'organization']
