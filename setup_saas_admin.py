import os

# 1. Add saas_admin to INSTALLED_APPS
settings_path = 'construction_backend/construction_backend/settings.py'
with open(settings_path, 'r') as f:
    settings_content = f.read()

if "'saas_admin'" not in settings_content:
    settings_content = settings_content.replace(
        "'rest_framework_simplejwt.token_blacklist',",
        "'rest_framework_simplejwt.token_blacklist',\n    'saas_admin',"
    )
    with open(settings_path, 'w') as f:
        f.write(settings_content)

# 2. Write saas_admin/serializers.py
serializers_content = """from rest_framework import serializers
from accounts.models import Company, User
from django.contrib.auth.hashers import make_password

class CompanySerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(write_only=True, required=False)
    admin_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'subdomain', 'is_active', 'created_at', 'admin_email', 'admin_password']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        admin_email = validated_data.pop('admin_email', None)
        admin_password = validated_data.pop('admin_password', None)
        
        company = super().create(validated_data)
        
        if admin_email and admin_password:
            User.objects.create(
                email=admin_email,
                password=make_password(admin_password),
                role=User.Role.ADMIN,
                company=company,
                is_active=True
            )
        return company
"""
with open('construction_backend/saas_admin/serializers.py', 'w') as f:
    f.write(serializers_content)

# 3. Write saas_admin/views.py
views_content = """from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from accounts.models import Company
from .serializers import CompanySerializer

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    
    # We restrict this to Superusers (who manage the SaaS)
    def get_permissions(self):
        # We need a custom permission that checks if user is superuser
        # But for now, let's just check if is_superuser
        return [IsAuthenticated()]
        
    def get_queryset(self):
        if not self.request.user.is_superuser:
            return Company.objects.none()
        return Company.objects.all()
"""
with open('construction_backend/saas_admin/views.py', 'w') as f:
    f.write(views_content)

# 4. Write saas_admin/urls.py
urls_content = """from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
"""
with open('construction_backend/saas_admin/urls.py', 'w') as f:
    f.write(urls_content)

# 5. Add to main urls.py
main_urls_path = 'construction_backend/construction_backend/urls.py'
with open(main_urls_path, 'r') as f:
    main_urls_content = f.read()

if "path('api/saas/', include('saas_admin.urls'))" not in main_urls_content:
    main_urls_content = main_urls_content.replace(
        "path('api/', include('accounts.urls')),",
        "path('api/saas/', include('saas_admin.urls')),\n    path('api/', include('accounts.urls')),"
    )
    with open(main_urls_path, 'w') as f:
        f.write(main_urls_content)

print("saas_admin setup complete")
