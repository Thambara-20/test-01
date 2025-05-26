import express from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "./config/data-source";
import { Routes } from "./routes/routes";
import cors from "cors";
import { createServer } from "http";
import cookieParser from "cookie-parser";

import { initializeSocketIO } from "../src/services/socketService";

AppDataSource.initialize().then(async () => {
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

  server.listen(process.env.PORT);

  console.log(`Express server has started on port ${process.env.PORT}.`);
});
