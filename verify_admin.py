
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "testadmin@example.com"
ADMIN_PASSWORD = "admin123"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def verify_admin_features():
    session = requests.Session()
    
    # 1. Login
    log("Attempting to login...")
    response = session.post(f"{BASE_URL}/api/token/", data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if response.status_code != 200:
        log(f"Login failed: {response.text}", "ERROR")
        return
    
    tokens = response.json()
    access_token = tokens.get('access')
    headers = {"Authorization": f"Bearer {access_token}"}
    log("Login successful.")

    # 2. Create User (Needed first for Project Manager assignment)
    log("Creating a Site Engineer user...")
    new_user_email = "manager@example.com"
    user_data = {
        "email": new_user_email,
        "password": "initialpassword123",
        "password_confirm": "initialpassword123",
        "role": "SITE_ENGINEER"
    }
    # Correct URL: api/accounts/users/
    response = requests.post(f"{BASE_URL}/api/accounts/users/", json=user_data, headers=headers)
    new_user_id = None
    if response.status_code == 201:
        log("User created successfully.")
        new_user_id = response.json().get('id')
    else:
        log(f"User creation failed: {response.status_code} {response.text[:200]}", "ERROR")
        # Try to find user if already exists
        if "already exists" in response.text:
             users = requests.get(f"{BASE_URL}/api/accounts/users/", headers=headers).json()
             if isinstance(users, list):
                 for u in users:
                     if u['email'] == new_user_email:
                         new_user_id = u['id']
                         break
             elif 'results' in users: # pagination
                 for u in users['results']:
                     if u['email'] == new_user_email:
                         new_user_id = u['id']
                         break

    if not new_user_id:
        log("Could not proceed without a target user.", "CRITICAL")
        return

    # 3. Assign Role (Make them a Project Manager)
    log(f"Assigning PROJECT_MANAGER role to user {new_user_id}...")
    role_data = {"role": "PROJECT_MANAGER"}
    response = requests.post(f"{BASE_URL}/api/accounts/users/{new_user_id}/assign-role/", json=role_data, headers=headers)
    if response.status_code == 200:
        log("Role assigned successfully.")
    else:
        log(f"Role assignment failed: {response.status_code} {response.text[:200]}", "ERROR")

    # 4. Create Project WITH Manager
    log("Creating a project with assigned manager...")
    project_data = {
        "name": "Managed Project 2",
        "client_name": "Client B",
        "location": "Pokhara",
        "start_date": "2026-02-01",
        "status": "PLANNED",
        "project_manager": new_user_id
    }
    # Note: Project URL seems to be api/projects/
    response = requests.post(f"{BASE_URL}/api/projects/", json=project_data, headers=headers)
    if response.status_code == 201:
        log("Project created with manager successfully.")
        created_project = response.json()
        if created_project.get('project_manager') == new_user_id:
             log("Verification Successful: Project Manager ID matches.", "SUCCESS")
        else:
             log(f"Verification Failed: Manager ID mistmatch. Got {created_project.get('project_manager')}", "ERROR")

    else:
        log(f"Project creation failed: {response.status_code} {response.text[:200]}", "ERROR")

    # 5. Deactivate User
    log(f"Deactivating user {new_user_id}...")
    response = requests.delete(f"{BASE_URL}/api/accounts/users/{new_user_id}/", headers=headers)
    if response.status_code == 200:
        log("User deactivated successfully.")
    else:
        log(f"User deactivation failed: {response.status_code} {response.text[:200]}", "ERROR")

    # 6. Activate User
    log(f"Activating user {new_user_id}...")
    response = requests.post(f"{BASE_URL}/api/accounts/users/{new_user_id}/activate/", headers=headers)
    if response.status_code == 200:
        log("User activated successfully.")
    else:
        log(f"User activation failed: {response.status_code} {response.text[:200]}", "ERROR")

    # 7. Reset Password
    log(f"Resetting password for user {new_user_id}...")
    new_password = "newresetpassword456"
    reset_data = {
        "password": new_password,
        "password_confirm": new_password
    }
    response = requests.post(f"{BASE_URL}/api/accounts/users/{new_user_id}/reset-password/", json=reset_data, headers=headers)
    if response.status_code == 200:
        log("Password reset successfully.")
    else:
        log(f"Password reset failed: {response.status_code} {response.text[:200]}", "ERROR")

    # 8. Verify New Password Login
    log("Verifying login with new password...")
    response = session.post(f"{BASE_URL}/api/token/", data={"email": new_user_email, "password": new_password})
    if response.status_code == 200:
        log("Login with new password successful. Verification Complete!", "SUCCESS")
    else:
        log(f"Login with new password failed: {response.text}", "ERROR")

if __name__ == "__main__":
    try:
        verify_admin_features()
    except Exception as e:
        log(f"An error occurred: {e}", "CRITICAL")
