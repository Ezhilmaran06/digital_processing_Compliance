import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configuration for Cloudinary
// To use this, the user must set these environment variables:
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dpc_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'svg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

export const isCloudinaryConfigured = () => {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && 
              process.env.CLOUDINARY_API_KEY && 
              process.env.CLOUDINARY_API_SECRET);
};

export default cloudinary;
