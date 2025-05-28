import { Router } from 'express';
import catchError from '@/middlewares/catchError.middleware.js';
import locationController from '@/controllers/location.controller.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { validateRequestParams } from '@/middlewares/joiValidate.middleware.js';
import { validateParamsId } from '@/configs/joi.config.js';

const router = Router();
const routerValidated = Router();

/* ---------------------------------------------------------- */
/*                           Common                           */
/* ---------------------------------------------------------- */
router.get(
    '/location/:locationId',
    validateParamsId('locationId'),
    catchError(locationController.getLocationById)
);

/* ---------------------------------------------------------- */
/*                          Province                          */
/* ---------------------------------------------------------- */
router.get('/province', catchError(locationController.getAllProvince));

router.get('/province/:id', catchError(locationController.getProvinceById));

router.get('/province/name/:name', catchError(locationController.getProvinceByName));

router.get('/province/district/:district', catchError(locationController.getProvinceWithDistrict));

router.get('/province/ward/:ward', catchError(locationController.getProvinceWithWard));

/* ---------------------------------------------------------- */
/*                            District                            */
/* ---------------------------------------------------------- */
router.get('/district', catchError(locationController.getAllDistrict));

router.get('/district/:id', catchError(locationController.getDistrictById));

router.get('/district/name/:name', catchError(locationController.getDistrictByName));

router.get('/district/ward/:ward', catchError(locationController.getDistrictWithWard));

router.get(
    '/district/province/:province',
    catchError(locationController.getAllDistrictsInProvince)
);

/* ---------------------------------------------------------- */
/*                          Ward                          */
/* ---------------------------------------------------------- */

router.get('/ward', catchError(locationController.getAllWard));

router.get('/ward/:id', catchError(locationController.getWardById));

router.get('/ward/name/:name', catchError(locationController.getWardByName));

router.get('/ward/district/:district', catchError(locationController.getAllWardsInDistrict));

router.get('/ward/province/:province', catchError(locationController.getAllWardsInProvince));

/* ---------------------------------------------------------- */
/*                       Authenticated                        */
/* ---------------------------------------------------------- */
router.use(routerValidated);
routerValidated.use(authenticate);

export default router;
