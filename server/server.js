const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./config/seedData');
const socketHandler = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach socket instance to express app
app.set('socketio', io);

// Mount socket handlers
socketHandler(io);

// Start server immediately, then connect DB & seed
server.listen(PORT, async () => {
  console.log(`==================================================`);
  console.log(`🍰 SWEET DELIGHT BAKERY SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🌐 Storefront: http://localhost:${PORT}`);
  console.log(`🔑 Admin Login: http://localhost:${PORT}/pages/login.html`);
  console.log(`   (Admin Email: admin@bakery.com | Password: admin123)`);
  console.log(`==================================================`);

  await connectDB();
  await seedDatabase();
});
