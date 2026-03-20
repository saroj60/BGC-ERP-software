import os
import django
import sys

# Setup Django environment
sys.path.append('c:/Users/saroj/Desktop/BGC/construction_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_backend.settings')
django.setup()

from accounts.models import User

email = "bhagatgrouppvt@gmail.com"
new_password = "bhagat123"

try:
    user = User.objects.get(email=email)
    user.set_password(new_password)
    user.save()
    print(f"Password reset successful for {user.email}")
    print(f"New password: {new_password}")
except User.DoesNotExist:
    print(f"User with email {email} does not exist.")
except Exception as e:
    print(f"Error: {e}")
