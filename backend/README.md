# eConsul Pulse Backend

FastAPI backend for processing user feedback submissions and performing sentiment analysis.

## Features

- **User Feedback Processing**: Accept user submissions with personal details and feedback
- **Sentiment Analysis**: Analyze feedback using Qwen AI model via OpenRouter API
- **Database Integration**: Store data in Supabase (PostgreSQL)
- **RESTful API**: Clean API endpoints with automatic documentation
- **CORS Support**: Configure CORS for frontend integration

## API Endpoints

### POST /api/submit-feedback
Process user feedback submission.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "district": "Downtown",
  "state": "California",
  "subject": "Public Transportation",
  "comment": "The bus service needs improvement..."
}
```

**Response:**
```json
{
  "id": "user_submission_uuid",
  "comment_id": "sentiment_analysis_uuid",
  "message": "Feedback submitted successfully"
}
```

### GET /health
Health check endpoint.

## Setup

1. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your Supabase credentials
   ```

2. **Install Dependencies**
   ```bash
   # For Windows (PowerShell)
   .\start_server.ps1
   
   # For Linux/Mac
   chmod +x start_server.sh
   ./start_server.sh
   ```

3. **Manual Setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   .\venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   
   # Install requirements
   pip install -r requirements.txt
   
   # Run server
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Database Schema

The backend uses two main tables:

### sentiment_analysis
- `comment_id` (uuid, primary key)
- `full_comment` (text)
- `summary` (text)
- `sentiment_analysis` (text)
- `keywords` (text array)
- `created_at` (timestamp)

### user_submissions
- `id` (uuid, primary key)
- `name` (text)
- `email` (text)
- `district` (text)
- `state` (text)
- `subject` (text)
- `comment` (text)
- `comment_id` (uuid, foreign key to sentiment_analysis)
- `created_at` (timestamp)

## Configuration

Environment variables in `.env`:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `API_HOST`: Server host (default: 0.0.0.0)
- `API_PORT`: Server port (default: 8000)

## AI Integration

The backend uses OpenRouter API with Qwen model for sentiment analysis:
- Model: `qwen/qwen3-14b:free`
- Features: Summary generation, sentiment classification, keyword extraction
- Fallback: Basic text analysis if AI service is unavailable

## Development

- **FastAPI Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Auto-reload**: Enabled in development mode

## Error Handling

The API includes comprehensive error handling:
- Input validation using Pydantic
- Database operation error handling
- AI service fallback mechanisms
- Structured error responses