from rest_framework import serializers
from .models import MaterialRequest, InventoryItem

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class MaterialRequestSerializer(serializers.ModelSerializer):
    requested_by = serializers.StringRelatedField(read_only=True)
    status = serializers.ChoiceField(choices=MaterialRequest.Status.choices, read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = MaterialRequest
        fields = '__all__'

class MaterialStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer allowed for Project Managers to update status.
    """
    class Meta:
        model = MaterialRequest
        fields = ['status']
