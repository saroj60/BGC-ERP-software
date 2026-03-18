from django.db import models
from accounts.models import User

class EmployeeProfile(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        TERMINATED = 'TERMINATED', 'Terminated'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    date_of_joining = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=150, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    def __str__(self):
        return f"{self.user.name} - {self.designation}"


class JobPosting(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        CLOSED = 'CLOSED', 'Closed'

    title = models.CharField(max_length=200)
    description = models.TextField()
    department = models.CharField(max_length=100)
    vacancies = models.IntegerField(default=1)
    location = models.CharField(max_length=200)
    posted_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)

    def __str__(self):
        return self.title


class Applicant(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        INTERVIEWING = 'INTERVIEWING', 'Interviewing'
        OFFERED = 'OFFERED', 'Offered'
        REJECTED = 'REJECTED', 'Rejected'

    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applicants')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume_url = models.URLField(blank=True, null=True)
    application_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - {self.job_posting.title}"


class TrainingProgram(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    instructor = models.CharField(max_length=150)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2, help_text="Duration in hours")

    def __str__(self):
        return self.title


class TrainingRecord(models.Model):
    class Status(models.TextChoices):
        ENROLLED = 'ENROLLED', 'Enrolled'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        NO_SHOW = 'NO_SHOW', 'No Show'

    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='training_records')
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='records')
    completion_status = models.CharField(max_length=20, choices=Status.choices, default=Status.ENROLLED)
    feedback_score = models.IntegerField(null=True, blank=True, help_text="Rating out of 5")

    def __str__(self):
        return f"{self.employee.user.name} - {self.program.title}"


class PerformanceReview(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='submitted_reviews')
    review_date = models.DateField(auto_now_add=True)
    rating = models.IntegerField(help_text="Rating from 1 to 5")
    comments = models.TextField()
    goals_for_next_period = models.TextField(blank=True)

    def __str__(self):
        return f"Review for {self.employee.user.name} on {self.review_date}"
