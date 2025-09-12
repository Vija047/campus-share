import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateShareLink = (noteId) => {
    const token = jwt.sign({ noteId, type: 'share' }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    return `${process.env.FRONTEND_URL}/shared/${token}`;
};
