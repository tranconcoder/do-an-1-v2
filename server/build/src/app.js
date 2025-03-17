"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Libs
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
// Services
const handleError_service_1 = __importDefault(require("./api/services/handleError.service"));
const scheduled_service_1 = __importDefault(require("./api/services/scheduled.service"));
// Database
const db_app_1 = __importDefault(require("./app/db.app"));
// Configs
const server_config_1 = require("./configs/server.config");
// Routes
const routes_1 = __importDefault(require("./api/routes"));
const error_response_1 = require("./api/response/error.response");
const app = (0, express_1.default)();
/* ------------------------------------------------------ */
/*                  Express middlewares                   */
/* ------------------------------------------------------ */
// Body parser
app.use(express_1.default.json());
app.use(express_1.default.raw());
app.use(express_1.default.text());
// Parse URL-encoded bodies
app.use(express_1.default.urlencoded({ extended: true }));
/* ------------------------------------------------------ */
/*                      Middlewares                       */
/* ------------------------------------------------------ */
// Morgan
app.use((0, morgan_1.default)('dev'));
// Helmet for security
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)());
// Compression
app.use((0, compression_1.default)());
/* ------------------------------------------------------ */
/*                        Database                        */
/* ------------------------------------------------------ */
db_app_1.default.getInstance().connect();
// Start service
scheduled_service_1.default.startScheduledService();
/* ====================================================== */
/*                         ROUTES;                        */
/* ====================================================== */
// Append newest API version if not found
app.use([`/${server_config_1.API_VERSION}/api`, '/'], routes_1.default);
// Handle 404 route
app.use((_, __, next) => {
    next(new error_response_1.NotFoundErrorResponse('Route not exist!'));
});
// Error handler
app.use(handleError_service_1.default.middleware);
exports.default = app;
