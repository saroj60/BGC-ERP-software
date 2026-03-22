from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserSession


class RoleBasedAdminSite(admin.AdminSite):
    """
    Custom Admin Site that restricts access to ADMIN role only.
    
    Security: Even if is_staff=True, SITE_ENGINEER and PROJECT_MANAGER 
    cannot access the Django Admin panel. Only ADMIN + is_staff can access.
    
    This provides defense-in-depth security by checking both:
    1. is_staff flag (standard Django permission)
    2. role field (custom application-level permission)
    """
    site_header = "Construction Management Admin"
    site_title = "Construction Admin"
    index_title = "Administration Panel"
    
    def has_permission(self, request):
        """
        Override to add role-based access control.
        Only allow access if user is authenticated, is_staff=True, AND has ADMIN role.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # CRITICAL: Only ADMIN role can access Django Admin
        # SITE_ENGINEER and PROJECT_MANAGER are blocked even if is_staff=True
        return request.user.can_access_django_admin()


# Replace the default admin site with our custom one
admin.site = RoleBasedAdminSite()


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'role', 'is_staff', 'is_active')
    list_filter = ('email', 'role', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('role',)}), # Add other fields like 'first_name', 'last_name' if added to model
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'password', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email',)
    ordering = ('email',)


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_name', 'ip_address', 'last_active', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'last_active')
    search_fields = ('user__email', 'ip_address', 'user_agent', 'device_name')
    readonly_fields = ('created_at', 'last_active')
    
    def has_add_permission(self, request):
        return False # Sessions should only be created via login
