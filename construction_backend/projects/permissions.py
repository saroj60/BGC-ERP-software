from rest_framework import permissions
from accounts.models import User

class IsAdminForProjects(permissions.BasePermission):
    """
    Custom permission to allow only Admin to edit projects.
    Others (PM, Engineers) can only view.
    
    ADMIN Role: Unrestricted access
    - Can create, update, delete any project
    
    PROJECT_MANAGER & SITE_ENGINEER: Read-only
    - Can only view projects (filtering handled by ViewSet)
    """
    def has_permission(self, request, view):
        # Allow read-only access for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
            
        # Write permissions strictly for ADMIN
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_admin()
        )
