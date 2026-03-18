import requests

BASE_URL = "http://127.0.0.1:8000/api/"

def test_login_options():
    print("Testing OPTIONS /api/token/...")
    try:
        response = requests.options(f"{BASE_URL}token/")
        print(f"Status: {response.status_code}")
        print(f"Headers: {response.headers}")
    except Exception as e:
        print(f"Error: {e}")

def test_login_post():
    print("\nTesting POST /api/token/ (with dummy credentials)...")
    try:
        response = requests.post(f"{BASE_URL}token/", json={"email": "test@example.com", "password": "wrongpassword"})
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login_options()
    test_login_post()
