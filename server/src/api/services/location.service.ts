import { findOneDiscount } from '@/models/repository/discount/index.js';
import {
    findCity,
    findDistrict,
    findOneCity,
    findOneDistrict,
    findOneProvince,
    findProvince
} from '@/models/repository/location/index.js';

export default new (class LocationService {
    /* ---------------------------------------------------------- */
    /*                          Get all                           */
    /* ---------------------------------------------------------- */
    /* -------------------- Get all province -------------------- */
    async getAllProvince() {
        return await findProvince({ query: {}, omit: 'metadata' });
    }

    /* ---------------------- Get all city ---------------------- */
    async getAllCity() {
        return await findCity({ query: {}, omit: 'metadata' });
    }

    /* -------------------- Get all district -------------------- */
    async getAllDistrict() {
        return await findDistrict({ query: {}, omit: 'metadata' });
    }

    /* ---------------------------------------------------------- */
    /*                         Get by id                          */
    /* ---------------------------------------------------------- */
    async getProvinceById(id: string) {
        return await findOneProvince({
            query: { _id: id },
            omit: 'metadata'
        });
    }
    async getCityById(id: string) {
        return await findOneCity({
            query: { _id: id },
            omit: 'metadata'
        });
    }
    async getDistrictById(id: string) {
        return await findOneDiscount({
            query: { _id: id },
            omit: 'metadata'
        });
    }

    /* ---------------------------------------------------------- */
    /*                         Get by name                        */
    /* ---------------------------------------------------------- */

    /* ------------------ Get province by name ------------------ */
    async getProvinceByName(name: string) {
        return await findOneProvince({
            query: { province_slug: name },
            omit: 'metadata'
        });
    }
    /* -------------------- Get city by name -------------------- */
    async getCityByName(name: string) {
        return await findOneCity({
            query: { city_slug : name },
            omit: 'metadata'
        });
    }
    /* ------------------ Get district by name ------------------ */
    async getDistrictByName(name: string) {
        return await findOneDiscount({
            query: { district_slug: name },
            omit: 'metadata'
        });
    }

    /* ---------------------------------------------------------- */
    /*                         Get with                          */
    /* ---------------------------------------------------------- */

    /* ----------------- Get province with city ----------------- */
    async getProvinceWithCity(cityId: string) {
        return await findOneCity({
            query: { _id: cityId },
            select: ['province'],
            omit: 'metadata'
        }).populate('province');
    }

    /* --------------- Get province with district --------------- */
    async getProvinceWithDistrict(districtId: string) {
        return await findOneDistrict({
            query: { _id: districtId },
            select: ['province'],
            omit: 'metadata'
        }).populate('province');
    }

    /* ----------------- Get city with district ----------------- */
    async getCityWithDistrict(districtId: string) { 
        return await findOneDistrict({
            query: { _id: districtId },
            select: ['city'],
            omit: 'metadata'
        }).populate('city');
    }
})();
