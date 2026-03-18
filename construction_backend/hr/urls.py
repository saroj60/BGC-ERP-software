from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeProfileViewSet, JobPostingViewSet, ApplicantViewSet, 
    TrainingProgramViewSet, TrainingRecordViewSet, PerformanceReviewViewSet
)

router = DefaultRouter()
router.register(r'employees', EmployeeProfileViewSet, basename='employee')
router.register(r'jobs', JobPostingViewSet, basename='job')
router.register(r'applicants', ApplicantViewSet, basename='applicant')
router.register(r'trainings', TrainingProgramViewSet, basename='training')
router.register(r'training-records', TrainingRecordViewSet, basename='training_record')
router.register(r'reviews', PerformanceReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
