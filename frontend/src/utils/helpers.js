export const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
        return messageDate.toLocaleDateString();
    }
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType) => {
    const iconMap = {
        pdf: '📄',
        docx: '📝',
        ppt: '📊',
        pptx: '📊',
        jpg: '🖼️',
        png: '🖼️',
        jpeg: '🖼️',
    };

    return iconMap[fileType] || '📁';
};

export const truncateText = (text, length = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

export const getSemesterName = (semester) => {
    const semesterMap = {
        '1': '1st Semester',
        '2': '2nd Semester',
        '3': '3rd Semester',
        '4': '4th Semester',
        '5': '5th Semester',
        '6': '6th Semester',
        '7': '7th Semester',
        '8': '8th Semester',
    };

    return semesterMap[semester] || `${semester} Semester`;
};

export const validateFile = (file) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/jpg'
    ];

    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only PDF, DOCX, PPT, PPTX, and images are allowed.'
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size too large. Maximum size is 50MB.'
        };
    }

    return { valid: true };
};

export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const generateShareableText = (note) => {
    return `Check out this note: "${note.title}" for ${note.subject} (Semester ${note.semester}) shared on Student Notes Hub!`;
};
