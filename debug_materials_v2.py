import os
import django
import sys
from pathlib import Path

# Setup Django environment
# Use raw string for Windows path or forward slashes
current_dir = Path(__file__).resolve().parent
sys.path.append(str(current_dir / 'construction_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_backend.settings')

try:
    django.setup()
except Exception as e:
    print(f"Setup Error: {e}")
    sys.exit(1)

from materials.models import MaterialRequest
from accounts.models import User

print("\n--- Checking Users ---")
for u in User.objects.all():
    print(f"User: {u.email} | Role: {u.role} | Is Admin: {u.is_admin()}")

print("\n--- Checking Material Requests ---")
reqs = MaterialRequest.objects.all()
print(f"Total Requests: {reqs.count()}")
for r in reqs:
    print(f"ID: {r.id} | Material: {r.material_name} | Project: {r.project.name} | Req By: {r.requested_by.email} | Status: {r.status}")
