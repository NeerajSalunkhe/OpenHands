import mongoose from 'mongoose';

let isConnected = false;



export default async function dbConnect() {
    if (isConnected) return;
    try {
        const mongoose = (await import('mongoose')).default;  // dynamic import
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = conn.connections[0].readyState === 1;
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}