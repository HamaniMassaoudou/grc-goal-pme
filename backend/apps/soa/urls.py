from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SoAControlViewSet

router = DefaultRouter()
router.register(r'soa-controls', SoAControlViewSet, basename='soacontrol')

urlpatterns = [
    path('', include(router.urls)),
]
