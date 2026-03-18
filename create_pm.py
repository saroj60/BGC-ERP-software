import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/saroj/Desktop/BGC/construction_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_backend.settings')
django.setup()

from accounts.models import User

email = "sarojbhagat666@gmail.com"
password = "password123" # Simple password for testing, user can change later if we had that feature

try:
    if User.objects.filter(email=email).exists():
        print(f"User {email} already exists.")
        user = User.objects.get(email=email)
        user.set_password(password)
        user.role = "PROJECT_MANAGER"
        user.save()
        print(f"Updated password and ensured role is PROJECT_MANAGER.")
    else:
        user = User.objects.create_user(email=email, password=password)
        user.role = "PROJECT_MANAGER"
        user.save()
        print(f"Created new user: {email} with role PROJECT_MANAGER")
except Exception as e:
    print(f"Error: {e}")
