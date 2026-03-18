from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailySiteReportViewSet, ReportPhotoViewSet, AttendanceViewSet, WorkerViewSet

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet)
router.register(r'workers', WorkerViewSet)
router.register(r'photos', ReportPhotoViewSet)
router.register(r'', DailySiteReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
