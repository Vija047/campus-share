/**
 * Utility functions for handling file downloads
 */

/**
 * Downloads a file from a URL with proper filename and progress tracking
 * @param {string} url - The file URL to download
 * @param {string} filename - The desired filename for the downloaded file
 * @param {Function} onProgress - Optional progress callback function
 * @returns {Promise<boolean>} - Returns true if download was successful
 */
export const downloadFileWithProgress = async (url, filename, onProgress = null) => {
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

        console.log(`Starting download with progress tracking: ${filename}`);

        // Fetch the file with progress tracking
        const response = await fetch(downloadUrl, {
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'Accept': '*/*',
            },
            cache: 'no-cache'
        });

        if (!response.ok) {
            // More specific error handling
            if (response.status === 404) {
                throw new Error(`File not found: ${filename}`);
            } else if (response.status === 500) {
                throw new Error(`Server error while downloading: ${filename}`);
            } else if (response.status === 403) {
                throw new Error(`Access denied for: ${filename}`);
            } else {
                throw new Error(`Failed to fetch file (${response.status}): ${response.statusText}`);
            }
        }

        const contentLength = response.headers.get('content-length');
        const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

        console.log(`File size: ${formatFileSize(totalSize)}`);

        if (onProgress && totalSize > 0 && response.body) {
            try {
                // Read the response with progress tracking
                const reader = response.body.getReader();
                const chunks = [];
                let receivedLength = 0;

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    chunks.push(value);
                    receivedLength += value.length;

                    // Report progress
                    const progress = (receivedLength / totalSize) * 100;
                    onProgress(progress);
                }

                // Combine chunks into blob
                const blob = new Blob(chunks);

                // Final progress update
                onProgress(100);

                await downloadBlobAsFile(blob, filename);
            } catch (progressError) {
                console.warn('Progress tracking failed, falling back to simple download:', progressError);
                // Fallback to simple blob download
                const blob = await response.blob();
                await downloadBlobAsFile(blob, filename);
            }
        } else {
            // Fallback to simple blob download without progress
            const blob = await response.blob();
            await downloadBlobAsFile(blob, filename);
        }

        console.log(`Successfully downloaded: ${filename}`);
        return true;
    } catch (error) {
        console.error('Download with progress error:', error);
        throw error;
    }
};

/**
 * Downloads a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The desired filename
 */
const downloadBlobAsFile = async (blob, filename) => {
    // Validate the blob
    if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty or corrupted');
    }

    console.log(`Downloaded blob size: ${formatFileSize(blob.size)}`);

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    link.style.display = 'none';

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL after a short delay
    setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
    }, 1000);
};

/**
 * Downloads a file from a URL with proper filename
 * @param {string} url - The file URL to download
 * @param {string} filename - The desired filename for the downloaded file
 * @returns {Promise<boolean>} - Returns true if download was successful
 */
export const downloadFile = async (url, filename) => {
    return downloadFileWithProgress(url, filename, null);
};

/**
 * Downloads a file directly using a simple link approach (fallback)
 * @param {string} url - The file URL to download
 * @param {string} filename - The desired filename for the downloaded file
 */
export const downloadFileSimple = (url, filename) => {
    console.log(`Using fallback download for: ${filename}`);

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
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Fallback download initiated for: ${filename}`);
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

/**
 * Gets the user's default download location based on their operating system
 * @returns {string} - Description of where files are typically saved
 */
export const getDownloadLocation = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (platform.includes('win') || userAgent.includes('windows')) {
        return 'Downloads folder (usually C:\\Users\\YourName\\Downloads)';
    } else if (platform.includes('mac') || userAgent.includes('mac')) {
        return 'Downloads folder (~/Downloads)';
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
        return 'Downloads folder (~/Downloads)';
    } else {
        return 'your browser\'s default download location';
    }
};

/**
 * Checks if the browser supports the HTML5 download attribute
 * @returns {boolean} - True if download attribute is supported
 */
export const supportsDownloadAttribute = () => {
    const a = document.createElement('a');
    return typeof a.download !== 'undefined';
};

/**
 * Shows download instructions to the user
 * @param {string} filename - The name of the file being downloaded
 */
export const showDownloadInstructions = (filename) => {
    const location = getDownloadLocation();
    const message = `"${filename}" will be saved to ${location}. ` +
        `If the download doesn't start automatically, please check your browser's download settings.`;

    console.log('Download Instructions:', message);
    return message;
};

/**
 * Attempts to verify if a file download was successful
 * @param {string} filename - The name of the downloaded file
 * @returns {Promise<boolean>} - Promise that resolves to true if download appears successful
 */
export const verifyDownload = async (filename) => {
    try {
        // This is a best-effort check - browsers limit what we can verify
        console.log(`Attempting to verify download of: ${filename}`);

        // Wait a moment for the download to start
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In most browsers, we can't directly verify file downloads due to security restrictions
        // But we can check if the download API is available and working
        if (supportsDownloadAttribute()) {
            console.log('Browser supports download attribute - download likely successful');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error verifying download:', error);
        return false;
    }
};

/**
 * Creates a comprehensive download manager that handles the entire download process
 * @param {string} url - The file URL to download
 * @param {string} filename - The desired filename for the downloaded file
 * @param {Object} options - Download options
 * @returns {Promise<Object>} - Download result object
 */
export const downloadManager = async (url, filename, options = {}) => {
    const {
        onProgress = null,
        onStart = null,
        onComplete = null,
        onError = null,
        showInstructions = true
    } = options;

    try {
        if (onStart) onStart(filename);

        if (showInstructions) {
            console.log(showDownloadInstructions(filename));
        }

        // Try download with progress tracking first
        let success = false;
        let downloadError = null;

        try {
            success = await downloadFileWithProgress(url, filename, onProgress);
        } catch (progressError) {
            console.warn('Progress download failed, trying simple download:', progressError);
            downloadError = progressError;

            // Fallback to simple download
            try {
                downloadFileSimple(url, filename);
                success = true;
            } catch (simpleError) {
                console.error('Simple download also failed:', simpleError);
                // Try one more fallback with direct browser navigation
                try {
                    window.open(url, '_blank');
                    success = true;
                    console.log('Opened file in new tab as final fallback');
                } catch {
                    throw new Error(`All download methods failed. Last error: ${simpleError.message}`);
                }
            }
        }

        if (success) {
            const verified = await verifyDownload(filename);
            const result = {
                success: true,
                filename,
                verified,
                location: getDownloadLocation(),
                hadFallback: !!downloadError
            };

            if (onComplete) onComplete(result);
            return result;
        } else {
            throw new Error('Download failed');
        }
    } catch (error) {
        console.error('Download manager error:', error);
        if (onError) onError(error);
        throw error;
    }
};
