
import os
import django
import sys
from django.db.models import Sum, Value
from django.db.models.functions import Coalesce

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_backend.settings')
django.setup()

from projects.models import Project
from materials.models import MaterialRequest
from reports.models import DailySiteReport
from django.contrib.auth import get_user_model

User = get_user_model()
admin_user = User.objects.get(email='bhagatgrouppvt@gmail.com')

print(f"User: {admin_user.role}")

projects = Project.objects.all()
if admin_user.is_admin():
    print("User is Admin")
else:
    print("User is NOT Admin")

print(f"Total Projects Count: {projects.count()}")

try:
    project_expenses_data = projects.annotate(
        total_expense=Coalesce(Sum('expenses__amount'), Value(0))
    ).values('id', 'name', 'total_expense')
    print("Annotation success")
    print(list(project_expenses_data))
except Exception as e:
    print(f"Annotation failed: {e}")
