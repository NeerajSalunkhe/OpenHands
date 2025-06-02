import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (cached.conn) {
    // We already have a connection—return it
    return cached.conn;
  }

  if (!cached.promise) {
    if (!MONGODB_URI) {
      const msg = "🛑 MONGODB_URI is not defined in environment variables!";
      console.error(msg);
      throw new Error(msg);
    }
    // Kick off the initial connection and cache the promise
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    const conn = await cached.promise;
    cached.conn = conn;
    console.log("MongoDB connected (cached)");
    return conn;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
