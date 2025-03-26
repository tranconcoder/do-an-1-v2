"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cart_controller_js_1 = require("@/controllers/cart.controller.js");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var joiValidate_middleware_js_1 = require("@/middlewares/joiValidate.middleware.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var cart_joi_js_1 = require("@/validations/joi/cart.joi.js");
var router = (0, express_1.Router)();
var routerValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
router.use(routerValidated);
routerValidated.use(jwt_middleware_js_1.authenticate);
routerValidated.post('/add/:productId', (0, joiValidate_middleware_js_1.validateRequestParams)(cart_joi_js_1.addToCartSchema), (0, catchError_middleware_js_1.default)(cart_controller_js_1.default.addToCart));
routerValidated.post('/test', (0, joiValidate_middleware_js_1.default)(cart_joi_js_1.updateCart), function (req, res, next) {
    console.log(req.body);
    res.send('ok');
});
exports.default = router;
