import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/saroj/Desktop/BGC/construction_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_backend.settings')
django.setup()

from accounts.models import User

email = "sarojbhagat666@gmail.com"

try:
    user = User.objects.get(email=email)
    print(f"User found: {user.email}")
    print(f"Role: {user.role}")
    print(f"Is Active: {user.is_active}")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"Last Login: {user.last_login}")
    print(f"ID: {user.id}")
except User.DoesNotExist:
    print(f"User with email {email} does not exist.")
except Exception as e:
    print(f"Error: {e}")
