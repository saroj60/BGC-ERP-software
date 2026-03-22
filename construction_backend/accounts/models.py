from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        PROJECT_MANAGER = "PROJECT_MANAGER", "Project Manager"
        SITE_ENGINEER = "SITE_ENGINEER", "Site Engineer"

    username = None
    email = models.EmailField('email address', unique=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.SITE_ENGINEER)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
    
    # ADMIN Role: Highest privilege level with unrestricted access
    # - Can create, update, deactivate users and assign roles
    # - Can view, edit, delete all resources across all projects
    # - Not restricted by project-level permissions
    # - Can access Django Admin panel (if is_staff=True)
    
    def is_admin(self):
        """Check if user has ADMIN role - highest privilege level"""
        return self.role == self.Role.ADMIN
    
    def is_project_manager(self):
        """Check if user has PROJECT_MANAGER role"""
        return self.role == self.Role.PROJECT_MANAGER
    
    def is_site_engineer(self):
        """Check if user has SITE_ENGINEER role"""
        return self.role == self.Role.SITE_ENGINEER
    
    def can_access_django_admin(self):
        """
        Check if user can access Django Admin panel.
        Only ADMIN role users with is_staff=True can access.
        SITE_ENGINEER and PROJECT_MANAGER are blocked even if is_staff=True.
        """
        return self.is_admin() and self.is_staff

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    token_jti = models.UUIDField(unique=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    device_name = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-last_active']

    def __str__(self):
        return f"{self.user.email} - {self.device_name or 'Unknown Device'} ({self.last_active})"
