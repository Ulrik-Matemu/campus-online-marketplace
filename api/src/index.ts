import express, { Request, Response, Application, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Error]: ${err.message}`);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Close DB connections here (e.g., mongoose.connection.close())
        process.exit(0);
    });
})