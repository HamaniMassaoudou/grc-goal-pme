from rest_framework import serializers
from .models import TestProtocolLog, UserTestSheet


class TestProtocolLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestProtocolLog
        fields = '__all__'


class UserTestSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTestSheet
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
