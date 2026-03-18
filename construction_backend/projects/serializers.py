from rest_framework import serializers
from .models import Project, Task, ProjectDocument

class ProjectDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.email')

    class Meta:
        model = ProjectDocument
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    documents = ProjectDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source='project.name')
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.email')
    created_by_name = serializers.ReadOnlyField(source='created_by.email')

    class Meta:
        model = Task
        fields = '__all__'
