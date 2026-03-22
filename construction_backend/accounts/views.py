from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import User, UserSession
from .serializers import (
    UserSerializer, 
    UserCreateSerializer, 
    UserUpdateSerializer,
    RoleAssignmentSerializer,
    PasswordResetSerializer,
    UserSessionSerializer
)
from .permissions import CanManageUsers
from rest_framework_simplejwt.tokens import RefreshToken, OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.views import TokenObtainPairView

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management operations.
    Only ADMIN role can access these endpoints.
    
    Endpoints:
    - GET /users/ - List all users
    - POST /users/ - Create new user
    - GET /users/{id}/ - Retrieve user details
    - PUT/PATCH /users/{id}/ - Update user
    - DELETE /users/{id}/ - Deactivate user (soft delete)
    - POST /users/{id}/assign_role/ - Assign role to user
    """
    queryset = User.objects.all()
    permission_classes = [CanManageUsers]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'assign_role':
            return RoleAssignmentSerializer
        elif self.action == 'reset_password':
            return PasswordResetSerializer
        return UserSerializer
    
    def get_queryset(self):
        """
        ADMIN can view all users.
        Optionally filter by role or active status.
        """
        queryset = User.objects.all().order_by('-date_joined')
        
        # Optional filtering by role
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # Optional filtering by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        """
        Soft delete: Deactivate user instead of hard delete.
        This preserves user data and relationships.
        """
        instance = self.get_object()
        
        # Prevent ADMIN from deactivating themselves
        if instance.id == request.user.id:
            return Response(
                {"detail": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.is_active = False
        instance.save()
        
        return Response(
            {"detail": f"User {instance.email} has been deactivated."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], url_path='assign-role')
    def assign_role(self, request, pk=None):
        """
        Assign or change role for a user.
        Only ADMIN can assign roles.
        
        POST /users/{id}/assign-role/
        Body: {"role": "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER"}
        """
        user = self.get_object()
        serializer = RoleAssignmentSerializer(data=request.data)
        
        if serializer.is_valid():
            # Prevent ADMIN from changing their own role
            if user.id == request.user.id:
                return Response(
                    {"detail": "You cannot change your own role."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer.update(user, serializer.validated_data)
            return Response(
                {
                    "detail": f"Role updated to {user.get_role_display()}.",
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        """
        Reactivate a deactivated user.
        Only ADMIN can activate users.
        
        POST /users/{id}/activate/
        """
        user = self.get_object()
        
        if user.is_active:
            return Response(
                {"detail": "User is already active."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = True
        user.save()
        
        return Response(
            {
                "detail": f"User {user.email} has been activated.",
                "user": UserSerializer(user).data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """
        Reset password for a user.
        Only ADMIN can reset passwords.

        POST /users/{id}/reset-password/
        Body: {"password": "new_password", "password_confirm": "new_password"}
        """
        user = self.get_object()
        serializer = PasswordResetSerializer(data=request.data)

        if serializer.is_valid():
            serializer.update(user, serializer.validated_data)
            return Response(
                {"detail": f"Password has been reset for user {user.email}."},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='impersonate')
    def impersonate(self, request, pk=None):
        """
        Generate a token for a specific user to login as them (Impersonation).
        Only ADMIN can perform this.
        """
        user = self.get_object()
        
        # Prevent impersonating self (redundant but good UX) or other admins if needed
        # Currently allowing Admin -> Admin impersonation as it might be useful, 
        # but preventing Admin -> Self is good to avoid confusion.
        if user.id == request.user.id:
             return Response(
                {"detail": "You are already logged in as this user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Override to record session information on login.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            try:
                # Get JTI from the issued refresh token
                refresh_token = response.data.get('refresh')
                token = RefreshToken(refresh_token)
                jti = token.get('jti')
                user_id = response.data.get('id')
                user = User.objects.get(id=user_id)
                
                # Update last_login
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])

                # Record the session
                ip_address = self.get_client_ip(request)
                user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
                device_name = self.parse_device_name(user_agent)

                UserSession.objects.create(
                    user=user,
                    token_jti=jti,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    device_name=device_name
                )
            except Exception as e:
                # Log error but don't fail login
                print(f"Error recording session: {e}")
        
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def parse_device_name(self, ua_string):
        if 'Mobi' in ua_string:
            if 'iPhone' in ua_string: return 'iPhone'
            if 'Android' in ua_string: return 'Android Phone'
            return 'Mobile Device'
        if 'iPad' in ua_string: return 'iPad'
        if 'Windows' in ua_string: return 'Windows PC'
        if 'Mac' in ua_string: return 'Macintosh'
        if 'Linux' in ua_string: return 'Linux PC'
        return 'Unknown Device'

class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing and terminating active sessions.
    """
    serializer_class = UserSessionSerializer

    def get_queryset(self):
        # Only show active sessions that haven't been blacklisted
        blacklist_jtis = BlacklistedToken.objects.values_list('token__jti', flat=True)
        return UserSession.objects.filter(
            user=self.request.user, 
            is_active=True
        ).exclude(token_jti__in=blacklist_jtis)

    @action(detail=True, methods=['post'])
    def logout(self, request, pk=None):
        """
        Terminate a specific session by blacklisting its refresh token.
        """
        session = self.get_object()
        
        try:
            # Find the outstanding token in SimpleJWT
            outstanding_token = OutstandingToken.objects.filter(jti=session.token_jti).first()
            if outstanding_token:
                # Blacklist the token
                BlacklistedToken.objects.get_or_create(token=outstanding_token)
            
            # Deactivate the session record
            session.is_active = False
            session.save()
            
            return Response({"detail": "Session terminated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
