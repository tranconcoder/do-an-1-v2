import SuccessResponse, {OkResponse} from '@/response/success.response.js';
import locationService from '@/services/location.service.js';
import type { RequestWithBody } from '@/types/request.js';
import {RequestHandler} from 'express';

export default new (class LocationController {
    public createLocation: RequestWithBody<any> = (req, res, _) => {};

    /* ---------------------------------------------------------- */
    /*                         Provinces                          */
    /* ---------------------------------------------------------- */
    /* ------------------- Get all provinces  ------------------- */
    public getAllProvince: RequestHandler = (req, res, _) => {
        new OkResponse({
            message: 'Get all provinces',
            metadata: await locationService.getAllProvince()
        })
    };

    /* ------------------- Get province by id ------------------- */

    /* ------------------ Get province by name ------------------ */

    /* ----------------- Get province with city ----------------- */

    /* --------------- Get province with district --------------- */


    /* ---------------------------------------------------------- */
    /*                           Cities                           */
    /* ---------------------------------------------------------- */

    /* --------------------- Get all cities --------------------- */

    /* --------------------- Get city by id ---------------------- */

    /* -------------------- Get city by name --------------------- */

    /* ------------------- Get city with district ---------------- */
})();
