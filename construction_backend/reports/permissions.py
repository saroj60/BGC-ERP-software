from rest_framework import permissions
from accounts.models import User

class IsSiteEngineer(permissions.BasePermission):
    """
    Custom permission to allow only Site Engineers to create reports.
    
    SITE_ENGINEER Role: Can create and view reports
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        return request.user.is_site_engineer()

class CanManageReports(permissions.BasePermission):
    """
    Control access to Reports and Attendance.
    
    ADMIN Role: Unrestricted access to all reports
    - Can create, view, update, delete any report
    - Not restricted by project-level permissions
    - Can access all attendance records across all projects
    
    PROJECT_MANAGER Role: Can manage reports for their projects
    - Can create reports
    - Can update/delete reports for assigned projects
    - Can view all reports
    
    SITE_ENGINEER Role: Limited access
    - Can create reports for assigned projects
    - Can view reports
    - Cannot update or delete reports
    
    Permissions:
    - Create: SITE_ENGINEER, PROJECT_MANAGER, ADMIN
    - View: All authenticated users
    - Update/Delete: PROJECT_MANAGER, ADMIN only
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Create permissions
        if request.method == 'POST':
            return (
                request.user.is_site_engineer() or 
                request.user.is_project_manager() or 
                request.user.is_admin()
            )

        # Write permissions (Update/Delete) only for ADMIN or PROJECT_MANAGER
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return request.user.is_project_manager() or request.user.is_admin()
            
        return False

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only for ADMIN or PROJECT_MANAGER
        # ADMIN has unrestricted access to all reports
        return request.user.is_project_manager() or request.user.is_admin()
