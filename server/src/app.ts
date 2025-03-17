import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import dotenv from "dotenv";

/* ROUTE IMPORTS */
import searchRoutes from "./routes/searchRoutes";
import companyRoutes from "./routes/companyRoutes";
import pvPanelRoutes from './routes/pvPanelRoutes';
import inverterRoutes from './routes/inverterRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import surveyRoutes from './routes/surveyRoutes';
import userRoutes from './routes/userRoutes';

/* CONFIGURATIONS */
dotenv.config();
console.log('Environment loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL?.substring(0, 20) + '...',
});

// Initialize Prisma client
const prisma = new PrismaClient();

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers

// Configure CORS with credentials support
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with increased limit

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/users', userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/companies", companyRoutes);
app.use('/api/pv-panels', pvPanelRoutes);
app.use('/api/inverters', inverterRoutes);

// Log all routes for debugging
console.log('Registered routes:');
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        const method = handler.route.stack[0].method.toUpperCase();
        const path = handler.route.path;
        console.log(`${method} ${middleware.regexp} ${path}`);
      }
    });
  }
});

// Error handling for 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    path: req.url
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and Prisma client...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
