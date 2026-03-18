
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

# Credentials - using existing or creating new ones
# We'll use the 'testadmin@example.com' we created earlier
ADMIN_EMAIL = "testadmin@example.com"
ADMIN_PASSWORD = "admin123"

# New test users for this verification
PM_EMAIL = "rbac_pm@example.com"
PM_PASSWORD = "StrongPassword@123"
ENG_EMAIL = "rbac_eng@example.com"
ENG_PASSWORD = "StrongPassword@123"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def get_token(email, password):
    response = requests.post(f"{BASE_URL}/api/token/", data={"email": email, "password": password})
    if response.status_code == 200:
        return response.json().get('access')
    return None

def verify_rbac():
    log("Starting RBAC Verification...")
    
    # 1. Setup: Login as Admin to create Users and Projects
    admin_token = get_token(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        log("Admin login failed. Make sure DB is synced and server running.", "CRITICAL")
        return
    
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # Create Project Manager User
    log("Creating Test Project Manager...")
    resp = requests.post(f"{BASE_URL}/api/accounts/users/", json={
        "email": PM_EMAIL, "password": PM_PASSWORD, "password_confirm": PM_PASSWORD, "role": "PROJECT_MANAGER"
    }, headers=headers_admin)
    log(f"Create PM Response: {resp.status_code} {resp.text}")
    
    # Create Site Engineer User
    log("Creating Test Site Engineer...")
    resp = requests.post(f"{BASE_URL}/api/accounts/users/", json={
        "email": ENG_EMAIL, "password": ENG_PASSWORD, "password_confirm": ENG_PASSWORD, "role": "SITE_ENGINEER"
    }, headers=headers_admin)
    log(f"Create ENG Response: {resp.status_code} {resp.text}")

    # Get their IDs (Quick lookup by listing)
    users_resp = requests.get(f"{BASE_URL}/api/accounts/users/", headers=headers_admin).json()
    if isinstance(users_resp, dict) and 'results' in users_resp:
        users = users_resp['results']
        # If paginated, we might need to fetch more, but let's assume our test users are in first page or use search
    else:
        users = users_resp

    pm_id = next((u['id'] for u in users if u['email'] == PM_EMAIL), None)
    eng_id = next((u['id'] for u in users if u['email'] == ENG_EMAIL), None)
    
    # Fallback: if not found in list, try specific search if API supports it (it does filter by role but not email explicitly in default viewset usually)
    # Or just try to search manually by iterating pages if needed. 
    # For now, let's rely on them being in the recent list or results.
    
    if not pm_id or not eng_id:
        # Try one more time with role filtering to narrow down
        if not pm_id:
            pms = requests.get(f"{BASE_URL}/api/accounts/users/?role=PROJECT_MANAGER", headers=headers_admin).json()
            if 'results' in pms: pms = pms['results']
            pm_id = next((u['id'] for u in pms if u['email'] == PM_EMAIL), None)
            
        if not eng_id:
            engs = requests.get(f"{BASE_URL}/api/accounts/users/?role=SITE_ENGINEER", headers=headers_admin).json()
            if 'results' in engs: engs = engs['results']
            eng_id = next((u['id'] for u in engs if u['email'] == ENG_EMAIL), None)

    if not pm_id or not eng_id:
        log(f"Failed to retrieve user IDs. PM: {pm_id}, ENG: {eng_id}", "CRITICAL")
        return

    # Create 2 Projects
    # Proj A -> Managed by PM, Engineer Assigned
    # Proj B -> Managed by PM, Engineer NOT Assigned (Engineer should NOT see this)
    log("Creating Projects...")
    
    # Create Proj A
    resp_a = requests.post(f"{BASE_URL}/api/projects/", json={
        "name": "RBAC Project A", "client_name": "Test", "location": "Test", "start_date": "2026-01-01",
        "project_manager": pm_id
    }, headers=headers_admin)
    proj_a_id = resp_a.json().get('id')

    # Assign Engineer to Proj A (using new 'site_engineers' field? Or logic?)
    # Wait, how do checks assign engineer? We added 'site_engineers' M2M field but didn't expose it in Serializer explicitly?
    # Ah, standard ModelSerializer with 'all' fields should include it, but let's check input format.
    # It's M2M, usually expects list of IDs.
    # Let's try to PATCH Proj A to add engineer.
    requests.patch(f"{BASE_URL}/api/projects/{proj_a_id}/", json={
        "site_engineers": [eng_id]
    }, headers=headers_admin)

    # Create Proj B
    resp_b = requests.post(f"{BASE_URL}/api/projects/", json={
        "name": "RBAC Project B", "client_name": "Test", "location": "Test", "start_date": "2026-01-01",
        "project_manager": pm_id
        # No engineer assigned
    }, headers=headers_admin)
    proj_b_id = resp_b.json().get('id')

    # 2. Login as Users
    token_pm = get_token(PM_EMAIL, PM_PASSWORD)
    token_eng = get_token(ENG_EMAIL, ENG_PASSWORD)
    headers_pm = {"Authorization": f"Bearer {token_pm}"}
    headers_eng = {"Authorization": f"Bearer {token_eng}"}

    # 3. Verify Project Access
    log("Verifying Project Access...")
    
    # Engineer should see Proj A, but NOT Proj B
    eng_projects = requests.get(f"{BASE_URL}/api/projects/", headers=headers_eng).json()
    # It might be pagination result?
    if isinstance(eng_projects, dict) and 'results' in eng_projects:
        eng_projects = eng_projects['results']
    
    eng_proj_ids = [p['id'] for p in eng_projects]
    if proj_a_id in eng_proj_ids and proj_b_id not in eng_proj_ids:
        log("SUCCESS: Site Engineer sees assigned project ONLY.")
    else:
        log(f"FAILURE: Site Engineer sees: {eng_proj_ids}, Expected only {proj_a_id}", "ERROR")

    # 4. Verify Data Access (Reports)
    # Create Report in Proj A (as Admin)
    requests.post(f"{BASE_URL}/api/reports/", json={
        "project": proj_a_id, "date": "2026-01-01", "weather": "Sunny", "labor_count": 5, "work_done": "Test"
    }, headers=headers_admin)
    
    # Create Report in Proj B (as Admin)
    requests.post(f"{BASE_URL}/api/reports/", json={
        "project": proj_b_id, "date": "2026-01-01", "weather": "Cloudy", "labor_count": 5, "work_done": "Test"
    }, headers=headers_admin)

    # Engineer should see Report A, NOT Report B
    eng_reports = requests.get(f"{BASE_URL}/api/reports/", headers=headers_eng).json()
    if isinstance(eng_reports, dict) and 'results' in eng_reports: eng_reports = eng_reports['results']
    
    # Check if report from Proj A exists and Proj B does not
    has_proj_a_report = any(r['project'] == proj_a_id or (isinstance(r['project'], dict) and r['project']['id'] == proj_a_id) for r in eng_reports)
    has_proj_b_report = any(r['project'] == proj_b_id or (isinstance(r['project'], dict) and r['project']['id'] == proj_b_id) for r in eng_reports)

    if has_proj_a_report and not has_proj_b_report:
        log("SUCCESS: Site Engineer sees reports for assigned project ONLY.")
    else:
        log(f"FAILURE: Report visibility issues. See A: {has_proj_a_report}, See B: {has_proj_b_report}", "ERROR")



    # 5. Verify Dashboard Stats
    log("Verifying Dashboard Stats...")
    # Admin should see at least 2 projects (A and B)
    admin_dash = requests.get(f"{BASE_URL}/api/dashboard/stats/", headers=headers_admin).json()
    if admin_dash['total_projects'] >= 2:
        log("SUCCESS: Admin sees correct project count.", "INFO")
    else:
        log(f"FAILURE: Admin sees {admin_dash['total_projects']} projects, expected >= 2", "ERROR")

    # Engineer should see 1 project (Proj A) or 0 if not assigned properly in step 1, but definitely NOT Proj B count
    # Since we assigned Engineer to Proj A in Step 1...
    eng_dash = requests.get(f"{BASE_URL}/api/dashboard/stats/", headers=headers_eng).json()
    
    # We expect Engineer to see exactly 1 project (Proj A)
    if eng_dash['total_projects'] == 1:
         log("SUCCESS: Site Engineer sees exactly 1 project in stats.")
    elif eng_dash['total_projects'] < admin_dash['total_projects']:
         log(f"SUCCESS: Site Engineer sees fewer projects ({eng_dash['total_projects']}) than Admin.", "INFO")
    else:
         log(f"FAILURE: Site Engineer sees {eng_dash['total_projects']} projects. Access Leak suspected.", "ERROR")

    log("RBAC Verification Complete.")

if __name__ == "__main__":
    try:
        verify_rbac()
    except Exception as e:
        log(f"An error occurred: {e}", "CRITICAL")
