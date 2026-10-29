from rest_framework import serializers
from .models import SoAControl


class SoAControlSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = SoAControl
        fields = '__all__'


class SoAControlCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoAControl
        fields = [
            'code', 'title', 'domain', 'description', 'is_applicable',
            'justification', 'implementation_status', 'maturity_level',
            'evidence_ref', 'gap_description', 'linked_action_id',
            'last_review_date', 'reviewed_by', 'organization'
        ]
