import os
import re

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# HR VIEWS
patch_file('construction_backend/hr/views.py', [
    ("class EmployeeProfileViewSet(viewsets.ModelViewSet):", "class EmployeeProfileViewSet(viewsets.ModelViewSet):\n    def get_queryset(self):\n        user = self.request.user\n        return EmployeeProfile.objects.filter(company=user.company) if user.company else EmployeeProfile.objects.none()\n    def perform_create(self, serializer):\n        serializer.save(company=self.request.user.company)\n"),
    ("class JobPostingViewSet(viewsets.ModelViewSet):", "class JobPostingViewSet(viewsets.ModelViewSet):\n    def get_queryset(self):\n        user = self.request.user\n        return JobPosting.objects.filter(company=user.company).order_by('-posted_date') if user.company else JobPosting.objects.none()\n    def perform_create(self, serializer):\n        serializer.save(company=self.request.user.company)\n"),
    ("queryset = super().get_queryset()", "user = self.request.user\n        queryset = Applicant.objects.filter(company=user.company).order_by('-application_date') if user.company else Applicant.objects.none()"),
    ("class ApplicantViewSet(viewsets.ModelViewSet):", "class ApplicantViewSet(viewsets.ModelViewSet):\n    def perform_create(self, serializer):\n        serializer.save(company=self.request.user.company)\n"),
    ("class TrainingProgramViewSet(viewsets.ModelViewSet):", "class TrainingProgramViewSet(viewsets.ModelViewSet):\n    def get_queryset(self):\n        user = self.request.user\n        return TrainingProgram.objects.filter(company=user.company).order_by('-date') if user.company else TrainingProgram.objects.none()\n    def perform_create(self, serializer):\n        serializer.save(company=self.request.user.company)\n"),
    ("class TrainingRecordViewSet(viewsets.ModelViewSet):", "class TrainingRecordViewSet(viewsets.ModelViewSet):\n    def get_queryset(self):\n        user = self.request.user\n        return TrainingRecord.objects.filter(company=user.company) if user.company else TrainingRecord.objects.none()\n    def perform_create(self, serializer):\n        serializer.save(company=self.request.user.company)\n"),
    ("class PerformanceReviewViewSet(viewsets.ModelViewSet):", "class PerformanceReviewViewSet(viewsets.ModelViewSet):\n    def get_queryset(self):\n        user = self.request.user\n        return PerformanceReview.objects.filter(company=user.company).order_by('-review_date') if user.company else PerformanceReview.objects.none()\n"),
    ("serializer.save(reviewer=self.request.user)", "serializer.save(reviewer=self.request.user, company=self.request.user.company)"),
])

# REPORTS VIEWS
patch_file('construction_backend/reports/views.py', [
    ("queryset = DailySiteReport.objects.all()\n\n        if user.is_admin():", "queryset = DailySiteReport.objects.filter(company=user.company) if user.company else DailySiteReport.objects.none()\n\n        if user.is_admin():"),
    ("serializer.save()", "serializer.save(company=self.request.user.company)"),
    ("def get_queryset(self):\n        user = self.request.user\n        queryset = Worker.objects.all()", "def get_queryset(self):\n        user = self.request.user\n        queryset = Worker.objects.filter(company=user.company) if user.company else Worker.objects.none()"),
    ("def get_queryset(self):\n        user = self.request.user\n        queryset = Attendance.objects.all()", "def get_queryset(self):\n        user = self.request.user\n        queryset = Attendance.objects.filter(company=user.company) if user.company else Attendance.objects.none()"),
    ("class ReportPhotoViewSet(viewsets.ModelViewSet):", "class ReportPhotoViewSet(viewsets.ModelViewSet):\n    def get_queryset(self):\n        user = self.request.user\n        return ReportPhoto.objects.filter(company=user.company) if user.company else ReportPhoto.objects.none()\n"),
])

# TENDERS VIEWS
patch_file('construction_backend/tenders/views.py', [
    ("class TenderViewSet(viewsets.ModelViewSet):", "class TenderViewSet(viewsets.ModelViewSet):\n    def get_queryset(self):\n        user = self.request.user\n        return Tender.objects.filter(company=user.company).order_by('-issue_date') if user.company else Tender.objects.none()\n"),
    ("serializer.save(created_by=self.request.user)", "serializer.save(created_by=self.request.user, company=self.request.user.company)"),
    ("class BidViewSet(viewsets.ModelViewSet):", "class BidViewSet(viewsets.ModelViewSet):\n    def perform_create(self, serializer):\n        serializer.save(company=self.request.user.company)\n"),
    ("queryset = super().get_queryset()", "user = self.request.user\n        queryset = Bid.objects.filter(company=user.company).order_by('-submission_date') if user.company else Bid.objects.none()"),
])

# VEHICLES VIEWS
patch_file('construction_backend/vehicles/views.py', [
    ("return Vehicle.objects.all().order_by('-created_at')", "user = self.request.user\n        return Vehicle.objects.filter(company=user.company).order_by('-created_at') if user.company else Vehicle.objects.none()"),
    ("queryset = VehicleTracking.objects.all().order_by('-timestamp')", "user = self.request.user\n        queryset = VehicleTracking.objects.filter(company=user.company).order_by('-timestamp') if user.company else VehicleTracking.objects.none()"),
    ("queryset = FuelUsage.objects.all().order_by('-date', '-created_at')", "user = self.request.user\n        queryset = FuelUsage.objects.filter(company=user.company).order_by('-date', '-created_at') if user.company else FuelUsage.objects.none()"),
    ("queryset = MaintenanceRecord.objects.all().order_by('-date', '-created_at')", "user = self.request.user\n        queryset = MaintenanceRecord.objects.filter(company=user.company).order_by('-date', '-created_at') if user.company else MaintenanceRecord.objects.none()"),
    ("serializer.save(recorded_by=self.request.user)", "serializer.save(recorded_by=self.request.user, company=self.request.user.company)"),
    ("class VehicleViewSet(viewsets.ModelViewSet):", "class VehicleViewSet(viewsets.ModelViewSet):\n    def perform_create(self, serializer):\n        serializer.save(company=self.request.user.company)\n"),
])

print("Patched all remaining views!")
