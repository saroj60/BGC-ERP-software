from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MaterialRequestViewSet, InventoryItemViewSet

router = DefaultRouter()
router.register(r'requests', MaterialRequestViewSet)
router.register(r'inventory', InventoryItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
