from django.contrib import admin
from .models import TestProtocolLog, UserTestSheet


@admin.register(TestProtocolLog)
class TestProtocolLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'tester_name', 'organization_name', 'perceived_utility', 'signed_by_tester')
    search_fields = ('tester_name', 'organization_name')


@admin.register(UserTestSheet)
class UserTestSheetAdmin(admin.ModelAdmin):
    list_display = ('code', 'tester_name', 'session_title', 'date', 'global_score_percent', 'mentor_validated')
    search_fields = ('code', 'tester_name', 'tester_email')
