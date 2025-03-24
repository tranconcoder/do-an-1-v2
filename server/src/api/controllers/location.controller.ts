import { OkResponse } from '@/response/success.response.js';
import locationService from '@/services/location.service.js';
import type { RequestWithBody } from '@/types/request.js';
import { RequestHandler } from 'express';

export default new (class LocationController {
    public createLocation: RequestWithBody<any> = (req, res, _) => {};

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

    /* --------------------- Get all cities --------------------- */
    public getAllCity: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all cities',
            metadata: await locationService.getAllCity()
        }).send(res);
    };

    /* -------------------- Get all district -------------------- */
    public getAllDistrict: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get all district',
            metadata: await locationService.getAllDistrict()
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

    /* --------------------- Get city by id ---------------------- */
    public getCityById: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get city by id',
            metadata: await locationService.getCityById(req.params.id)
        }).send(res);
    };

    /* ------------------- Get district by id ------------------- */
    public getDistrictById: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get district by id',
            metadata: await locationService.getDistrictById(req.params.id)
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

    /* -------------------- Get city by name --------------------- */
    public getCityByName: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get city by name',
            metadata: await locationService.getCityByName(req.params.name)
        }).send(res);
    };

    /* ------------------ Get district by name ------------------ */
    public getDistrictByName: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get district by name',
            metadata: await locationService.getDistrictByName(req.params.name)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                          Get with                          */
    /* ---------------------------------------------------------- */

    /* ----------------- Get province with city ----------------- */
    public getProvinceWithCity: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get province with city',
            metadata: await locationService.getProvinceWithCity(req.params.city)
        }).send(res);
    };

    /* --------------- Get province with district --------------- */
    public getProvinceWithDistrict: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get province with district',
            metadata: await locationService.getProvinceWithDistrict(req.params.district)
        }).send(res);
    };

    /* ------------------- Get city with district ---------------- */
    public getCityWithDistrict: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get city with district',
            metadata: await locationService.getCityWithDistrict(req.params.district)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                           Get in                           */
    /* ---------------------------------------------------------- */

    /* --------------- Get all cities in province --------------- */
    public getCitiesInProvince: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get city in province',
            metadata: await locationService.getCitiesInProvince(req.params.province)
        }).send(res);
    };

    /* ------------- Get all districts in province  ------------- */
    public getDistrictsInProvince: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get district in province',
            metadata: await locationService.getDistrictsInProvince(req.params.province)
        }).send(res);
    };

    /* ------------- Get all districts in city  ------------- */
    public getDistrictsInCity: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get district in city',
            metadata: await locationService.getDistrictsInCity(req.params.city)
        }).send(res);
    };
})();
