import { BACKEND_API_URL } from '../server.config'; // Import the new config

// Get the base URL for the backend. Prefers environment variable, falls back to localhost.
// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Constructs the full URL for a media file given its ID.
 * Assumes the backend serves media files directly via a route like /media/:mediaId.
 * 
 * @param mediaId The ID of the media file.
 * @returns The full URL to access the media file.
 */
const getMediaUrl = (mediaId: string): string => {
  if (!mediaId) {
    // Return a placeholder or default image URL if mediaId is missing
    // For now, let's return an empty string, but you might want to handle this more gracefully.
    console.warn("getMediaUrl called with empty mediaId");
    return "/placeholder.svg"; // Or some other default placeholder
  }
  return `${BACKEND_API_URL}/media/${mediaId}`; // Use BACKEND_API_URL
};

export const mediaService = {
  getMediaUrl,
}; 