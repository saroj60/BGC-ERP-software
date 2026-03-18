from django.contrib import admin
from .models import DailySiteReport, ReportPhoto, Attendance

@admin.register(DailySiteReport)
class DailySiteReportAdmin(admin.ModelAdmin):
    list_display = ('project', 'date', 'weather', 'labor_count')
    list_filter = ('date', 'project')
    search_fields = ('project__name', 'work_done')

@admin.register(ReportPhoto)
class ReportPhotoAdmin(admin.ModelAdmin):
    list_display = ('report', 'image', 'uploaded_at')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('worker_name', 'role', 'project', 'date', 'present')
    list_filter = ('project', 'date', 'role', 'present')
    search_fields = ('worker_name',)
