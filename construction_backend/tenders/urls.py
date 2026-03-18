from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TenderViewSet, BidViewSet

router = DefaultRouter()
router.register(r'bids', BidViewSet, basename='bid')
# Register 'tenders' with empty prefix to handle /api/tenders/ cleanly when included
router.register(r'', TenderViewSet, basename='tender')

urlpatterns = [
    path('', include(router.urls)),
]
