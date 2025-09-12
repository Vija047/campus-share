import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (buffer, options = {}) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                resource_type: 'auto',
                folder: 'student-notes-hub',
                ...options
            };

            const stream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            stream.end(buffer);
        });
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
};

export const getFileType = (mimetype) => {
    const typeMap = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/msword': 'docx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png'
    };

    return typeMap[mimetype] || 'unknown';
};
