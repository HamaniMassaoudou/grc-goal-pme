from rest_framework import viewsets
from .models import Asset
from .serializers import AssetSerializer, AssetCreateSerializer


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    filterset_fields = ['organization', 'category', 'criticality']
    search_fields = ['name', 'owner']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AssetCreateSerializer
        return AssetSerializer
