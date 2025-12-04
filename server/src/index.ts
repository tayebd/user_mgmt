import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/* ROUTE IMPORTS */
import searchRoutes from "./routes/searchRoutes";
import userRoutes from "./routes/userRoutes";
import organizationRoutes from "./routes/organizationRoutes";
import pvPanelRoutes from './routes/pvPanelRoutes';
import surveyRoutes from "./routes/surveyRoutes";
import inverterRoutes from './routes/inverterRoutes';

/* CONFIGURATIONS */
dotenv.config();
console.log('Environment loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL?.substring(0, 20) + '...',
});

export const app = express();

/* MIDDLEWARE */
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* CORS */
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:3000',
  credentials: true,
}));

/* HEALTH CHECK */
app.get("/health", (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/api/search", searchRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use('/api/pv-panels', pvPanelRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/inverters', inverterRoutes);

/* ERROR HANDLING */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

/* SERVER */
const port = Number(process.env.PORT) || 5000;

// Create the server but don't start listening yet
const server = app.listen();
server.close(); // Close immediately to prevent actual listening

// Only start the server if this file is being run directly (not being imported for tests)
if (require.main === module) {
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
  });
  
  // Handle server shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}
