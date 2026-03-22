from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserSessionViewSet

# Create router for user management endpoints
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'sessions', UserSessionViewSet, basename='session')

urlpatterns = [
    path('', include(router.urls)),
]
