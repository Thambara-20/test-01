"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const data_source_1 = require("./config/data-source");
const routes_1 = require("./routes/routes");
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socketService_1 = require("./services/socketService");
// Initialize the Express app
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// app.use(authenticateToken)
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: [process.env.FRONT_END_URL, process.env.LAMBDA_URL],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));
const server = (0, http_1.createServer)(app);
(0, socketService_1.initializeSocketIO)(server);
// Add routes
routes_1.Routes.forEach((route) => {
    const { method, route: path, controller, action, middleware } = route;
    app[method](path, ...middleware, (req, res, next) => {
        const result = new controller()[action](req, res, next);
        if (result instanceof Promise) {
            result.then((data) => data !== null && data !== undefined ? res.send(data) : undefined);
        }
        else if (result !== null && result !== undefined) {
            res.json(result);
        }
    });
});
// Start server with or without database
const startServer = async () => {
    const port = process.env.PORT || 3000;
    // Try to initialize database connection
    if (data_source_1.AppDataSource && process.env.PG_DATABASE_URL) {
        try {
            console.log("Attempting to connect to database...");
            await data_source_1.AppDataSource.initialize();
            console.log("Database connected successfully");
        }
        catch (error) {
            console.warn("Database connection failed, starting without database:", error.message);
            console.warn("Application will run with limited functionality");
        }
    }
    else {
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
//# sourceMappingURL=index.js.map