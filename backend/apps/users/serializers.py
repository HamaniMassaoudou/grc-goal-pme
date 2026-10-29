from rest_framework import serializers
from .models import UserAccount, RoleDefinition, UserSession, SecurityAuditLog, SecuritySettings


class RoleDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleDefinition
        fields = '__all__'


class UserAccountSerializer(serializers.ModelSerializer):
    roles = RoleDefinitionSerializer(many=True, read_only=True, source='role_definitions')
    
    class Meta:
        model = UserAccount
        fields = [
            'id', 'first_name', 'last_name', 'name', 'email', 'phone',
            'job_title', 'department', 'organization_id', 'organization_ids',
            'organization_name', 'role_ids', 'status', 'must_change_password',
            'mfa_enabled', 'failed_login_attempts', 'locked_until',
            'created_at', 'last_login_at', 'last_login_ip', 'avatar_color',
            'roles', 'is_active', 'is_staff'
        ]
        read_only_fields = ['id', 'created_at', 'last_login_at', 'last_login_ip']


class UserAccountCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = UserAccount
        fields = [
            'id', 'first_name', 'last_name', 'name', 'email', 'phone',
            'job_title', 'department', 'organization_id', 'organization_ids',
            'organization_name', 'role_ids', 'status', 'password',
            'must_change_password', 'mfa_enabled', 'avatar_color'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = UserAccount.objects.create_user(email=validated_data['email'], password=password, **validated_data)
        return user


class UserAccountUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = [
            'first_name', 'last_name', 'name', 'phone', 'job_title',
            'department', 'organization_id', 'organization_ids',
            'organization_name', 'role_ids', 'status', 'must_change_password',
            'mfa_enabled', 'avatar_color'
        ]


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
