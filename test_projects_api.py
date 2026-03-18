import requests
import json

BASE_URL = "http://127.0.0.1:8000"
EMAIL = "sarojbhagat666@gmail.com"
PASSWORD = "123"

def test_fetch_projects():
    # 1. Login
    try:
        auth_resp = requests.post(f"{BASE_URL}/api/token/", data={"email": EMAIL, "password": PASSWORD})
        if auth_resp.status_code != 200:
            print(f"Login Failed: {auth_resp.text}")
            return
        
        token = auth_resp.json().get('access')
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Fetch Projects
        print("Fetching projects...")
        resp = requests.get(f"{BASE_URL}/api/projects/", headers=headers)
        
        print(f"Status Code: {resp.status_code}")
        if resp.status_code != 200:
            print(f"Error Response: {resp.text}")
        else:
            print(f"Projects Found: {len(resp.json())}")
            print(json.dumps(resp.json(), indent=2))

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_fetch_projects()
