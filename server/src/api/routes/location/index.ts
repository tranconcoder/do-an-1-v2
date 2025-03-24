import {authenticate} from "@/middlewares/jwt.middleware.js";
import { Router } from "express";

const router = Router();
const routerValidate = Router();



/* ---------------------------------------------------------- */
/*                       Authenticated                        */
/* ---------------------------------------------------------- */
router.use(routerValidate);
routerValidate.use(authenticate)


export default router;
