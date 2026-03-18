
import os
import django
import sys

sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print(f"Total users: {User.objects.count()}")
for user in User.objects.all():
    print(f"ID: {user.id}, Email: {user.email}, Is Active: {user.is_active}, Is Staff: {user.is_staff}, Is Superuser: {user.is_superuser}")
