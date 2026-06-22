from rest_framework import serializers
from accounts.models import Company, User
from django.contrib.auth.hashers import make_password

class CompanySerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(write_only=True, required=False)
    admin_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'subdomain', 'logo', 'theme_color', 'is_active', 'created_at', 'admin_email', 'admin_password']
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
