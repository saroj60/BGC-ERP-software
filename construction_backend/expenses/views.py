from rest_framework import viewsets
from rest_framework.decorators import action
from django.http import HttpResponse
import csv
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from .serializers import ExpenseSerializer
from .permissions import CanManageExpenses

class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Project Expenses.
    Supports filtering by project. Delete restricted to Admins.
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, CanManageExpenses]

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expenses.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Project', 'Category', 'Description', 'Amount', 'Created By'])

        expenses = self.get_queryset()
        for expense in expenses:
            writer.writerow([
                expense.expense_date,
                expense.project.name,
                expense.category,
                expense.description,
                expense.amount,
                expense.created_by
            ])

        return response

    def get_queryset(self):
        queryset = Expense.objects.all()
        user = self.request.user

        if user.is_admin():
            pass # See all
        elif user.is_project_manager():
            queryset = queryset.filter(project__project_manager=user)
        elif user.is_site_engineer():
            queryset = queryset.filter(project__site_engineers=user)
        else:
            return Expense.objects.none()

        # Optional filtering by project
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
