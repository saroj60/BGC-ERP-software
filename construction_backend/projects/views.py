from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Project, Task, ProjectDocument
from .serializers import ProjectSerializer, TaskSerializer, ProjectDocumentSerializer
from .permissions import IsAdminForProjects
from django.utils import timezone
from django.db.models import Sum

class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Projects to be viewed or edited.
    Access is restricted to Admin for creation/editing.
    PMs and Engineers have read-only access to assigned projects.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsAdminForProjects]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Project.objects.all()
        elif user.is_project_manager():
            return Project.objects.filter(project_manager=user)
        elif user.is_site_engineer():
            return Project.objects.filter(site_engineers=user)
        return Project.objects.none()

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        project = self.get_object()
        
        # Financial Progress
        budget = project.budget
        expenses_total = project.expenses.aggregate(total=Sum('amount'))['total'] or 0
        financial_progress = (float(expenses_total) / float(budget) * 100) if budget > 0 else 0
        
        # Task Progress
        total_tasks = project.tasks.count()
        completed_tasks = project.tasks.filter(status='COMPLETED').count()
        task_progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Timeline Progress
        timeline_progress = 0
        if project.start_date:
            today = timezone.now().date()
            end_date = project.end_date or today # If no end date, assume today for calculation
            total_days = (end_date - project.start_date).days
            if total_days > 0:
                days_elapsed = (today - project.start_date).days
                timeline_progress = max(0, min(100, (days_elapsed / total_days * 100)))
            elif today >= project.start_date:
                timeline_progress = 100
                
        return Response({
            'financial': {
                'budget': budget,
                'spent': expenses_total,
                'percentage': round(financial_progress, 1)
            },
            'tasks': {
                'total': total_tasks,
                'completed': completed_tasks,
                'percentage': round(task_progress, 1)
            },
            'timeline': {
                'start_date': project.start_date,
                'end_date': project.end_date,
                'percentage': round(timeline_progress, 1)
            }
        })

class TaskViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing tasks within projects.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Task.objects.all()
        elif user.is_project_manager():
            # PMs can see tasks for projects they manage
            return Task.objects.filter(project__project_manager=user)
        elif user.is_site_engineer():
            # Engineers can only see tasks assigned to them
            return Task.objects.filter(assigned_to=user)
        return Task.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ProjectDocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for project documents.
    """
    queryset = ProjectDocument.objects.all()
    serializer_class = ProjectDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return ProjectDocument.objects.all()
        elif user.is_project_manager():
            return ProjectDocument.objects.filter(project__project_manager=user)
        elif user.is_site_engineer():
            return ProjectDocument.objects.filter(project__site_engineers=user)
        return ProjectDocument.objects.none()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
