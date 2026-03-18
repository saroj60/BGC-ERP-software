from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('project', 'category', 'amount', 'expense_date', 'created_by')
    list_filter = ('project', 'category', 'expense_date')
    search_fields = ('description', 'category')
