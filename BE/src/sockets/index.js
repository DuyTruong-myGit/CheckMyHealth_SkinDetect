const { Server } = require('socket.io');
const watchHandlers = require('./watchHandlers');
const authSocket = require('./authSocket');

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.SOCKET_CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // JWT authentication middleware for sockets
    io.use(authSocket);

    // Event handlers
    io.on('connection', (socket) => {
        console.log(`✅ Socket connected: User ${socket.userId}`);

        // Join user to their personal room for targeted broadcasting
        socket.join(`user_${socket.userId}`);

        // Register watch-related handlers
        watchHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: User ${socket.userId}`);
        });
    });

    console.log('🔌 Socket.IO initialized successfully');
    return io;
}

module.exports = { initializeSocket };
