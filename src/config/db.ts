import mongoose from 'mongoose';

const connectDB = async (url: string) => {
  try {
    await mongoose.connect(url);
  } catch (err) {
    console.error('MongoDB connection error', err);
  }
};

export default connectDB;


