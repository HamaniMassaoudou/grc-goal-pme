from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CorrectiveActionViewSet

router = DefaultRouter()
router.register(r'actions', CorrectiveActionViewSet, basename='correctiveaction')

urlpatterns = [
    path('', include(router.urls)),
]
