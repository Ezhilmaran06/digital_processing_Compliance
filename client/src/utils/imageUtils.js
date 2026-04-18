/**
 * Utility to get consistent and correct URLs for images/avatars
 * across development and production environments.
 */
export const getAvatarUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL (like from Unsplash or Cloudinary) or a Base64 string, return as is
    if (path.startsWith('http') || path.startsWith('data:')) return path;

    // Get the base API URL from environment variables
    // In production, this should be the Render URL
    const apiUrl = import.meta.env.VITE_API_URL || '';
    
    // Construct the backend base URL (removing /api from the end if present)
    const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    
    // Ensure path starts with a single slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Add a unique timestamp to prevent aggressive browser caching
    // especially useful after a new upload
    const timestamp = new Date().getTime();
    
    return `${baseUrl}${cleanPath}?t=${timestamp}`;
};

/**
 * Fallback initials if image fails to load
 */
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};
