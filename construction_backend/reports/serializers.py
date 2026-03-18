from rest_framework import serializers
from .models import DailySiteReport, ReportPhoto, Attendance, Worker

class ReportPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportPhoto
        fields = '__all__'

class DailySiteReportSerializer(serializers.ModelSerializer):
    photos = ReportPhotoSerializer(many=True, read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = DailySiteReport
        fields = '__all__'

class WorkerSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = Worker
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
