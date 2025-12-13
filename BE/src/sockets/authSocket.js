const jwt = require('jsonwebtoken');

/**
 * Socket.IO Authentication Middleware
 * Verifies JWT token sent during socket connection handshake
 * Similar to REST API authMiddleware but adapted for Socket.IO
 */
const authSocket = (socket, next) => {
    // Token is sent via socket.handshake.auth.token from client
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        // Verify token using same JWT_SECRET as REST API
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to socket object for use in handlers
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        // Authentication successful, proceed to connection
        next();
    } catch (error) {
        // Invalid or expired token
        return next(new Error('Authentication error: Invalid token'));
    }
};

module.exports = authSocket;
