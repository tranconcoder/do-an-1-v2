import { Router } from "express";

// Middlewares
import { authenticate } from "@/middlewares/jwt.middleware.js";
import catchError from "@/middlewares/catchError.middleware.js";

// Validations
import { validateUpdateprofile } from "@/validations/zod/user.joi.js";

// Controller
import userController from "@/controllers/user.controller.js";

const patchRoute = Router();
const patchRouteValidated = Router();

patchRoute.use(patchRouteValidated);
patchRouteValidated.use(authenticate);

patchRouteValidated.patch(
    "/profile",
    validateUpdateprofile,
    catchError(userController.updateProfile));

export default patchRoute;