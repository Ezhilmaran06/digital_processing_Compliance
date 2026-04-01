import { Server } from 'socket.io';

let io;

export const initIo = (server, corsOptions) => {
    io = new Server(server, { cors: corsOptions });

    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        socket.on('setup', (userData) => {
            // Join personal room
            socket.join(userData._id);
            console.log(`[Socket] User ${userData._id} joined personal room`);
            
            // Allow them to join specific groups
            socket.emit('connected');
        });

        socket.on('join chat', (room) => {
            socket.join(room);
            console.log(`[Socket] User joined room: ${room}`);
        });

        socket.on('typing', (room) => socket.in(room).emit('typing', room));
        socket.on('stop typing', (room) => socket.in(room).emit('stop typing', room));

        socket.on('disconnect', () => {
             console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIo = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized!');
    }
    return io;
};
