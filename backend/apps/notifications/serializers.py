from rest_framework import serializers
from .models import AppNotification


class AppNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppNotification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AppNotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppNotification
        fields = ['is_read', 'read_at']
