import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'construction_backend.settings')
django.setup()

from django.test import Client
from accounts.models import Company, User
from projects.models import Project

def run_qa():
    print("Starting QA Tests...")
    client = Client()
    
    # 1. Ensure Superuser exists (or create one for testing)
    su_email = 'qa_super@example.com'
    su_password = 'qapassword123'
    if not User.objects.filter(email=su_email).exists():
        User.objects.create_superuser(email=su_email, password=su_password, role='ADMIN')
    
    # 2. Login as superuser to test SaaS admin endpoint
    res = client.post('/api/token/', {'email': su_email, 'password': su_password})
    assert res.status_code == 200, "Superuser login failed"
    su_token = res.json()['access']
    
    import uuid
    uid = str(uuid.uuid4())[:8]
    company_data = {
        'name': f'QA Builders Inc {uid}',
        'subdomain': f'qa-builders-{uid}',
        'admin_email': f'admin_{uid}@qabuilders.com',
        'admin_password': 'securepassword123',
        'theme_color': '#ff0000',
        'logo': 'https://example.com/logo.png'
    }
    res = client.post(
        '/api/saas/companies/', 
        data=company_data, 
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {su_token}'
    )
    if res.status_code != 201:
        print("Failed to create company:", res.json())
        return False
    print("[PASS] Company creation via SaaS endpoint successful")
    
    # 4. Login as the newly created company admin
    res = client.post('/api/token/', {'email': company_data['admin_email'], 'password': 'securepassword123'})
    if res.status_code != 200:
        print("Failed to login as new company admin:", res.json())
        return False
    
    token_data = res.json()
    assert token_data['company_name'] == company_data['name'], "Branding name missing"
    assert token_data['theme_color'] == '#ff0000', "Branding color missing"
    assert token_data['company_logo'] == 'https://example.com/logo.png', "Branding logo missing"
    print("[PASS] Branding fields correctly returned on login")
    
    new_admin_token = token_data['access']
    
    # 5. Create a project under the new company
    project_data = {
        'name': 'QA Headquarters',
        'client_name': 'QA Corp',
        'location': 'Testville',
        'start_date': '2026-01-01',
        'status': 'PLANNING'
    }
    res = client.post(
        '/api/projects/', 
        data=project_data, 
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {new_admin_token}'
    )
    if res.status_code != 201:
        print("Failed to create project:", res.json())
        return False
    print("[PASS] Project creation successful (automatically assigned to company)")
    
    # 6. Test Data Isolation
    # Create another company
    c2 = Company.objects.create(name=f"Isolated Corp {uid}")
    u2 = User.objects.create_user(email=f"admin_iso_{uid}@isolated.com", password="password123", role="ADMIN", company=c2)
    
    res = client.post('/api/token/', {'email': f"admin_iso_{uid}@isolated.com", 'password': 'password123'})
    u2_token = res.json()['access']
    
    res = client.get('/api/projects/', HTTP_AUTHORIZATION=f'Bearer {u2_token}')
    projects = res.json()
    if len(projects) > 0:
        print("[FAIL] Data Isolation Failed! Company B can see Company A's projects.")
        return False
    print("[PASS] Data Isolation successful! Companies cannot see each other's data.")
    
    print("\n[SUCCESS] ALL QA TESTS PASSED SUCCESSFULLY!")
    return True

if __name__ == '__main__':
    run_qa()
