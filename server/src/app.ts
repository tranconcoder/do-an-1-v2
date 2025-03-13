import express from 'express';

// Libs
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';

// Services
import HandleErrorService from './api/services/handleError.service';
import ScheduledService from './api/services/scheduled.service';

// Database
import MongoDB from './app/db.app';

// Configs
import { API_VERSION } from './configs/server.config';

// Routes
import rootRoute from './api/routes';
import { NotFoundErrorResponse } from './api/response/error.response';

const app = express();

/* ------------------------------------------------------ */
/*                  Express middlewares                   */
/* ------------------------------------------------------ */
// Body parser
app.use(express.json());
app.use(express.raw());
app.use(express.text());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

/* ------------------------------------------------------ */
/*                      Middlewares                       */
/* ------------------------------------------------------ */
// Morgan
app.use(morgan('dev'));
// Helmet for security
app.use(helmet());
// Compression
app.use(compression());

/* ------------------------------------------------------ */
/*                        Database                        */
/* ------------------------------------------------------ */
MongoDB.getInstance().connect();

// Start service
ScheduledService.startScheduledService();

/* ====================================================== */
/*                         ROUTES;                        */
/* ====================================================== */
// Append newest API version if not found
app.use([`/${API_VERSION}/api`, '/'], rootRoute);

// Handle 404 route
app.use((_, __, next) => {
    next(new NotFoundErrorResponse('Route not exist!'));
});

// Error handler
app.use(HandleErrorService.middleware);

export default app;
