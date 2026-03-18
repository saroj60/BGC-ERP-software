from rest_framework import permissions
from accounts.models import User

class CanManageExpenses(permissions.BasePermission):
    """
    Control access to Expenses.
    
    ADMIN Role: Full unrestricted access to all expenses
    - Can create, view, update, delete any expense
    - Not restricted by project-level permissions
    - Can manage expenses across all projects
    - Only ADMIN can delete expenses (highest privilege)
    
    PROJECT_MANAGER Role: Can manage expenses
    - Can create, view, update expenses
    - Cannot delete expenses
    
    SITE_ENGINEER Role: Basic access
    - Can create and view expenses
    - Cannot update or delete expenses
    
    Permissions:
    - Create/Update/View: All authenticated users
    - Delete: ADMIN only (restricted to highest privilege)
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # DELETE allowed only for ADMIN
        # This is a critical operation restricted to highest privilege
        if request.method == 'DELETE':
            return request.user.is_admin()
        
        # Site Engineer cannot view or edit expenses
        if request.user.is_site_engineer():
            return False
            
        # All other methods allowed for remaining authenticated users (Admin, PM)
        return True

    def has_object_permission(self, request, view, obj):
        # DELETE allowed only for ADMIN
        if request.method == 'DELETE':
            return request.user.is_admin()
        return True
