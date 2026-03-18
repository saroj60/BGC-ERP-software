from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MaterialRequest, InventoryItem
from .serializers import MaterialRequestSerializer, MaterialStatusUpdateSerializer, InventoryItemSerializer
from .permissions import CanManageMaterialRequests

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

class MaterialRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Material Requests.
    Engineers can request; Managers/Admins can approve/reject.
    """
    queryset = MaterialRequest.objects.all()
    serializer_class = MaterialRequestSerializer
    permission_classes = [IsAuthenticated, CanManageMaterialRequests]

    def get_queryset(self):
        user = self.request.user
        queryset = MaterialRequest.objects.all()

        if user.is_admin():
            pass
        elif user.is_project_manager():
            queryset = queryset.filter(project__project_manager=user)
        elif user.is_site_engineer():
            queryset = queryset.filter(project__site_engineers=user)
        else:
            return MaterialRequest.objects.none()
        
        return queryset
    permission_classes = [IsAuthenticated, CanManageMaterialRequests]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return MaterialStatusUpdateSerializer
        return MaterialRequestSerializer

    def perform_create(self, serializer):
        user = self.request.user
        # Auto-approve if created by Admin or Project Manager
        if user.is_admin() or user.is_project_manager():
            serializer.save(requested_by=user, status='APPROVED')
        else:
            serializer.save(requested_by=user)
