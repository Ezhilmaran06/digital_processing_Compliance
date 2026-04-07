/**
 * Utility to construct secure avatar URLs for Cloudinary and Local storage.
 * Handles cache busting and absolute/relative path resolution.
 */
export const getAvatarUrl = (path) => {
    if (!path) return null;
    
    // If it's already an absolute URL (Cloudinary or other external source)
    if (path.startsWith('http')) return path;
    
    // For local development or non-cloud deployments
    // We construct the absolute URL using the backend API base URL.
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '').replace(/\/$/, '') || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Add a simple timestamp to prevent browser caching when updating the same filename
    // only for local files as Cloudinary typically gives unique URLs.
    const timestamp = new Date().getTime();
    return `${baseUrl}${cleanPath}?t=${timestamp}`;
};
