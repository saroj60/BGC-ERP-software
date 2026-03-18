import os
import django
import sys
from pathlib import Path

# Setup Django environment
BASE_DIR = Path('c:/Users/saroj/Desktop/BGC/construction_backend')
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_backend.settings')
django.setup()

from materials.models import MaterialRequest
from accounts.models import User

# ... rest of script

print("--- Checking Users ---")
for u in User.objects.all():
    print(f"User: {u.email} | Role: {u.role} | Is Admin: {u.is_admin()}")

print("\n--- Checking Material Requests ---")
reqs = MaterialRequest.objects.all()
print(f"Total Requests: {reqs.count()}")
for r in reqs:
    print(f"ID: {r.id} | Material: {r.material_name} | Project: {r.project.name} | Req By: {r.requested_by.email} | Status: {r.status}")
