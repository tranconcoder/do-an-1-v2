"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var catchError_middleware_js_1 = require("@/middlewares/catchError.middleware.js");
var location_controller_js_1 = require("@/controllers/location.controller.js");
var jwt_middleware_js_1 = require("@/middlewares/jwt.middleware.js");
var router = (0, express_1.Router)();
var routerValidated = (0, express_1.Router)();
/* ---------------------------------------------------------- */
/*                          Province                          */
/* ---------------------------------------------------------- */
router.get('/province', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getAllProvince));
router.get('/province/:id', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getProvinceById));
router.get('/province/name/:name', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getProvinceByName));
router.get('/province/district/:district', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getProvinceWithDistrict));
router.get('/province/ward/:ward', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getProvinceWithWard));
/* ---------------------------------------------------------- */
/*                            District                            */
/* ---------------------------------------------------------- */
router.get('/district', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getAllDistrict));
router.get('/district/:id', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getDistrictById));
router.get('/district/name/:name', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getDistrictByName));
router.get('/district/ward/:ward', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getDistrictWithWard));
router.get('/district/province/:province', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getAllDistrictsInProvince));
/* ---------------------------------------------------------- */
/*                          Ward                          */
/* ---------------------------------------------------------- */
router.get('/ward', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getAllWard));
router.get('/ward/:id', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getWardById));
router.get('/ward/name/:name', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getWardByName));
router.get('/ward/district/:district', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getAllWardsInDistrict));
router.get('/ward/province/:province', (0, catchError_middleware_js_1.default)(location_controller_js_1.default.getAllWardsInProvince));
/* ---------------------------------------------------------- */
/*                       Authenticated                        */
/* ---------------------------------------------------------- */
router.use(routerValidated);
routerValidated.use(jwt_middleware_js_1.authenticate);
exports.default = router;
