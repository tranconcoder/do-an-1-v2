import { Router } from "express";
import catchError from "@/middlewares/catchError.middleware.js";
import locationController from "@/controllers/location.controller.js";
import { authenticate } from "@/middlewares/jwt.middleware.js";

const router = Router();
const routerValidated = Router();

/* ---------------------------------------------------------- */
/*                          Province                          */
/* ---------------------------------------------------------- */
router.get('/province', catchError(locationController.getAllProvince));

router.get('/province/:id', catchError(locationController.getProvinceById));

router.get('/province/name/:name', catchError(locationController.getProvinceByName));

router.get('/province/city/:city', catchError(locationController.getProvinceWithCity));

router.get('/province/district/:district', catchError(locationController.getProvinceWithDistrict));

/* ---------------------------------------------------------- */
/*                            City                            */
/* ---------------------------------------------------------- */

router.get('/city', catchError(locationController.getAllCity));

router.get('/city/:id', catchError(locationController.getCityById));

router.get('/city/name/:name', catchError(locationController.getCityByName));

router.get('/city/district/:district', catchError(locationController.getCityWithDistrict));

router.get('/city/province/:province', catchError(locationController.getAllCitiesInProvince));

/* ---------------------------------------------------------- */
/*                          District                          */
/* ---------------------------------------------------------- */

router.get('/district', catchError(locationController.getAllDistrict));

router.get('/district/:id', catchError(locationController.getDistrictById));

router.get('/district/name/:name', catchError(locationController.getDistrictByName));

router.get('/district/city/:city', catchError(locationController.getAllDistrictsInCity));

router.get(
    '/district/province/:province',
    catchError(locationController.getAllDistrictsInProvince)
);


/* ---------------------------------------------------------- */
/*                       Authenticated                        */
/* ---------------------------------------------------------- */
router.use(routerValidated);
routerValidated.use(authenticate);


export default router;
