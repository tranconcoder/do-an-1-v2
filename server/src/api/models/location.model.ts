import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import slugify from 'slugify';
import { timestamps, required } from '@/configs/mongoose.config.js';
import { DistrictType, WardType, ProvinceType } from '@/enums/location.enum.js';

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
    this.province_slug = slugify.default(this.province_name, { lower: true, locale: 'vi' });

    next();
});

export const provinceModel = model(PROVINCE_MODEL_NAME, provinceSchema);

/* ---------------------------------------------------------- */
/*                            District                            */
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
        collections: DISTRICT_COLLECTION_NAME
    }
);
districtSchema.pre('save', function (next) {
    this.district_slug = slugify.default(this.district_name, { lower: true, locale: 'vi' });
    next();
});

export const districtModel = model(DISTRICT_MODEL_NAME, districtSchema);

/* ---------------------------------------------------------- */
/*                          Ward                          */
/* ---------------------------------------------------------- */
export const WARD_MODEL_NAME = 'Ward';
export const WARD_COLLECTION_NAME = 'wards';

const wardSchema = new Schema(
    {
        province: {
            type: ObjectId,
            ref: PROVINCE_MODEL_NAME,
            required
        },

        district: {
            type: ObjectId,
            ref: DISTRICT_MODEL_NAME,
            required
        },

        ward_name: {
            type: String,
            required
        },

        ward_type: {
            type: String,
            required,
            enum: WardType
        },

        ward_slug: String
    },
    {
        timestamps,
        collections: DISTRICT_COLLECTION_NAME
    }
);
wardSchema.pre('save', function (next) {
    this.ward_slug = slugify.default(this.ward_name, { lower: true, locale: 'vi' });
    next();
});

export const wardModel = model(WARD_MODEL_NAME, wardSchema);

/* ---------------------------------------------------------- */
/*                          Location                          */
/* ---------------------------------------------------------- */
export const LOCATION_MODEL_NAME = 'Location';
export const LOCATION_COLLECTION_NAME = 'locations';

export const locationSchema = new Schema<model.location.LocationSchema>(
    {
        province: { type: ObjectId, ref: PROVINCE_MODEL_NAME, required },

        district: { type: ObjectId, ref: DISTRICT_MODEL_NAME, required },

        ward: { type: ObjectId, ref: WARD_MODEL_NAME, required: false },

        address: { type: String, maxLength: 200, required },

        text: { type: String, required },

        // Coordinates
        coordinates: {
            x: { type: Number, required },
            y: { type: Number, required }
        }

    },
    {
        timestamps,
        collection: LOCATION_COLLECTION_NAME
    }
);

export const locationModel = model(LOCATION_MODEL_NAME, locationSchema);
