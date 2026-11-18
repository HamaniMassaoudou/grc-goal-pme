from rest_framework import serializers
from .models import CorrectiveAction, ActionComment


class ActionCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionComment
        fields = '__all__'
        read_only_fields = ['id']


class CorrectiveActionSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = CorrectiveAction
        fields = '__all__'
        read_only_fields = ['created_at']


class CorrectiveActionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorrectiveAction
        fields = [
            'id', 'code', 'title', 'description', 'source', 'linked_risk_id',
            'linked_control_code', 'owner', 'priority', 'due_date', 'status',
            'evidence_of_closure', 'comments', 'organization', 'closed_at'
        ]
        extra_kwargs = {
            'id': {'required': False},
            'closed_at': {'required': False},
            'comments': {'required': False},
        }
