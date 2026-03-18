from rest_framework import permissions
from .models import User


class IsAdmin(permissions.BasePermission):
    """
    Permission class to allow only ADMIN role users.
    
    ADMIN Role Privileges:
    - Highest privilege level in the system
    - Can create, update, deactivate users and assign roles
    - Can view, edit, delete all resources across all projects
    - Not restricted by project-level permissions
    - Can access Django Admin panel (if is_staff=True)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_admin()
        )


class CanManageUsers(permissions.BasePermission):
    """
    Permission class for user management operations.
    Only ADMIN role can manage users.
    
    Allowed operations:
    - List all users
    - Create new users
    - Update user details
    - Deactivate users (soft delete)
    - Assign/change user roles
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_admin()
        )
    
    def has_object_permission(self, request, view, obj):
        """Only ADMIN can perform operations on user objects"""
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_admin()
        )
