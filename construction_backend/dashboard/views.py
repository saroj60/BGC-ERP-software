from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Value, DecimalField, Q
from django.db.models.functions import Coalesce, TruncMonth

from projects.models import Project, Task
from materials.models import MaterialRequest
from reports.models import DailySiteReport, Attendance, Worker
from expenses.models import Expense
from vehicles.models import FuelUsage, MaintenanceRecord


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        user = request.user

        projects = Project.objects.all()
        material_requests = MaterialRequest.objects.all()
        reports = DailySiteReport.objects.filter(date=today)

        if user.is_admin():
            pass
        elif user.is_project_manager():
            projects = projects.filter(project_manager=user)
            material_requests = material_requests.filter(project__project_manager=user)
            reports = reports.filter(project__project_manager=user)
        elif user.is_site_engineer():
            projects = projects.filter(site_engineers=user)
            material_requests = material_requests.filter(project__site_engineers=user)
            reports = reports.filter(project__site_engineers=user)
        else:
            projects = Project.objects.none()
            material_requests = MaterialRequest.objects.none()
            reports = DailySiteReport.objects.none()

        project_expenses_data = projects.annotate(
            total_expense=Coalesce(Sum('expenses__amount'), Value(0, output_field=DecimalField()))
        ).values('id', 'name', 'total_expense', 'budget')

        return Response({
            'total_projects': projects.count(),
            'todays_reports': reports.count(),
            'project_expenses': list(project_expenses_data),
            'pending_material_requests': material_requests.filter(status=MaterialRequest.Status.REQUESTED).count()
        })


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Scope querysets by role
        projects = Project.objects.all()
        if user.is_project_manager():
            projects = projects.filter(project_manager=user)
        elif user.is_site_engineer():
            projects = projects.filter(site_engineers=user)

        project_ids = list(projects.values_list('id', flat=True))

        expenses = Expense.objects.filter(project_id__in=project_ids)
        attendance = Attendance.objects.filter(project_id__in=project_ids)
        tasks = Task.objects.filter(project_id__in=project_ids)
        workers = Worker.objects.filter(project_id__in=project_ids)

        # ── KPI Summary ──────────────────────────────────────────────────
        total_budget = float(projects.aggregate(
            v=Coalesce(Sum('budget'), Value(0, output_field=DecimalField())))['v'])
        total_expense = float(expenses.aggregate(
            v=Coalesce(Sum('amount'), Value(0, output_field=DecimalField())))['v'])
        budget_utilization = round((total_expense / total_budget * 100), 1) if total_budget > 0 else 0

        total_attendance = attendance.count()
        present_count = attendance.filter(present=True).count()
        attendance_rate = round((present_count / total_attendance * 100), 1) if total_attendance > 0 else 0

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='COMPLETED').count()
        task_completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0

        fuel_cost = float(FuelUsage.objects.filter(vehicle__project_id__in=project_ids).aggregate(
            v=Coalesce(Sum('cost'), Value(0, output_field=DecimalField())))['v'])
        maint_cost = float(MaintenanceRecord.objects.filter(vehicle__project_id__in=project_ids).aggregate(
            v=Coalesce(Sum('cost'), Value(0, output_field=DecimalField())))['v'])

        kpis = {
            'total_projects': projects.count(),
            'ongoing_projects': projects.filter(status='ONGOING').count(),
            'completed_projects': projects.filter(status='COMPLETED').count(),
            'total_budget': total_budget,
            'total_expense': total_expense,
            'budget_utilization': budget_utilization,
            'total_workers': workers.count(),
            'attendance_rate': attendance_rate,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'task_completion_rate': task_completion_rate,
            'vehicle_fuel_cost': fuel_cost,
            'vehicle_maintenance_cost': maint_cost,
        }

        # ── Cost Reports ─────────────────────────────────────────────────
        expense_by_category = list(
            expenses.values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        for item in expense_by_category:
            item['total'] = float(item['total'])

        expense_by_project = []
        for p in projects.annotate(
            total_expense=Coalesce(Sum('expenses__amount'), Value(0, output_field=DecimalField()))
        ).order_by('-total_expense'):
            expense_by_project.append({
                'id': p.id, 'name': p.name,
                'budget': float(p.budget),
                'total_expense': float(p.total_expense),
                'status': p.status,
            })

        # Monthly trend – last 6 months
        from dateutil.relativedelta import relativedelta
        six_months_ago = (timezone.now().date().replace(day=1)) - relativedelta(months=5)
        monthly_raw = list(
            expenses.filter(expense_date__gte=six_months_ago)
            .annotate(month=TruncMonth('expense_date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        monthly_trend = [{'month': str(m['month'])[:7], 'total': float(m['total'])} for m in monthly_raw]

        # ── Productivity Analysis ────────────────────────────────────────
        thirty_days_ago = timezone.now().date() - timezone.timedelta(days=30)
        attendance_by_project = []
        for p in projects[:10]:
            att = attendance.filter(project=p, date__gte=thirty_days_ago)
            total = att.count()
            present = att.filter(present=True).count()
            attendance_by_project.append({
                'project': p.name, 'total': total,
                'present': present, 'absent': total - present,
                'rate': round((present / total * 100), 1) if total > 0 else 0,
            })

        task_status_breakdown = list(tasks.values('status').annotate(count=Count('id')))

        task_by_project = []
        for p in projects[:8]:
            t = tasks.filter(project=p)
            total = t.count()
            done = t.filter(status='COMPLETED').count()
            task_by_project.append({
                'project': p.name, 'total': total,
                'completed': done,
                'rate': round((done / total * 100), 1) if total > 0 else 0,
            })

        worker_by_role = list(workers.values('role').annotate(count=Count('id')).order_by('-count'))

        return Response({
            'kpis': kpis,
            'cost_report': {
                'by_category': expense_by_category,
                'by_project': expense_by_project,
                'monthly_trend': monthly_trend,
            },
            'productivity': {
                'attendance_by_project': attendance_by_project,
                'task_status_breakdown': task_status_breakdown,
                'task_by_project': task_by_project,
                'worker_by_role': worker_by_role,
            }
        })
