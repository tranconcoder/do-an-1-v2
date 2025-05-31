/**
 * Server configuration.
 * Defines the base URL for the backend API.
 * It prioritizes the NEXT_PUBLIC_API_URL environment variable if set,
 * otherwise defaults to https://localhost:4000.
 */

export const BACKEND_API_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "https://3.107.91.101:4000"; 