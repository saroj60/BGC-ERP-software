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
    def get_queryset(self):
        user = self.request.user
        return EmployeeProfile.objects.filter(company=user.company) if user.company else EmployeeProfile.objects.none()
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    queryset = EmployeeProfile.objects.all()
    serializer_class = EmployeeProfileSerializer
    permission_classes = [IsAuthenticated]

class JobPostingViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        return JobPosting.objects.filter(company=user.company).order_by('-posted_date') if user.company else JobPosting.objects.none()
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    queryset = JobPosting.objects.all().order_by('-posted_date')
    serializer_class = JobPostingSerializer
    permission_classes = [IsAuthenticated]

class ApplicantViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    queryset = Applicant.objects.all().order_by('-application_date')
    serializer_class = ApplicantSerializer
    permission_classes = [IsAuthenticated]

    # Filter applicants by job
    def get_queryset(self):
        user = self.request.user
        queryset = Applicant.objects.filter(company=user.company).order_by('-application_date') if user.company else Applicant.objects.none()
        job_id = self.request.query_params.get('job_posting', None)
        if job_id is not None:
            queryset = queryset.filter(job_posting_id=job_id)
        return queryset

class TrainingProgramViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        return TrainingProgram.objects.filter(company=user.company).order_by('-date') if user.company else TrainingProgram.objects.none()
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    queryset = TrainingProgram.objects.all().order_by('-date')
    serializer_class = TrainingProgramSerializer
    permission_classes = [IsAuthenticated]

class TrainingRecordViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        return TrainingRecord.objects.filter(company=user.company) if user.company else TrainingRecord.objects.none()
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

    queryset = TrainingRecord.objects.all()
    serializer_class = TrainingRecordSerializer
    permission_classes = [IsAuthenticated]

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        return PerformanceReview.objects.filter(company=user.company).order_by('-review_date') if user.company else PerformanceReview.objects.none()

    queryset = PerformanceReview.objects.all().order_by('-review_date')
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the reviewer to the logged in user
        serializer.save(reviewer=self.request.user, company=self.request.user.company)
