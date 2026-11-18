from rest_framework import serializers
from django.core.exceptions import ValidationError
from .models import UserAccount, RoleDefinition, UserSession, SecurityAuditLog, SecuritySettings, InvitationToken
from .validators import CustomMinimumLengthValidator, CustomComplexityValidator


class RoleDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleDefinition
        fields = '__all__'


class UserAccountSerializer(serializers.ModelSerializer):
    roles = RoleDefinitionSerializer(many=True, read_only=True, source='role_definitions')
    organization_id = serializers.CharField(source='organization.id', read_only=True)
    
    class Meta:
        model = UserAccount
        fields = [
            'id', 'first_name', 'last_name', 'name', 'email', 'phone',
            'job_title', 'department', 'organization', 'organization_id', 'organization_ids',
            'organization_name', 'role_ids', 'status', 'must_change_password',
            'mfa_enabled', 'failed_login_attempts', 'locked_until',
            'created_at', 'last_login_at', 'last_login_ip', 'avatar_color',
            'roles', 'is_active', 'is_staff'
        ]
        read_only_fields = ['id', 'created_at', 'last_login_at', 'last_login_ip']


class UserAccountCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    organization_id = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = UserAccount
        fields = [
            'id', 'first_name', 'last_name', 'name', 'email', 'phone',
            'job_title', 'department', 'organization_id', 'organization_ids',
            'organization_name', 'role_ids', 'status', 'password',
            'must_change_password', 'mfa_enabled', 'avatar_color'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'name': {'required': True},
            'email': {'required': True}
        }
    
    def validate_password(self, value):
        # Appliquer les validators personnalisés
        min_length_validator = CustomMinimumLengthValidator()
        complexity_validator = CustomComplexityValidator()
        
        try:
            min_length_validator.validate(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        
        try:
            complexity_validator.validate(value)
        except ValidationError as e:
            if hasattr(e, 'messages'):
                raise serializers.ValidationError(e.messages)
            raise serializers.ValidationError(str(e))
        
        return value
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        organization_id = validated_data.pop('organization_id', None)

        # If organization_id is provided, set the organization ForeignKey
        if organization_id:
            from apps.organizations.models import Organization
            try:
                organization = Organization.objects.get(id=organization_id)
                validated_data['organization'] = organization
            except Organization.DoesNotExist:
                pass

        user = UserAccount.objects.create_user(password=password, **validated_data)
        return user


class UserAccountUpdateSerializer(serializers.ModelSerializer):
    organization_id = serializers.CharField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = UserAccount
        fields = [
            'first_name', 'last_name', 'name', 'phone', 'job_title',
            'department', 'organization', 'organization_id', 'organization_ids',
            'organization_name', 'role_ids', 'status', 'must_change_password',
            'mfa_enabled', 'avatar_color'
        ]
    
    def update(self, instance, validated_data):
        organization_id = validated_data.pop('organization_id', None)
        
        # If organization_id is provided, set the organization ForeignKey
        if organization_id:
            from apps.organizations.models import Organization
            try:
                organization = Organization.objects.get(id=organization_id)
                validated_data['organization'] = organization
            except Organization.DoesNotExist:
                pass
        
        return super().update(instance, validated_data)


class UserSessionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = UserSession
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'last_activity_at']


class SecurityAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityAuditLog
        fields = '__all__'
        read_only_fields = ['id', 'timestamp']


class SecuritySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecuritySettings
        fields = '__all__'


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class InvitationTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvitationToken
        fields = '__all__'
        read_only_fields = ['id', 'token', 'created_at', 'accepted_at']


class CreateInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    organization_id = serializers.CharField(required=True)
    role_ids = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    expires_hours = serializers.IntegerField(default=168)  # 7 jours par défaut
