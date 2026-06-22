from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from accounts.models import Company
from .serializers import CompanySerializer

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    
    # We restrict this to Superusers (who manage the SaaS)
    def get_permissions(self):
        # We need a custom permission that checks if user is superuser
        # But for now, let's just check if is_superuser
        return [IsAuthenticated()]
        
    def get_queryset(self):
        if not self.request.user.is_superuser:
            return Company.objects.none()
        return Company.objects.all()
