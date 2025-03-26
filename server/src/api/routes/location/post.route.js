"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var location_controller_js_1 = require("@/controllers/location.controller.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var location_joi_js_1 = require("@/validations/joi/location.joi.js");
var express_1 = require("express");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var router = (0, express_1.Router)();
var routerValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                         Validated                          */
/* ---------------------------------------------------------- */
router.use(routerValidated);
routerValidated.use(jwt_middleware_js_1.authenticate);
/* ------------------ Create new location  ------------------ */
router.post('/', (0, joiValidate_middleware_js_1.default)(location_joi_js_1.createLocation), (0, catchError_middleware_js_1.default)(location_controller_js_1.default.createLocation));
exports.default = router;
