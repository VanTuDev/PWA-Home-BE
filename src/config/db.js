import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pwa_home';
    console.log(`Connecting to MongoDB at: ${connStr.replace(/:([^@:]+)@/, ':****@')}`);
    
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
