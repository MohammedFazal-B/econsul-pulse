# 🚀 Complete Postman Testing Guide for eConsul Pulse API

## 📋 Prerequisites
- Server running on `http://127.0.0.1:8000`
- Postman installed and ready

## 🔧 API Endpoints to Test

### 1. **Health Check Endpoint**
**Purpose**: Verify the API is running

- **Method**: `GET`
- **URL**: `http://127.0.0.1:8000/health`
- **Headers**: None required
- **Body**: None

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "eConsul Pulse API"
}
```

---

### 2. **Schema Example Endpoint**
**Purpose**: Get the correct request format

- **Method**: `GET`
- **URL**: `http://127.0.0.1:8000/api/schema-example`
- **Headers**: None required
- **Body**: None

**Expected Response**: Shows the exact format needed for submissions

---

### 3. **Main API Endpoint - Submit Feedback**
**Purpose**: Submit user feedback for processing

#### ⚙️ **Postman Setup Steps**:

1. **Method**: `POST`
2. **URL**: `http://127.0.0.1:8000/api/submit-feedback`

3. **Headers Tab**:
   - Click "Headers" tab
   - Add header:
     - **Key**: `Content-Type`
     - **Value**: `application/json`

4. **Body Tab**:
   - Click "Body" tab
   - Select "raw" radio button
   - From dropdown, select "JSON"
   - Paste this exact JSON:

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "district": "Downtown",
  "state": "California",
  "subject": "Public Transportation",
  "comment": "The bus service needs improvement in our area. The buses are often late and overcrowded during peak hours."
}
```

**Expected Success Response** (200 OK):
```json
{
  "id": "uuid-of-user-submission",
  "comment_id": "uuid-of-sentiment-analysis", 
  "message": "Feedback submitted successfully"
}
```

## ❌ Common 422 Errors and Solutions

### **Error 1: Missing Content-Type Header**
```json
{
  "detail": "Validation error",
  "errors": [
    {
      "type": "missing",
      "loc": ["body"],
      "msg": "Field required",
      "input": null
    }
  ]
}
```
**Solution**: Add `Content-Type: application/json` header

### **Error 2: Invalid Email Format**
```json
{
  "detail": "Validation error",
  "errors": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "Invalid email format"
    }
  ]
}
```
**Solution**: Use valid email format (e.g., `user@example.com`)

### **Error 3: Missing Required Fields**
```json
{
  "detail": "Validation error",
  "errors": [
    {
      "type": "missing",
      "loc": ["body", "name"],
      "msg": "Field required"
    }
  ]
}
```
**Solution**: Include all required fields: `name`, `email`, `district`, `state`, `subject`, `comment`

## 🧪 Test Cases

### **Test Case 1: Valid Submission**
```json
{
  "name": "Alice Johnson",
  "email": "alice@test.com",
  "district": "North District",
  "state": "Texas",
  "subject": "Road Infrastructure",
  "comment": "The roads in our neighborhood have many potholes that need urgent repair."
}
```

### **Test Case 2: Another Valid Submission**
```json
{
  "name": "Bob Smith", 
  "email": "bob.smith@gmail.com",
  "district": "Central",
  "state": "New York",
  "subject": "Public Safety",
  "comment": "We need better street lighting in the downtown area for safety at night."
}
```

### **Test Case 3: Invalid Email (Should Fail)**
```json
{
  "name": "Test User",
  "email": "invalid-email",
  "district": "Test District", 
  "state": "Test State",
  "subject": "Test Subject",
  "comment": "Test comment"
}
```

## 🔍 What Happens Behind the Scenes

When you submit valid data:
1. ✅ **Request Validation**: Checks all required fields and email format
2. 🤖 **AI Analysis**: Calls OpenRouter API for sentiment analysis (or uses fallback)
3. 💾 **Database Storage**: 
   - Stores sentiment analysis in `sentiment_analysis` table
   - Stores user submission in `user_submissions` table with reference
4. 📤 **Response**: Returns both IDs for tracking

## 🚨 Troubleshooting

### **If you get Connection Refused error**:
- Make sure the server is running: `python -m uvicorn main:app --host 127.0.0.1 --port 8000`
- Check the URL is exactly: `http://127.0.0.1:8000`

### **If you get 500 Internal Server Error**:
- Check the server logs in the terminal
- Database connection issues are most common

### **If OpenRouter API fails**:
- The system uses fallback analysis
- Submission still works, just with basic sentiment analysis

## 📊 Viewing Results

After successful submission, you can:
1. Check your Supabase database tables:
   - `user_submissions` - Contains the form data
   - `sentiment_analysis` - Contains AI analysis results
2. Use the returned IDs to track specific submissions

## 🎯 Quick Test Commands

```bash
# Test health endpoint
curl http://127.0.0.1:8000/health

# Test schema example  
curl http://127.0.0.1:8000/api/schema-example

# Test submit endpoint
curl -X POST http://127.0.0.1:8000/api/submit-feedback \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","district":"Test","state":"Test","subject":"Test","comment":"Test comment"}'
```