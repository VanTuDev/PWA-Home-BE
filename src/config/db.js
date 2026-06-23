import mongoose from 'mongoose';
import dns from 'dns';

// Node.js đôi khi dùng 127.0.0.1 làm DNS (do WSL2/VPN) khiến SRV lookup thất bại.
// Override sang DNS thực để mongodb+srv:// hoạt động bình thường.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pwa_home';
    console.log(`Connecting to MongoDB at: ${connStr.replace(/:([^@:]+)@/, ':****@')}`);
    
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
