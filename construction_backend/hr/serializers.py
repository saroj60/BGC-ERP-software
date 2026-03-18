from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import EmployeeProfile, JobPosting, Applicant, TrainingProgram, TrainingRecord, PerformanceReview

class EmployeeProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = EmployeeProfile
        fields = '__all__'

class JobPostingSerializer(serializers.ModelSerializer):
    applicant_count = serializers.IntegerField(source='applicants.count', read_only=True)

    class Meta:
        model = JobPosting
        fields = '__all__'

class ApplicantSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_posting.title', read_only=True)

    class Meta:
        model = Applicant
        fields = '__all__'

class TrainingProgramSerializer(serializers.ModelSerializer):
    enrollment_count = serializers.IntegerField(source='records.count', read_only=True)

    class Meta:
        model = TrainingProgram
        fields = '__all__'

class TrainingRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.name', read_only=True)
    program_title = serializers.CharField(source='program.title', read_only=True)

    class Meta:
        model = TrainingRecord
        fields = '__all__'

class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.name', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = '__all__'
