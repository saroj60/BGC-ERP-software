from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EmployeeProfile, JobPosting, Applicant, TrainingProgram, TrainingRecord, PerformanceReview
from .serializers import (
    EmployeeProfileSerializer, JobPostingSerializer, ApplicantSerializer,
    TrainingProgramSerializer, TrainingRecordSerializer, PerformanceReviewSerializer
)

class EmployeeProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployeeProfile.objects.all()
    serializer_class = EmployeeProfileSerializer
    permission_classes = [IsAuthenticated]

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all().order_by('-posted_date')
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]

class ApplicantViewSet(viewsets.ModelViewSet):
    queryset = Applicant.objects.all().order_by('-application_date')
    serializer_class = ApplicantSerializer
    permission_classes = [IsAuthenticated]

    # Filter applicants by job
    def get_queryset(self):
        queryset = super().get_queryset()
        job_id = self.request.query_params.get('job_posting', None)
        if job_id is not None:
            queryset = queryset.filter(job_posting_id=job_id)
        return queryset

class TrainingProgramViewSet(viewsets.ModelViewSet):
    queryset = TrainingProgram.objects.all().order_by('-date')
    serializer_class = TrainingProgramSerializer
    permission_classes = [IsAuthenticated]

class TrainingRecordViewSet(viewsets.ModelViewSet):
    queryset = TrainingRecord.objects.all()
    serializer_class = TrainingRecordSerializer
    permission_classes = [IsAuthenticated]

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all().order_by('-review_date')
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the reviewer to the logged in user
        serializer.save(reviewer=self.request.user)
