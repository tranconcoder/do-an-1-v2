import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import slugify from 'slugify';
import { timestamps, required } from '@/configs/mongoose.config.js';

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
            enum: ['tỉnh', 'thành phố trung ương']
        },
        province_slug: String
    },
    {
        collection: PROVINCE_COLLECTION_NAME,
        timestamps
    }
);
provinceSchema.pre('save', function (next) {
    this.province_slug = slugify.default(this.province_name, { lower: true });

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
            enum: ['quận', 'huyện', 'thành phố', 'thị xã']
        },
        city_slug: String
    },
    {
        timestamps,
        collections: CITY_COLLECTION_NAME
    }
);
citySchema.pre('save', function (next) {
    this.city_slug = slugify(this.city_name, { lower: true });
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
            enum: ['phường', 'xã', 'thị trấn']
        },
        district_slug: String
    },
    {
        timestamps,
        collections: CITY_COLLECTION_NAME
    }
);
citySchema.pre('save', function (next) {
    this.city_slug = slugify(this.city_name, { lower: true });
    next();
});

export const districtModel = model(DISTRICT_MODEL_NAME, districtSchema);
