from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from models.schemas import UserSubmissionRequest, UserSubmissionResponse
from services.sentiment_service import SentimentAnalysisService
from database.supabase_client import SupabaseClient
import logging
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="eConsul Pulse API",
    description="API for processing user submissions and sentiment analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
sentiment_service = SentimentAnalysisService()
supabase_client = SupabaseClient()

# Add validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error for {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "body": exc.body if hasattr(exc, 'body') else None
        }
    )

@app.get("/")
async def root():
    return {"message": "eConsul Pulse API is running"}

@app.post("/api/submit-feedback", response_model=UserSubmissionResponse)
async def submit_feedback(submission: UserSubmissionRequest):
    """
    Process user feedback submission:
    1. Extract subject and comment for sentiment analysis
    2. Call sentiment analysis service
    3. Store sentiment analysis in database
    4. Store user submission with reference to sentiment analysis
    5. Return the submission ID and comment ID
    """
    try:
        logger.info(f"Processing submission for user: {submission.email}")
        
        # Extract subject and comment for analysis
        full_comment = f"Subject: {submission.subject}\n\nComment: {submission.comment}"
        
        # Perform sentiment analysis
        sentiment_result = await sentiment_service.analyze_sentiment(
            subject=submission.subject,
            comment=submission.comment,
            full_comment=full_comment
        )
        
        logger.info("Sentiment analysis completed")
        
        # Store sentiment analysis in database
        comment_id = await supabase_client.store_sentiment_analysis(sentiment_result)
        
        logger.info(f"Stored sentiment analysis with ID: {comment_id}")
        
        # Store user submission with comment_id reference
        submission_id = await supabase_client.store_user_submission(
            submission=submission,
            comment_id=comment_id
        )
        
        logger.info(f"Stored user submission with ID: {submission_id}")
        
        return UserSubmissionResponse(
            id=submission_id,
            comment_id=comment_id,
            message="Feedback submitted successfully"
        )
        
    except Exception as e:
        logger.error(f"Error processing submission: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing submission: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "eConsul Pulse API"}

@app.get("/api/schema-example")
async def get_schema_example():
    """Get an example of the expected request format"""
    return {
        "example_request": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "district": "Downtown",
            "state": "California",
            "subject": "Public Transportation",
            "comment": "The bus service needs improvement in our area."
        },
        "required_fields": ["name", "email", "district", "state", "subject", "comment"],
        "field_types": {
            "name": "string",
            "email": "string (valid email format)",
            "district": "string",
            "state": "string",
            "subject": "string",
            "comment": "string"
        }
    }
