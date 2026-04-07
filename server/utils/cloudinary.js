import dotenv from 'dotenv';
dotenv.config();

// We use dynamic imports for cloudinary to prevent the server from crashing 
// if the dependencies are not yet installed.
let cloudinary = null;
let CloudinaryStorage = null;

const checkDependencies = async () => {
    if (cloudinary && CloudinaryStorage) return true;
    try {
        const cloudinaryModule = await import('cloudinary');
        const storageModule = await import('multer-storage-cloudinary');
        cloudinary = cloudinaryModule.v2;
        CloudinaryStorage = storageModule.CloudinaryStorage;
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Checks if the required environment variables are set
 */
export const isCloudinaryConfigured = () => {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && 
              process.env.CLOUDINARY_API_KEY && 
              process.env.CLOUDINARY_API_SECRET);
};

/**
 * Returns the storage engine for multer. 
 * If cloudinary is not available/configured, it returns null.
 */
export const getCloudinaryStorage = async () => {
    const hasDeps = await checkDependencies();
    const isConfigured = isCloudinaryConfigured();
    
    if (!hasDeps || !isConfigured) {
        return null;
    }

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        return new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: 'dpc_uploads',
                allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'svg'],
                transformation: [{ width: 500, height: 500, crop: 'limit' }],
            },
        });
    } catch (error) {
        console.error('Error initializing Cloudinary storage:', error);
        return null;
    }
};

export default cloudinary;
