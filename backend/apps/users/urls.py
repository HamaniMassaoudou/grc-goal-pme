from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserAccountViewSet, RoleDefinitionViewSet, UserSessionViewSet,
    SecurityAuditLogViewSet, SecuritySettingsViewSet
)

router = DefaultRouter()
router.register(r'users', UserAccountViewSet, basename='useraccount')
router.register(r'roles', RoleDefinitionViewSet, basename='roledefinition')
router.register(r'sessions', UserSessionViewSet, basename='usersession')
router.register(r'audit-logs', SecurityAuditLogViewSet, basename='securityauditlog')
router.register(r'security-settings', SecuritySettingsViewSet, basename='securitysettings')

urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
