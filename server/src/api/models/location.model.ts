import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import slugify from 'slugify';
import { timestamps, required } from '@/configs/mongoose.config.js';
import { CityType, DistrictType, ProvinceType } from '@/enums/location.enum.js';

/* ---------------------------------------------------------- */
/*                          Province                          */
/* ---------------------------------------------------------- */
export const PROVINCE_MODEL_NAME = 'Province';
export const PROVINCE_COLLECTION_NAME = 'provinces';

const provinceSchema = new Schema(
    {
        province_name: { type: String, required },
        province_type: {
            type: String,
            required,
            enum: ProvinceType
        },
        province_slug: String
    },
    {
        collection: PROVINCE_COLLECTION_NAME,
        timestamps
    }
);
provinceSchema.pre('save', function (next) {
    this.province_slug = slugify.default(this.province_name, { lower: true, locale: "vi" });

    next();
});

export const provinceModel = model(PROVINCE_MODEL_NAME, provinceSchema);

/* ---------------------------------------------------------- */
/*                            City                            */
/* ---------------------------------------------------------- */
export const CITY_MODEL_NAME = 'City';
export const CITY_COLLECTION_NAME = 'cities';

const citySchema = new Schema(
    {
        province: {
            type: ObjectId,
            ref: PROVINCE_MODEL_NAME,
            required
        },
        city_name: {
            type: String,
            required
        },
        city_type: {
            type: String,
            required,
            enum: CityType
        },
        city_slug: String
    },
    {
        timestamps,
        collections: CITY_COLLECTION_NAME
    }
);
citySchema.pre('save', function (next) {
    this.city_slug = slugify.default(this.city_name, { lower: true, locale: "vi" });
    next();
});

export const cityModel = model(CITY_MODEL_NAME, citySchema);

/* ---------------------------------------------------------- */
/*                          District                          */
/* ---------------------------------------------------------- */
export const DISTRICT_MODEL_NAME = 'District';
export const DISTRICT_COLLECTION_NAME = 'districts';

const districtSchema = new Schema(
    {
        province: {
            type: ObjectId,
            ref: PROVINCE_MODEL_NAME,
            required
        },
        city: {
            type: ObjectId,
            ref: CITY_MODEL_NAME,
            required
        },
        district_name: {
            type: String,
            required
        },
        district_type: {
            type: String,
            required,
            enum: DistrictType
        },
        district_slug: String
    },
    {
        timestamps,
        collections: CITY_COLLECTION_NAME
    }
);
districtSchema.pre('save', function (next) {
    this.district_slug= slugify.default(this.district_name, { lower: true, locale: "vi" });
    next()
});

export const districtModel = model(DISTRICT_MODEL_NAME, districtSchema);

/* ---------------------------------------------------------- */
/*                          Location                          */
/* ---------------------------------------------------------- */
export const LOCATION_MODEL_NAME = 'Location';
export const LOCATION_COLLECTION_NAME = 'locations';

export const locationSchema = new Schema<model.location.LocationSchema>({
    province: { type: ObjectId, ref: PROVINCE_MODEL_NAME, required },
    city: { type: ObjectId, ref: CITY_MODEL_NAME, required },
    district: { type: ObjectId, ref: DISTRICT_MODEL_NAME, required },
    address: { type: String, maxLength: 100, required }
}, {
    timestamps,
    collection: LOCATION_COLLECTION_NAME
});

export const locationModel = model(LOCATION_MODEL_NAME, locationSchema);
