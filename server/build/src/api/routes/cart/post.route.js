"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = __importDefault(require("../../controllers/cart.controller"));
const catchError_middleware_1 = __importDefault(require("../../middlewares/catchError.middleware"));
const joiValidate_middleware_1 = __importStar(require("../../middlewares/joiValidate.middleware"));
const jwt_middleware_1 = require("../../middlewares/jwt.middleware");
const cart_joi_1 = require("../../validations/joi/cart.joi");
const router = (0, express_1.Router)();
const routerValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                        Authenticate                        */
/* ---------------------------------------------------------- */
router.use(routerValidated);
routerValidated.use(jwt_middleware_1.authenticate);
routerValidated.post('/add/:productId', (0, joiValidate_middleware_1.validateRequestParams)(cart_joi_1.addToCartSchema), (0, catchError_middleware_1.default)(cart_controller_1.default.addToCart));
routerValidated.post('/test', (0, joiValidate_middleware_1.default)(cart_joi_1.updateCart), (req, res, next) => {
    console.log(req.body);
    res.send('ok');
});
exports.default = router;
