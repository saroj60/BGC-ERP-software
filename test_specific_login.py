import requests
import json

BASE_URL = "http://127.0.0.1:8000"
EMAIL = "bhagatgrouppvt@gmail.com"
PASSWORD = "bhagatgrouppvt"

def test_login():
    print(f"Testing login for: {EMAIL}")
    print(f"Password: {PASSWORD}")
    
    try:
        # 1. Test Connectivity first
        try:
            requests.get(f"{BASE_URL}/admin/", timeout=2) # Just checking if server is up
            print("Server is reachable.")
        except requests.exceptions.ConnectionError:
            print("CRITICAL: Server is NOT reachable. Is it running?")
            return

        # 2. Attempt Login
        response = requests.post(f"{BASE_URL}/api/token/", data={"email": EMAIL, "password": PASSWORD})
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ LOGIN SUCCESS")
            print(f"Token: {response.json().get('access')[:10]}...")
        else:
            print("❌ LOGIN FAILED")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_login()
