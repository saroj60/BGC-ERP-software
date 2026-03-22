from django.utils import timezone
from .models import UserSession
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

class SessionActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # We only care about authenticated API requests
        if request.path.startswith('/api/') and 'Authorization' in request.headers:
            try:
                # Try to authenticate using JWT
                auth = JWTAuthentication()
                header = auth.get_header(request)
                if header:
                    raw_token = auth.get_raw_token(header)
                    validated_token = auth.get_validated_token(raw_token)
                    user = auth.get_user(validated_token)
                    
                    # Get JTI from token
                    token_jti = validated_token.get('jti')
                    
                    if token_jti:
                        # Update last active for this session
                        UserSession.objects.filter(token_jti=token_jti).update(
                            last_active=timezone.now(),
                            ip_address=self.get_client_ip(request)
                        )
            except (InvalidToken, AuthenticationFailed):
                pass

        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
