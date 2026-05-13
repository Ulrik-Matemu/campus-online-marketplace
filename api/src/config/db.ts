import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://admin:password@mongo:27017/com_db?authSource=admin';

    try {
        const conn = await mongoose.connect(mongoURI);
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`❌ Error: ${error.message}`);
        }

        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;