from rest_framework import serializers
from .models import Expense
from vehicles.serializers import VehicleSerializer

class ExpenseSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'project', 'vehicle', 'vehicle_details', 'category', 'description', 'amount', 'expense_date', 'created_by', 'created_at']
