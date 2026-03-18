from rest_framework import viewsets, parsers, status
from rest_framework.decorators import action
from django.http import HttpResponse
import csv
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import DailySiteReport, ReportPhoto, Attendance, Worker
from .serializers import DailySiteReportSerializer, ReportPhotoSerializer, AttendanceSerializer, WorkerSerializer
from .permissions import CanManageReports

class DailySiteReportViewSet(viewsets.ModelViewSet):
    queryset = DailySiteReport.objects.all()
    serializer_class = DailySiteReportSerializer

    permission_classes = [IsAuthenticated, CanManageReports]

    def get_queryset(self):
        user = self.request.user
        queryset = DailySiteReport.objects.all()

        if user.is_admin():
            pass # Admin sees all
        elif user.is_project_manager():
            # PM sees reports for projects they manage
            queryset = queryset.filter(project__project_manager=user)
        elif user.is_site_engineer():
            # Engineer sees reports for projects they are assigned to
            queryset = queryset.filter(project__site_engineers=user)
        else:
            return DailySiteReport.objects.none()

        return queryset

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="site_reports.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Project', 'Weather', 'Labor Count', 'Work Done', 'Issues', 'Remarks'])

        reports = self.get_queryset()
        for report in reports:
            writer.writerow([
                report.date,
                report.project.name,
                report.weather,
                report.labor_count,
                report.work_done,
                report.issues,
                report.remarks
            ])

        return response

class ReportPhotoViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Report Photos.
    
    ADMIN: Full access (create/view/update/delete) ✅
    PROJECT_MANAGER: Full access (create/view/update/delete) ✅
    SITE_ENGINEER: Can create and view photos, cannot delete ✅
    
    Note: CanManageReports enforces role-based permissions
    - Create: SITE_ENGINEER, PROJECT_MANAGER, ADMIN
    - View: All authenticated users
    - Update/Delete: PROJECT_MANAGER, ADMIN only
    """
    queryset = ReportPhoto.objects.all()
    serializer_class = ReportPhotoSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    permission_classes = [IsAuthenticated, CanManageReports]  # FIX: Apply role-based permissions

    def perform_create(self, serializer):
        # Optional: Add extra validation here if needed
        serializer.save()

class WorkerViewSet(viewsets.ModelViewSet):
    """
    Manage Workers.
    - Site Engineers: Can view and add (create) workers for their projects.
    - Admin/PM: Full access.
    """
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [IsAuthenticated, CanManageReports] # Reusing report permissions for simplicity

    def get_queryset(self):
        user = self.request.user
        queryset = Worker.objects.all()

        if user.is_admin():
            pass
        elif user.is_project_manager():
            queryset = queryset.filter(project__project_manager=user)
        elif user.is_site_engineer():
            queryset = queryset.filter(project__site_engineers=user)
        else:
            return Worker.objects.none()
        
        # Allow filtering by project via query param
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, CanManageReports]

    def get_queryset(self):
        user = self.request.user
        queryset = Attendance.objects.all()

        if user.is_admin():
            pass
        elif user.is_project_manager():
            queryset = queryset.filter(project__project_manager=user)
        elif user.is_site_engineer():
            queryset = queryset.filter(project__site_engineers=user)
        else:
            return Attendance.objects.none()

        # Support filtering by project
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        # Support filtering by date
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)

        return queryset.order_by('-date', 'project')

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="attendance.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Project', 'Worker Name', 'Role', 'Status'])

        attendance_records = self.get_queryset()
        for record in attendance_records:
            writer.writerow([
                record.date,
                record.project.name,
                record.worker_name,
                record.role,
                'Present' if record.present else 'Absent'
            ])

        return response

    def create(self, request, *args, **kwargs):
        is_many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=is_many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
