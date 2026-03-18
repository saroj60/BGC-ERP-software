from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, VehicleTrackingViewSet, FuelUsageViewSet, MaintenanceRecordViewSet

router = DefaultRouter()
router.register(r'tracking', VehicleTrackingViewSet, basename='vehicle-tracking')
router.register(r'fuel', FuelUsageViewSet, basename='fuel-usage')
router.register(r'maintenance', MaintenanceRecordViewSet, basename='maintenance-record')
router.register(r'', VehicleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
