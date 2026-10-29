from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollaboratorViewSet

router = DefaultRouter()
router.register(r'collaborators', CollaboratorViewSet, basename='collaborator')

urlpatterns = [
    path('', include(router.urls)),
]
