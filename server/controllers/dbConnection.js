import mongoose from 'mongoose';

const dbConnect = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log('The Database is connected');
  } catch (error) {
    console.log('There is some error with the Database', error);
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
