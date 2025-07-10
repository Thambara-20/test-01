import express from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "./config/data-source";
import { Routes } from "./routes/routes";
import cors from "cors";
import { createServer } from "http";
import cookieParser from "cookie-parser";

import { initializeSocketIO } from "./services/socketService";

// Initialize the Express app
const app = express();
app.use(bodyParser.json());
// app.use(authenticateToken)
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.FRONT_END_URL, process.env.LAMBDA_URL],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

const server = createServer(app);
initializeSocketIO(server);

// Add routes
Routes.forEach((route) => {
  const { method, route: path, controller, action, middleware } = route;
  (app as any)[method](
    path,
    ...middleware,
    (req: any, res: any, next: any) => {
      const result = new (controller as any)()[action](req, res, next);
      if (result instanceof Promise) {
        result.then((data: any) =>
          data !== null && data !== undefined ? res.send(data) : undefined
        );
      } else if (result !== null && result !== undefined) {
        res.json(result);
      }
    }
  );
});

// Start server with or without database
const startServer = async () => {
  const port = process.env.PORT || 3000;
  
  // Try to initialize database connection
  if (AppDataSource && process.env.PG_DATABASE_URL) {
    try {
      console.log("Attempting to connect to database...");
      await AppDataSource.initialize();
      console.log("Database connected successfully");
    } catch (error) {
      console.warn("Database connection failed, starting without database:", error.message);
      console.warn("Application will run with limited functionality");
    }
  } else {
    console.warn("No PG_DATABASE_URL provided, starting without database");
  }

  server.listen(port, () => {
    console.log(`Express server has started on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/health`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
