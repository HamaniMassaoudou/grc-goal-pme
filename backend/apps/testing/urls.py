from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestProtocolLogViewSet, UserTestSheetViewSet

router = DefaultRouter()
router.register(r'test-protocol', TestProtocolLogViewSet, basename='testprotocollog')
router.register(r'test-sheets', UserTestSheetViewSet, basename='usertestsheet')

urlpatterns = [
    path('', include(router.urls)),
]
