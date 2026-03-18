from django.db import models
from django.core.validators import FileExtensionValidator
from projects.models import Project
from .validators import validate_file_size

class DailySiteReport(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    date = models.DateField()
    weather = models.CharField(max_length=100)
    labor_count = models.IntegerField()
    work_done = models.TextField()
    issues = models.TextField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report - {self.project.name} - {self.date}"

class ReportPhoto(models.Model):
    report = models.ForeignKey(DailySiteReport, on_delete=models.CASCADE, related_name='photos')
    image = models.FileField(
        upload_to='site_reports/',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png']),
            validate_file_size
        ]
    )
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.report}"

class Worker(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='workers')
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100) # e.g. Mason, Labor, Carpenter
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role}) - {self.project.name}"

class Attendance(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True, blank=True, related_name='attendance_records')
    worker_name = models.CharField(max_length=100) # Keep for historical accuracy or if worker deleted
    role = models.CharField(max_length=100)
    present = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.worker_name} - {self.date} ({'Present' if self.present else 'Absent'})"
