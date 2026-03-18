from rest_framework import serializers
from .models import Vehicle, VehicleTracking, FuelUsage, MaintenanceRecord
from projects.serializers import ProjectSerializer

class VehicleSerializer(serializers.ModelSerializer):
    # Optional: Expand project details in read operations if needed, but for now ID is likely sufficient or we can use nested serializer for read
    project_details = ProjectSerializer(source='project', read_only=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'name', 'number', 'photo', 'project', 'project_details', 'status', 'created_at', 'updated_at']

class VehicleTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleTracking
        fields = '__all__'

class FuelUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelUsage
        fields = '__all__'

class MaintenanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
