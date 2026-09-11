const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI
    console.log('Attempting MongoDB connection to:', uri);
    
    // Set low timeout to fall back quickly if local mongodb is not running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('✅ Connected to MongoDB via Mongoose');
  } catch (err) {
    console.warn('⚠️ Local MongoDB connection failed or timed out:', err.message);
    console.log('🔄 Launching in-memory MongoDB server fallback for self-contained execution...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to In-Memory MongoDB at:', mongoUri);
    } catch (memErr) {
      console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
