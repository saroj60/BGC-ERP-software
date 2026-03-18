import requests
import json

BASE_URL = "http://127.0.0.1:8000"
EMAIL = "sarojbhagat666@gmail.com"
PASSWORD = "123"

def test_login():
    print(f"Attempting login for {EMAIL} with password '{PASSWORD}'...")
    try:
        response = requests.post(f"{BASE_URL}/api/token/", data={"email": EMAIL, "password": PASSWORD})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("LOGIN SUCCESSFUL!")
            token = response.json().get('access')
            print(f"Token obtained: {token[:20]}...")
            
            # Verify user details with token
            headers = {"Authorization": f"Bearer {token}"}
            user_resp = requests.get(f"{BASE_URL}/api/accounts/users/", headers=headers)
            print(f"User Fetch Status: {user_resp.status_code}")
        else:
            print("LOGIN FAILED.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_login()
