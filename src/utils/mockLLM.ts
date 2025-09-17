import { v4 as uuidv4 } from 'uuid';

export interface LLMResponse {
  comment_id: string;
  summary: string;
  sentiment_analysis: string;
  keywords: string[];
}

// Mock sentiment analysis function
export const mockLLMAnalysis = (comment: string): LLMResponse => {
  // Generate a random UUID for comment_id
  const comment_id = uuidv4();
  
  // Simple keyword extraction (mock implementation)
  const words = comment.toLowerCase().split(/\s+/);
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those'];
  const meaningfulWords = words.filter(word => 
    word.length > 3 && !stopWords.includes(word) && /^[a-zA-Z]+$/.test(word)
  );
  
  // Get unique keywords (max 5)
  const keywords = [...new Set(meaningfulWords)].slice(0, 5);
  
  // Simple sentiment analysis based on keywords
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'support', 'agree', 'helpful', 'beneficial', 'improve', 'better', 'effective', 'successful'];
  const negativeWords = ['bad', 'terrible', 'negative', 'disagree', 'against', 'problem', 'issue', 'concern', 'difficult', 'poor', 'ineffective', 'failure'];
  
  const positiveCount = words.filter(word => positiveWords.some(pos => word.includes(pos))).length;
  const negativeCount = words.filter(word => negativeWords.some(neg => word.includes(neg))).length;
  
  let sentiment: string;
  if (positiveCount > negativeCount) {
    sentiment = 'Positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'Negative';
  } else {
    sentiment = 'Neutral';
  }
  
  // Generate a simple summary (first 100 characters + ...)
  const summary = comment.length > 100 
    ? comment.substring(0, 100) + '...' 
    : comment;
  
  return {
    comment_id,
    summary,
    sentiment_analysis: sentiment,
    keywords: keywords.length > 0 ? keywords : ['consultation', 'feedback', 'policy']
  };
};