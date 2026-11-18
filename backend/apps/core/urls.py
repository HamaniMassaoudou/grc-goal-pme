from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvidenceFileViewSet

router = DefaultRouter()
router.register(r'evidences', EvidenceFileViewSet, basename='evidencefile')

urlpatterns = [
    path('', include(router.urls)),
]
