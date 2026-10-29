from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppNotificationViewSet

router = DefaultRouter()
router.register(r'notifications', AppNotificationViewSet, basename='appnotification')

urlpatterns = [
    path('', include(router.urls)),
]
