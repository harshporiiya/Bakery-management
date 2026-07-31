const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Join specific role or user room
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    socket.on('join_admin', () => {
      socket.join('admin_room');
      console.log(`Socket ${socket.id} joined admin_room`);
    });

    // Custom real-time ping / live status test
    socket.on('ping_server', () => {
      socket.emit('pong_server', { message: 'Sweet Delight Socket Server Live', time: new Date() });
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
