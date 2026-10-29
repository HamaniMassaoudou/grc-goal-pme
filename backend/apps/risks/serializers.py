from rest_framework import serializers
from .models import Risk


class RiskSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Risk
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class RiskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Risk
        fields = [
            'code', 'title', 'description', 'asset', 'threat', 'vulnerability',
            'owner', 'probability', 'impact', 'strategy', 'treatment_notes',
            'residual_probability', 'residual_impact', 'status', 'organization'
        ]
