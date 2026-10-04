const { connectDB } = require('../server/config/db');
const { seedDatabase } = require('../server/config/seedData');
const app = require('../server/app');

// Connect to MongoDB on first serverless invocation
let isDbInitialized = false;

const handler = async (req, res) => {
  if (!isDbInitialized) {
    await connectDB();
    await seedDatabase();
    isDbInitialized = true;
  }
  return app(req, res);
};

module.exports = handler;
