/**
 * Library feature constants
 */

// Root folder configuration
export const ROOT_FOLDER = {
  id: "root",
  name: "My Library"
} as const;

// Default messages
export const MESSAGES = {
  EMPTY_FOLDER: "This folder is empty",
  LIBRARY_TITLE: "Library"
} as const;

// Form validation messages
export const VALIDATION = {
  FOLDER_NAME_REQUIRED: "Folder name is required",
  FOLDER_NOT_FOUND: "Folder not found",
  TRACK_URL_REQUIRED: "Track URL is required",
  INVALID_URL: "Invalid URL. Must be YouTube or SoundCloud URL"
} as const;
