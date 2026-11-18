from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.organizations.urls')),
    path('api/', include('apps.governance.urls')),
    path('api/', include('apps.assets.urls')),
    path('api/', include('apps.risks.urls')),
    path('api/', include('apps.soa.urls')),
    path('api/', include('apps.actions.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.testing.urls')),
    path('api/', include('apps.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
