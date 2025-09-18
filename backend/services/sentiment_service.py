import os
import json
import logging
import aiohttp
from typing import Dict, List
from models.schemas import SentimentAnalysisResult

logger = logging.getLogger(__name__)

class SentimentAnalysisService:
    def __init__(self):
        # Use environment variable or fallback to provided key
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "skorv1d48d521b6bed3b4046059d2dfd394679b9009889307440dd7476da72d02280a8")
        self.model_id = "qwen/qwen3-14b:free"
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        
        if not self.openrouter_api_key:
            raise ValueError("OpenRouter API key must be provided")
        
        logger.info("Sentiment Analysis Service initialized")

    async def analyze_sentiment(self, subject: str, comment: str, full_comment: str) -> SentimentAnalysisResult:
        """
        Analyze sentiment of the given comment using Qwen model via OpenRouter
        Returns structured sentiment analysis with summary, sentiment, and keywords
        """
        try:
            logger.info("Starting sentiment analysis...")
            
            # Create the prompt for sentiment analysis
            prompt = f"""
Analyze the following user feedback and provide a structured response:

Subject: {subject}
Comment: {comment}

Please provide your analysis in the following JSON format (respond with ONLY the JSON, no additional text):
{{
    "summary": "Brief summary of the main points in 1-2 sentences",
    "sentiment_analysis": "Overall sentiment (positive/negative/neutral) with brief explanation",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}}

Make sure the keywords are relevant terms extracted from the feedback that capture the main topics and concerns.
"""

            headers = {
                "Authorization": f"Bearer {self.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://econsul-pulse.app",
                "X-Title": "eConsul Pulse"
            }
            
            payload = {
                "model": self.model_id,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 500
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.api_url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        
                        # Extract the content from the response
                        content = result["choices"][0]["message"]["content"].strip()
                        logger.info(f"Raw API response: {content}")
                        
                        # Parse the JSON response
                        try:
                            # Clean the content to ensure it's valid JSON
                            if content.startswith("```json"):
                                content = content.replace("```json", "").replace("```", "").strip()
                            elif content.startswith("```"):
                                content = content.replace("```", "").strip()
                            
                            analysis_data = json.loads(content)
                            
                            # Validate required fields
                            required_fields = ["summary", "sentiment_analysis", "keywords"]
                            for field in required_fields:
                                if field not in analysis_data:
                                    raise ValueError(f"Missing required field: {field}")
                            
                            # Ensure keywords is a list
                            if not isinstance(analysis_data["keywords"], list):
                                analysis_data["keywords"] = []
                            
                            return SentimentAnalysisResult(
                                full_comment=full_comment,
                                summary=analysis_data["summary"],
                                sentiment_analysis=analysis_data["sentiment_analysis"],
                                keywords=analysis_data["keywords"]
                            )
                            
                        except json.JSONDecodeError as e:
                            logger.error(f"Error parsing JSON response: {e}")
                            logger.error(f"Raw content: {content}")
                            
                            # Fallback analysis if JSON parsing fails
                            return SentimentAnalysisResult(
                                full_comment=full_comment,
                                summary=f"Analysis of feedback regarding: {subject}",
                                sentiment_analysis="Unable to determine sentiment - analysis service error",
                                keywords=[subject.lower(), "feedback", "user_input"]
                            )
                    else:
                        error_text = await response.text()
                        logger.error(f"OpenRouter API error: {response.status} - {error_text}")
                        raise Exception(f"OpenRouter API request failed: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}")
            
            # Return fallback analysis in case of any error
            return SentimentAnalysisResult(
                full_comment=full_comment,
                summary=f"User feedback regarding {subject}. Automated analysis unavailable.",
                sentiment_analysis="Neutral - Unable to analyze sentiment due to service error",
                keywords=self._extract_basic_keywords(subject, comment)
            )

    def _extract_basic_keywords(self, subject: str, comment: str) -> List[str]:
        """
        Basic keyword extraction as fallback
        """
        # Simple keyword extraction - split words and filter
        text = f"{subject} {comment}".lower()
        words = text.split()
        
        # Filter out common words and keep meaningful ones
        stop_words = {"the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "a", "an", "this", "that", "these", "those"}
        
        keywords = [word.strip(".,!?;:") for word in words if len(word) > 3 and word not in stop_words]
        
        # Return up to 5 unique keywords
        unique_keywords = list(dict.fromkeys(keywords))[:5]
        
        # If no keywords found, use subject
        if not unique_keywords:
            unique_keywords = [subject.lower()]
            
        return unique_keywords