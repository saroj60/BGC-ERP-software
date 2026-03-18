from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra user data to the response
        data['role'] = self.user.role
        data['id'] = self.user.id
        data['email'] = self.user.email
        return data


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for user information.
    Used for listing and retrieving user details.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users.
    Only ADMIN can create users.
    Includes password validation and role assignment.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role', 'is_active', 'is_staff']
        extra_kwargs = {
            'is_active': {'default': True},
            'is_staff': {'default': False}
        }

    def validate(self, attrs):
        """Ensure passwords match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def validate_role(self, value):
        """Ensure role is valid"""
        if value not in [User.Role.ADMIN, User.Role.PROJECT_MANAGER, User.Role.SITE_ENGINEER]:
            raise serializers.ValidationError("Invalid role specified.")
        return value

    def validate_is_staff(self, value):
        """
        Only ADMIN role should have is_staff=True.
        Prevent accidental Django Admin access for other roles.
        """
        role = self.initial_data.get('role')
        if value and role != User.Role.ADMIN:
            raise serializers.ValidationError(
                "Only ADMIN role users can have is_staff=True. "
                "SITE_ENGINEER and PROJECT_MANAGER cannot access Django Admin."
            )
        return value

    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', User.Role.SITE_ENGINEER),
            is_active=validated_data.get('is_active', True),
            is_staff=validated_data.get('is_staff', False)
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating existing users.
    Only ADMIN can update users.
    Password update is optional and validated separately.
    """
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['email', 'role', 'is_active', 'is_staff', 'password', 'password_confirm']

    def validate(self, attrs):
        """Ensure passwords match if provided"""
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        return attrs

    def validate_role(self, value):
        """Ensure role is valid"""
        if value not in [User.Role.ADMIN, User.Role.PROJECT_MANAGER, User.Role.SITE_ENGINEER]:
            raise serializers.ValidationError("Invalid role specified.")
        return value

    def validate_is_staff(self, value):
        """
        Only ADMIN role should have is_staff=True.
        Prevent accidental Django Admin access for other roles.
        """
        instance = self.instance
        role = self.initial_data.get('role', instance.role if instance else None)
        if value and role != User.Role.ADMIN:
            raise serializers.ValidationError(
                "Only ADMIN role users can have is_staff=True. "
                "SITE_ENGINEER and PROJECT_MANAGER cannot access Django Admin."
            )
        return value

    def update(self, instance, validated_data):
        """Update user, handling password separately"""
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class RoleAssignmentSerializer(serializers.Serializer):
    """
    Serializer for assigning/changing user roles.
    Only ADMIN can assign roles.
    """
    role = serializers.ChoiceField(choices=User.Role.choices)

    def validate_role(self, value):
        """Ensure role is valid"""
        if value not in [User.Role.ADMIN, User.Role.PROJECT_MANAGER, User.Role.SITE_ENGINEER]:
            raise serializers.ValidationError("Invalid role specified.")
        return value

    def update(self, instance, validated_data):
        """Update user role"""
        instance.role = validated_data['role']
        
        # Security: Remove is_staff if role is not ADMIN
        # This prevents accidental Django Admin access
        if instance.role != User.Role.ADMIN:
            instance.is_staff = False
        
        instance.save()
        return instance


class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for admin to reset user password.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def update(self, instance, validated_data):
        instance.set_password(validated_data['password'])
        instance.save()
        return instance
