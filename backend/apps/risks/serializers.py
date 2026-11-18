from rest_framework import serializers
from .models import Risk


def calculate_risk_level(score):
    if score >= 15:
        return 'Critique'
    elif score >= 8:
        return 'Élevé'
    elif score >= 4:
        return 'Moyen'
    return 'Faible'


class RiskSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Risk
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class RiskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Risk
        fields = [
            'id', 'code', 'title', 'description', 'asset', 'threat', 'vulnerability',
            'owner', 'probability', 'impact', 'score', 'level', 'strategy', 'treatment_notes',
            'residual_probability', 'residual_impact', 'residual_score', 'residual_level',
            'status', 'organization'
        ]
        extra_kwargs = {
            'id': {'required': False},
            'score': {'required': False},
            'level': {'required': False},
            'residual_score': {'required': False},
            'residual_level': {'required': False},
        }

    def validate(self, attrs):
        prob = attrs.get('probability', 3)
        imp = attrs.get('impact', 3)
        calculated_score = prob * imp
        attrs['score'] = calculated_score
        attrs['level'] = calculate_risk_level(calculated_score)

        res_prob = attrs.get('residual_probability')
        res_imp = attrs.get('residual_impact')
        if res_prob is not None and res_imp is not None:
            res_score = res_prob * res_imp
            attrs['residual_score'] = res_score
            attrs['residual_level'] = calculate_risk_level(res_score)

        return attrs
