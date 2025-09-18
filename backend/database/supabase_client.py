import os
from supabase import create_client, Client
from models.schemas import UserSubmissionRequest, SentimentAnalysisResult
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SupabaseClient:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and Key must be set in environment variables")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
        logger.info("Supabase client initialized successfully")

    async def store_sentiment_analysis(self, sentiment_result: SentimentAnalysisResult) -> str:
        """
        Store sentiment analysis result in the sentiment_analysis table
        Returns the comment_id
        """
        try:
            data = {
                "full_comment": sentiment_result.full_comment,
                "summary": sentiment_result.summary,
                "sentiment_analysis": sentiment_result.sentiment_analysis,
                "keywords": sentiment_result.keywords
            }
            
            result = self.client.table("sentiment_analysis").insert(data).execute()
            
            if result.data:
                comment_id = result.data[0]["comment_id"]
                logger.info(f"Stored sentiment analysis with comment_id: {comment_id}")
                return comment_id
            else:
                raise Exception("No data returned from sentiment_analysis insert")
                
        except Exception as e:
            logger.error(f"Error storing sentiment analysis: {str(e)}")
            raise e

    async def store_user_submission(self, submission: UserSubmissionRequest, comment_id: str) -> str:
        """
        Store user submission in the user_submissions table
        Returns the submission id
        """
        try:
            data = {
                "name": submission.name,
                "email": submission.email,
                "district": submission.district,
                "state": submission.state,
                "subject": submission.subject,
                "comment": submission.comment,
                "comment_id": comment_id
            }
            
            result = self.client.table("user_submissions").insert(data).execute()
            
            if result.data:
                submission_id = result.data[0]["id"]
                logger.info(f"Stored user submission with id: {submission_id}")
                return submission_id
            else:
                raise Exception("No data returned from user_submissions insert")
                
        except Exception as e:
            logger.error(f"Error storing user submission: {str(e)}")
            raise e

    async def get_user_submission(self, submission_id: str) -> Dict[Any, Any]:
        """
        Retrieve a user submission by ID
        """
        try:
            result = self.client.table("user_submissions").select("*").eq("id", submission_id).execute()
            
            if result.data:
                return result.data[0]
            else:
                raise Exception(f"No user submission found with id: {submission_id}")
                
        except Exception as e:
            logger.error(f"Error retrieving user submission: {str(e)}")
            raise e

    async def get_sentiment_analysis(self, comment_id: str) -> Dict[Any, Any]:
        """
        Retrieve sentiment analysis by comment_id
        """
        try:
            result = self.client.table("sentiment_analysis").select("*").eq("comment_id", comment_id).execute()
            
            if result.data:
                return result.data[0]
            else:
                raise Exception(f"No sentiment analysis found with comment_id: {comment_id}")
                
        except Exception as e:
            logger.error(f"Error retrieving sentiment analysis: {str(e)}")
            raise e