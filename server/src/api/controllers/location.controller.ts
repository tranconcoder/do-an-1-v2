import type { RequestWithBody, RequestWithParams } from '@/types/request.js';

import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import locationService from '@/services/location.service.js';
import { RequestHandler } from 'express';

export default new (class LocationController {
    /* ---------------------------------------------------------- */
    /*                      Create location                       */
    /* ---------------------------------------------------------- */
    public createLocation: RequestWithBody<joi.location.CreateLocation> = async (req, res, _) => {
        new CreatedResponse({
            message: 'Location created',
            metadata: await locationService.createLocation(req.body)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                          Get all                           */
    /* ---------------------------------------------------------- */

    /* ------------------- Get all provinces  ------------------- */
    public getAllProvince: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all provinces',
            metadata: await locationService.getAllProvince()
        }).send(res);
    };

    /* --------------------- Get all districts --------------------- */
    public getAllDistrict: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all districts',
            metadata: await locationService.getAllDistrict()
        }).send(res);
    };

    /* -------------------- Get all ward -------------------- */
    public getAllWard: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all ward',
            metadata: await locationService.getAllWard()
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                         Get by id                          */
    /* ---------------------------------------------------------- */

    /* ------------------- Get province by id ------------------- */
    public getProvinceById: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get province by id',
            metadata: await locationService.getProvinceById(req.params.id)
        }).send(res);
    };

    /* --------------------- Get district by id ---------------------- */
    public getDistrictById: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get district by id',
            metadata: await locationService.getDistrictById(req.params.id)
        }).send(res);
    };

    /* ------------------- Get ward by id ------------------- */
    public getWardById: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get ward by id',
            metadata: await locationService.getWardById(req.params.id)
        }).send(res);
    };

    public getLocationById: RequestWithParams<{ locationId: string }> = async (req, res, _) => {
        new OkResponse({
            message: 'Get location by id',
            metadata: await locationService.getLocationById(req.params.locationId)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                        Get by name                         */
    /* ---------------------------------------------------------- */

    /* ------------------ Get province by name ------------------ */
    public getProvinceByName: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get province by name',
            metadata: await locationService.getProvinceByName(req.params.name)
        }).send(res);
    };

    /* -------------------- Get district by name --------------------- */
    public getDistrictByName: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get district by name',
            metadata: await locationService.getDistrictByName(req.params.name)
        }).send(res);
    };

    /* ------------------ Get ward by name ------------------ */
    public getWardByName: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get ward by name',
            metadata: await locationService.getWardByName(req.params.name)
        }).send(res);
    };

    /* --------------------------------------------------------- */
    /*                          Get with                          */
    /* ---------------------------------------------------------- */

    /* ----------------- Get province with district ----------------- */
    public getProvinceWithDistrict: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get province with district',
            metadata: await locationService.getProvinceWithDistrict(req.params.district)
        }).send(res);
    };

    /* --------------- Get province with ward --------------- */
    public getProvinceWithWard: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get province with ward',
            metadata: await locationService.getProvinceWithWard(req.params.ward)
        }).send(res);
    };

    /* ------------------- Get district with ward ---------------- */
    public getDistrictWithWard: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get district with ward',
            metadata: await locationService.getDistrictWithWard(req.params.ward)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                         Get child                          */
    /* ---------------------------------------------------------- */

    /* --------------- Get all districts in province --------------- */
    public getAllDistrictsInProvince: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get district in province',
            metadata: await locationService.getAllDistrictsInProvince(req.params.province)
        }).send(res);
    };

    /* ------------- Get all wards in province  ------------- */
    public getAllWardsInProvince: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get ward in province',
            metadata: await locationService.getAllWardsInProvince(req.params.province)
        }).send(res);
    };

    /* ------------- Get all wards in district  ------------- */
    public getAllWardsInDistrict: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get ward in district',
            metadata: await locationService.getAllWardsInDistrict(req.params.district)
        }).send(res);
    };
})();
