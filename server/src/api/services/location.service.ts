import {
    findCity,
    findDistrict,
    findOneCity,
    findOneDistrict,
    findOneProvince,
    findProvince
} from '@/models/repository/location/index.js';
import { provinceModel, cityModel, districtModel, locationModel } from '@/models/location.model.js';
import { BadRequestErrorResponse } from '@/response/error.response.js';

export default new (class LocationService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async createLocation({
        provinceId,
        cityId,
        districtId,
        address
    }: service.location.CreateLocation) {
        /* ---------------------- Check exists ---------------------- */
        const provinceExists = await provinceModel.exists({ _id: provinceId });
        if (!provinceExists) throw new BadRequestErrorResponse('Province is invalid!');

        const cityExists = await cityModel.exists({ _id: cityId });
        if (!cityExists) throw new BadRequestErrorResponse('City is invalid!');

        const district = !districtId || (await districtModel.exists({ _id: districtId }));
        if (!district) throw new BadRequestErrorResponse('District is invalid!');

        /* ----------------- Handle create location ----------------- */
        const saved = await locationModel.create({
            province: provinceId,
            city: cityId,
            district: districtId,
            address
        });
        if (!saved) throw new BadRequestErrorResponse('Create location failed!');

        return saved;
    }

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
        return await findOneDistrict({
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
            query: { city_slug: name },
            omit: 'metadata'
        });
    }
    /* ------------------ Get district by name ------------------ */
    async getDistrictByName(name: string) {
        return await findOneDistrict({
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
            only: ['province']
        }).populate('province');
    }

    /* --------------- Get province with district --------------- */
    async getProvinceWithDistrict(districtId: string) {
        return await findOneDistrict({
            query: { _id: districtId },
            only: ['province']
        }).populate('province');
    }

    /* ----------------- Get city with district ----------------- */
    async getCityWithDistrict(districtId: string) {
        return await findOneDistrict({
            query: { _id: districtId },
            only: ['city']
        }).populate('city');
    }

    /* ---------------------------------------------------------- */
    /*                         Get child                          */
    /* ---------------------------------------------------------- */

    /* --------------- Get all cities in province --------------- */
    async getAllCitiesInProvince(provinceId: string) {
        return await findCity({
            query: { province: provinceId },
            omit: 'metadata'
        });
    }

    /* ------------- Get all districts in province  ------------- */
    async getAllDistrictsInProvince(provinceId: string) {
        return await findDistrict({
            query: { province: provinceId },
            omit: 'metadata'
        });
    }

    /* --------------- Get all districts in city  --------------- */
    async getAllDistrictsInCity(cityId: string) {
        return await findDistrict({
            query: { city: cityId },
            omit: 'metadata'
        });
    }
})();
