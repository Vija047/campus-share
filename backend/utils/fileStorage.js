import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const saveFileLocally = async (fileBuffer, filename) => {
    try {
        const uploadDir = path.join(__dirname, '..', 'uploads');

        // Ensure uploads directory exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, fileBuffer);

        return {
            success: true,
            filepath,
            filename
        };
    } catch (error) {
        console.error('Error saving file locally:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const deleteFileLocally = async (filename) => {
    try {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const filepath = path.join(uploadDir, filename);

        await fs.unlink(filepath);
        return { success: true };
    } catch (error) {
        console.error('Error deleting file locally:', error);
        return { success: false, error: error.message };
    }
};