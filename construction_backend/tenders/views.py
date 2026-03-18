from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Tender, Bid
from .serializers import TenderSerializer, TenderListSerializer, BidSerializer

class TenderViewSet(viewsets.ModelViewSet):
    queryset = Tender.objects.all().order_by('-issue_date')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return TenderListSerializer
        return TenderSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def compare_bids(self, request, pk=None):
        """Returns all bids for a tender, sorted by lowest bid amount first"""
        tender = self.get_object()
        bids = tender.bids.all().order_by('bid_amount')
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all().order_by('-submission_date')
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        tender_id = self.request.query_params.get('tender', None)
        if tender_id is not None:
            queryset = queryset.filter(tender_id=tender_id)
        return queryset

    @action(detail=True, methods=['patch'])
    def respond(self, request, pk=None):
        """Action for Admin/PM to accept or reject a bid"""
        bid = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['ACCEPTED', 'REJECTED']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        bid.status = new_status
        bid.save()
        
        # Optional business logic: If a bid is accepted, mark Tender as AWARDED
        if new_status == 'ACCEPTED':
            tender = bid.tender
            tender.status = 'AWARDED'
            tender.save()
            
            # Automatically reject all other bids for this tender
            tender.bids.exclude(id=bid.id).update(status='REJECTED')
            
        return Response(BidSerializer(bid).data)
