/**
 * Utility functions for handling media URLs
 */
import { API_URL } from '../configs/env.config';

// Default avatar for different sizes
const DEFAULT_AVATARS = {
    small: '/assets/default-avatar-small.png',
    medium: '/assets/default-avatar-medium.png',
    large: '/assets/default-avatar-large.png'
};

/**
 * Constructs a full URL for media resources using the server's media endpoint
 * @param {string} mediaId - The ID of the media to retrieve
 * @returns {string|null} - The full URL to the media resource or null if id is not provided
 */
export const getMediaUrl = (mediaId) => {
    if (!mediaId) return null;
    return `${API_URL}/media/${mediaId}`;
};

/**
 * Creates a placeholder based on text (typically initials)
 * @param {string} text - Text to use for creating initials or placeholder
 * @param {number} size - Size of the placeholder
 * @returns {Object} - Background color and text color for the placeholder
 */
export const getTextPlaceholder = (text, size = 80) => {
    if (!text) {
        return {
            backgroundColor: '#3498db',
            color: '#ffffff',
            text: 'S', // Default for Shop
            size
        };
    }

    // Generate a consistent color based on the text
    const stringToColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };

    const backgroundColor = stringToColor(text);

    // Get first letter or first letters of each word
    const getInitials = (name) => {
        const words = name.split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 1).toUpperCase();
    };

    return {
        backgroundColor,
        color: '#ffffff', // White text for contrast
        text: getInitials(text),
        size
    };
};

/**
 * Returns a placeholder image URL for a given size
 * @param {string} size - The size of the placeholder image (e.g., 'small', 'medium', 'large')
 * @returns {string} - The URL of the placeholder image
 */
export const getPlaceholderImage = (size) => {
    return DEFAULT_AVATARS[size] || DEFAULT_AVATARS.medium;
};
