from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Tender, Bid

class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = '__all__'
        read_only_fields = ('submission_date',)

class TenderSerializer(serializers.ModelSerializer):
    bids = BidSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = Tender
        fields = [
            'id', 'title', 'description', 'location', 'estimated_budget', 
            'issue_date', 'submission_deadline', 'status', 'created_by', 
            'created_by_name', 'created_at', 'updated_at', 'bids'
        ]
        read_only_fields = ('issue_date', 'created_at', 'updated_at', 'created_by')

class TenderListSerializer(serializers.ModelSerializer):
    """Lighter serializer for the list view, omitting full bid list"""
    bids_count = serializers.IntegerField(source='bids.count', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = Tender
        fields = [
            'id', 'title', 'location', 'estimated_budget', 
            'submission_deadline', 'status', 'created_by_name', 'bids_count'
        ]
