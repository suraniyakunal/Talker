import mongoose from 'mongoose';

const dbConnect = async (uri) => {
  if (!uri) {
    console.error('CRITICAL: MONGODB_URL is not defined in environment variables.');
    process.exit(1);
  }
  try {
    // Adding family: 4 to resolve potential DNS issues (ENOTFOUND) in some environments
    await mongoose.connect(uri, { family: 4 });
    console.log('The Database is connected');
  } catch (error) {
    console.log('There is some error with the Database connection:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('HINT: The MongoDB cluster URI could not be resolved. Check if the cluster exists and its URI is correct.');
    }
    process.exit(1);
  }
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL_MS = 5000; // 5 seconds

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        reconnectAttempts++;
        connectToDatabase(); // Call your connection function again
      }, RECONNECT_INTERVAL_MS);
    } else {
      console.error('Max reconnection attempts reached. Shutting down.');
      process.exit(1);
    }
  });
};

export default dbConnect;
