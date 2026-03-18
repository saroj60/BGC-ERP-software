
import requests
import json

BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "testadmin@example.com"
ADMIN_PASSWORD = "admin123"

# IDs from previous run or we create new ones
PM_EMAIL = "strict_pm@example.com"
PM_PASSWORD = "StrongPassword@123"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def get_token(email, password):
    resp = requests.post(f"{BASE_URL}/api/token/", data={"email": email, "password": password})
    if resp.status_code == 200:
        return resp.json().get('access')
    return None

def verify_strict_controls():
    log("Starting Strict Admin Control Verification...")
    
    # Login as Admin
    admin_token = get_token(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        # Try creating admin if not exists (assume exists from previous steps)
        log("Admin login failed. Check server.", "CRITICAL")
        return
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # 1. Verify Admin Can Create User (PM)
    log("Step 1: Admin creating a new Project Manager...")
    user_data = {
        "email": PM_EMAIL, "password": PM_PASSWORD, "password_confirm": PM_PASSWORD, "role": "PROJECT_MANAGER"
    }
    resp = requests.post(f"{BASE_URL}/api/accounts/users/", json=user_data, headers=headers_admin)
    if resp.status_code == 201:
        log("SUCCESS: Admin created PM user.")
    elif "already exists" in resp.text:
         log("INFO: PM user already exists, proceeding.")
    else:
        log(f"FAILURE: Admin failed to create user. {resp.status_code} {resp.text}", "ERROR")
        return

    # 2. Verify New User Can Login
    log("Step 2: Verifying new PM login...")
    pm_token = get_token(PM_EMAIL, PM_PASSWORD)
    if pm_token:
        log("SUCCESS: New PM can log in immediately.")
    else:
        log("FAILURE: New PM cannot log in.", "ERROR")
        return
    
    headers_pm = {"Authorization": f"Bearer {pm_token}"}

    # 3. Verify PM CANNOT Create Project
    log("Step 3: Verifying PM cannot create project...")
    proj_data = {
        "name": "Unauthorized Project", "client_name": "Test", "location": "Test", "start_date": "2026-06-01"
    }
    resp = requests.post(f"{BASE_URL}/api/projects/", json=proj_data, headers=headers_pm)
    if resp.status_code == 403:
        log("SUCCESS: PM blocked from creating project (403 Forbidden).")
    else:
        log(f"FAILURE: PM was able to create/try project. Status: {resp.status_code}", "ERROR")

    # 4. Verify Admin CAN Create Project
    log("Step 4: Verifying Admin can create project...")
    proj_data["name"] = "Admin Authorized Project"
    resp = requests.post(f"{BASE_URL}/api/projects/", json=proj_data, headers=headers_admin)
    if resp.status_code == 201:
        log("SUCCESS: Admin created project.")
        project_id = resp.json()['id']
    else:
        log(f"FAILURE: Admin failed to create project. {resp.status_code}", "ERROR")
        return

    # 5. Verify PM CANNOT Edit Project
    log("Step 5: Verifying PM cannot edit project (e.g. assign engineer)...")
    # Trying to change location
    resp = requests.patch(f"{BASE_URL}/api/projects/{project_id}/", json={"location": "Hacked Location"}, headers=headers_pm)
    if resp.status_code == 403:
        log("SUCCESS: PM blocked from editing project (403 Forbidden).")
    else:
        log(f"FAILURE: PM was able to edit project. Status: {resp.status_code}", "ERROR")

    log("Strict Control Verification Complete.")

if __name__ == "__main__":
    verify_strict_controls()
