from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

# Create router for user management endpoints
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
