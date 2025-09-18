from pydantic import BaseModel, field_validator
from typing import List, Optional
from datetime import datetime
import uuid
import re

class UserSubmissionRequest(BaseModel):
    """Request model for user feedback submission"""
    name: str
    email: str
    district: str
    state: str
    subject: str
    comment: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        # Simple email validation using regex
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v

class SentimentAnalysisResult(BaseModel):
    """Model for sentiment analysis result"""
    full_comment: str
    summary: str
    sentiment_analysis: str
    keywords: List[str]

class SentimentAnalysisResponse(BaseModel):
    """Response model from sentiment analysis service"""
    summary: str
    sentiment_analysis: str
    keywords: List[str]

class UserSubmissionResponse(BaseModel):
    """Response model for user submission"""
    id: str
    comment_id: str
    message: str

class DatabaseSentimentAnalysis(BaseModel):
    """Database model for sentiment_analysis table"""
    comment_id: Optional[str] = None
    full_comment: str
    summary: str
    sentiment_analysis: str
    keywords: List[str]
    created_at: Optional[datetime] = None

class DatabaseUserSubmission(BaseModel):
    """Database model for user_submissions table"""
    id: Optional[str] = None
    name: str
    email: str
    district: str
    state: str
    subject: str
    comment: str
    comment_id: Optional[str] = None
    created_at: Optional[datetime] = None