from rest_framework import viewsets, permissions
from .models import Vehicle, VehicleTracking, FuelUsage, MaintenanceRecord
from .serializers import VehicleSerializer, VehicleTrackingSerializer, FuelUsageSerializer, MaintenanceRecordSerializer

class IsAdminOrProjectManager(permissions.BasePermission):
    """
    Custom permission to allow Admins and Project Managers to edit,
    but others (like Site Engineers) to view only.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions (POST, PUT, DELETE)
        return request.user and (request.user.is_admin() or request.user.is_project_manager())

class VehicleViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    """
    API endpoint that allows vehicles to be viewed or edited.
    """
    queryset = Vehicle.objects.all().order_by('-created_at')
    serializer_class = VehicleSerializer
    permission_classes = [IsAdminOrProjectManager]
    
    def get_queryset(self):
        # Optionally filter by project if needed in future, currently showing all
        user = self.request.user
        return Vehicle.objects.filter(company=user.company).order_by('-created_at') if user.company else Vehicle.objects.none()

class VehicleTrackingViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleTrackingSerializer
    permission_classes = [IsAdminOrProjectManager]

    def get_queryset(self):
        user = self.request.user
        queryset = VehicleTracking.objects.filter(company=user.company).order_by('-timestamp') if user.company else VehicleTracking.objects.none()
        vehicle_id = self.request.query_params.get('vehicle', None)
        if vehicle_id is not None:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user, company=self.request.user.company)

class FuelUsageViewSet(viewsets.ModelViewSet):
    serializer_class = FuelUsageSerializer
    permission_classes = [IsAdminOrProjectManager]

    def get_queryset(self):
        user = self.request.user
        queryset = FuelUsage.objects.filter(company=user.company).order_by('-date', '-created_at') if user.company else FuelUsage.objects.none()
        vehicle_id = self.request.query_params.get('vehicle', None)
        if vehicle_id is not None:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user, company=self.request.user.company)

class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MaintenanceRecordSerializer
    permission_classes = [IsAdminOrProjectManager]

    def get_queryset(self):
        user = self.request.user
        queryset = MaintenanceRecord.objects.filter(company=user.company).order_by('-date', '-created_at') if user.company else MaintenanceRecord.objects.none()
        vehicle_id = self.request.query_params.get('vehicle', None)
        if vehicle_id is not None:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user, company=self.request.user.company)
