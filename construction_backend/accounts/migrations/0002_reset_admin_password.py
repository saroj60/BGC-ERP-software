from django.db import migrations
from django.contrib.auth.hashers import make_password

def reset_password(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    email = "bhagatgrouppvt@gmail.com"
    try:
        user = User.objects.get(email=email)
        user.password = make_password("bhagat123")
        user.is_active = True
        user.save()
    except User.DoesNotExist:
        # If the user doesn't exist, create it as a superuser
        User.objects.create(
            email=email,
            password=make_password("bhagat123"),
            is_active=True,
            is_staff=True,
            is_superuser=True,
            role="ADMIN"
        )

class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(reset_password),
    ]
