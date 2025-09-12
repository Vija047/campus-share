/**
 * Utility functions for handling file downloads
 */

/**
 * Downloads a file from a URL with proper filename
 * @param {string} url - The file URL to download
 * @param {string} filename - The desired filename for the downloaded file
 * @returns {Promise<boolean>} - Returns true if download was successful
 */
export const downloadFile = async (url, filename) => {
    try {
        // Check if it's a Cloudinary URL and modify for direct download
        let downloadUrl = url;
        if (url.includes('cloudinary.com')) {
            // Add download flag to Cloudinary URL for better download behavior
            if (!url.includes('fl_attachment')) {
                const separator = url.includes('?') ? '&' : '?';
                downloadUrl = `${url}${separator}fl_attachment:${encodeURIComponent(filename)}`;
            }
        }

        // Fetch the file as a blob
        const response = await fetch(downloadUrl, {
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(blob);

        // Create and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'download';

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL after a short delay
        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 100);

        return true;
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
};

/**
 * Downloads a file directly using a simple link approach (fallback)
 * @param {string} url - The file URL to download
 * @param {string} filename - The desired filename for the downloaded file
 */
export const downloadFileSimple = (url, filename) => {
    // Check if it's a Cloudinary URL and modify for direct download
    let downloadUrl = url;
    if (url.includes('cloudinary.com')) {
        // Add download flag to Cloudinary URL for better download behavior
        if (!url.includes('fl_attachment')) {
            const separator = url.includes('?') ? '&' : '?';
            downloadUrl = `${url}${separator}fl_attachment:${encodeURIComponent(filename)}`;
        }
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Gets the file extension from a filename
 * @param {string} filename - The filename to extract extension from
 * @returns {string} - The file extension (lowercase)
 */
export const getFileExtension = (filename) => {
    if (!filename) return '';
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
};

/**
 * Determines if a file is a supported document type
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if the file is a supported document type
 */
export const isSupportedDocument = (filename) => {
    const supportedExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const extension = getFileExtension(filename);
    return supportedExtensions.includes(extension);
};

/**
 * Formats file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
