import { v4 as uuidv4 } from 'uuid';

/**
 * Defines the structure of a successful analysis response,
 * matching the camelCase JSON from the Python backend.
 */
export interface AnalysisResponse {
  commentId: string;
  summary: string;
  sentiment: string;
  keywords: string[];
}

/**
 * Represents the raw JSON response from the backend, which might
 * contain analysis data or an error detail from FastAPI.
 */
type BackendData = Partial<AnalysisResponse> & { detail?: string };

/**
 * Sends a comment to the FastAPI backend for analysis.
 * @param comment The user comment string to be analyzed.
 * @returns A promise that resolves to an AnalysisResponse object.
 */
export default async function analyzeComment(comment: string): Promise<AnalysisResponse> {
  // Generate a fallback UUID to use if the backend fails to provide one.
  const fallbackId = uuidv4();

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // The request body must match what the FastAPI endpoint expects.
      body: JSON.stringify({ comment })
    });

    const data: BackendData = await response.json();
    console.log('Raw data from backend:', data);

    // Handle HTTP errors (e.g., 4xx, 5xx status codes).
    // FastAPI's HTTPException sends errors in a `detail` field.
    if (!response.ok) {
      const errorMessage = data.detail || `HTTP error! Status: ${response.status}`;
      throw new Error(errorMessage);
    }

    // --- Normalize the successful response ---
    // This ensures the frontend receives a consistently shaped object,
    // even if the backend response is partially incomplete.
    return {
      commentId: fallbackId,
      summary: data.summary ?? "No summary available.",
      sentiment: data.sentiment ?? "Neutral",
      keywords: (Array.isArray(data.keywords) && data.keywords.length > 0)
        ? data.keywords
        : ['no keywords found']
    };

  } catch (error: any) {
    console.error("Error analyzing comment:", error.message);

    // Return a standardized error response for the UI to handle gracefully.
    return {
      commentId: fallbackId,
      summary: "Analysis failed due to a network or server error.",
      sentiment: "Unknown",
      keywords: ['error']
    };
  }
};
