from rest_framework import permissions
from accounts.models import User

class CanManageMaterialRequests(permissions.BasePermission):
    """
    Control access to Material Requests.
    
    ADMIN Role: Unrestricted access to all material requests
    - Can create, view, update (approve/reject), delete any material request
    - Not restricted by project-level permissions
    - Can manage material requests across all projects
    
    PROJECT_MANAGER Role: Can manage material requests
    - Can create material requests
    - Can approve/reject material requests
    - Can update and delete material requests
    - Can view all material requests
    
    SITE_ENGINEER Role: Limited access
    - Can create material requests for assigned projects
    - Can view material requests
    - Cannot approve/reject, update, or delete requests
    
    Permissions:
    - Create: SITE_ENGINEER, PROJECT_MANAGER, ADMIN
    - View: All authenticated users
    - Update/Delete (Approve/Reject): PROJECT_MANAGER, ADMIN only
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Safe methods (GET, HEAD, OPTIONS) allowed for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # POST (Create) allowed for Site Engineers, Project Managers, and Admins
        if request.method == 'POST':
            return (
                request.user.is_site_engineer() or 
                request.user.is_project_manager() or 
                request.user.is_admin()
            )

        # PUT/PATCH/DELETE allowed for Project Managers and Admin
        # ADMIN has unrestricted access
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            return request.user.is_project_manager() or request.user.is_admin()

        return False

    def has_object_permission(self, request, view, obj):
        # Allow all authenticated users to view
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Update/Delete only for PROJECT_MANAGER and ADMIN
        # ADMIN has unrestricted access to all material requests
        return request.user.is_project_manager() or request.user.is_admin()
