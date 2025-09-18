import requests
import json

# Test data
test_submission = {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "district": "Downtown",
    "state": "California", 
    "subject": "Public Transportation",
    "comment": "The bus service needs improvement in our area. The buses are often late and overcrowded during peak hours."
}

def test_api_endpoint():
    """Test the submit-feedback endpoint"""
    try:
        print("🚀 Testing the API endpoint...")
        
        # Make POST request to the API
        response = requests.post(
            "http://127.0.0.1:8000/api/submit-feedback",
            json=test_submission,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ API test successful!")
            return True
        else:
            print("❌ API test failed!")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - Make sure the server is running on http://127.0.0.1:8000")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://127.0.0.1:8000/health")
        print(f"Health check: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Starting API Tests...")
    print("\n1. Testing health endpoint...")
    health_ok = test_health_endpoint()
    
    print("\n2. Testing submit-feedback endpoint...")  
    api_ok = test_api_endpoint()
    
    if health_ok and api_ok:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️ Some tests failed. Check the server logs.")