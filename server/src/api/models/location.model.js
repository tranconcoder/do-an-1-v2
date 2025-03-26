"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationModel = exports.locationSchema = exports.LOCATION_COLLECTION_NAME = exports.LOCATION_MODEL_NAME = exports.wardModel = exports.WARD_COLLECTION_NAME = exports.WARD_MODEL_NAME = exports.districtModel = exports.DISTRICT_COLLECTION_NAME = exports.DISTRICT_MODEL_NAME = exports.provinceModel = exports.PROVINCE_COLLECTION_NAME = exports.PROVINCE_MODEL_NAME = void 0;
var mongoose_1 = require("mongoose");
var mongoose_config_js_1 = require("@/configs/mongoose.config.js");
var slugify_1 = require("slugify");
var mongoose_config_js_2 = require("@/configs/mongoose.config.js");
var location_enum_js_1 = require("@/enums/location.enum.js");
/* ---------------------------------------------------------- */
/*                          Province                          */
/* ---------------------------------------------------------- */
exports.PROVINCE_MODEL_NAME = 'Province';
exports.PROVINCE_COLLECTION_NAME = 'provinces';
var provinceSchema = new mongoose_1.Schema({
    province_name: { type: String, required: mongoose_config_js_2.required },
    province_type: {
        type: String,
        required: mongoose_config_js_2.required,
        enum: location_enum_js_1.ProvinceType
    },
    province_slug: String
}, {
    collection: exports.PROVINCE_COLLECTION_NAME,
    timestamps: mongoose_config_js_2.timestamps
});
provinceSchema.pre('save', function (next) {
    this.province_slug = slugify_1.default.default(this.province_name, { lower: true, locale: 'vi' });
    next();
});
exports.provinceModel = (0, mongoose_1.model)(exports.PROVINCE_MODEL_NAME, provinceSchema);
/* ---------------------------------------------------------- */
/*                            District                            */
/* ---------------------------------------------------------- */
exports.DISTRICT_MODEL_NAME = 'District';
exports.DISTRICT_COLLECTION_NAME = 'districts';
var districtSchema = new mongoose_1.Schema({
    province: {
        type: mongoose_config_js_1.ObjectId,
        ref: exports.PROVINCE_MODEL_NAME,
        required: mongoose_config_js_2.required
    },
    district_name: {
        type: String,
        required: mongoose_config_js_2.required
    },
    district_type: {
        type: String,
        required: mongoose_config_js_2.required,
        enum: location_enum_js_1.DistrictType
    },
    district_slug: String
}, {
    timestamps: mongoose_config_js_2.timestamps,
    collections: exports.DISTRICT_COLLECTION_NAME
});
districtSchema.pre('save', function (next) {
    this.district_slug = slugify_1.default.default(this.district_name, { lower: true, locale: 'vi' });
    next();
});
exports.districtModel = (0, mongoose_1.model)(exports.DISTRICT_MODEL_NAME, districtSchema);
/* ---------------------------------------------------------- */
/*                          Ward                          */
/* ---------------------------------------------------------- */
exports.WARD_MODEL_NAME = 'Ward';
exports.WARD_COLLECTION_NAME = 'wards';
var wardSchema = new mongoose_1.Schema({
    province: {
        type: mongoose_config_js_1.ObjectId,
        ref: exports.PROVINCE_MODEL_NAME,
        required: mongoose_config_js_2.required
    },
    district: {
        type: mongoose_config_js_1.ObjectId,
        ref: exports.DISTRICT_MODEL_NAME,
        required: mongoose_config_js_2.required
    },
    ward_name: {
        type: String,
        required: mongoose_config_js_2.required
    },
    ward_type: {
        type: String,
        required: mongoose_config_js_2.required,
        enum: location_enum_js_1.WardType
    },
    ward_slug: String
}, {
    timestamps: mongoose_config_js_2.timestamps,
    collections: exports.DISTRICT_COLLECTION_NAME
});
wardSchema.pre('save', function (next) {
    this.ward_slug = slugify_1.default.default(this.ward_name, { lower: true, locale: 'vi' });
    next();
});
exports.wardModel = (0, mongoose_1.model)(exports.WARD_MODEL_NAME, wardSchema);
/* ---------------------------------------------------------- */
/*                          Location                          */
/* ---------------------------------------------------------- */
exports.LOCATION_MODEL_NAME = 'Location';
exports.LOCATION_COLLECTION_NAME = 'locations';
exports.locationSchema = new mongoose_1.Schema({
    province: { type: mongoose_config_js_1.ObjectId, ref: exports.PROVINCE_MODEL_NAME, required: mongoose_config_js_2.required },
    district: { type: mongoose_config_js_1.ObjectId, ref: exports.DISTRICT_MODEL_NAME, required: mongoose_config_js_2.required },
    ward: { type: mongoose_config_js_1.ObjectId, ref: exports.WARD_MODEL_NAME, required: mongoose_config_js_2.required },
    address: { type: String, maxLength: 200, required: mongoose_config_js_2.required },
    text: { type: String, required: mongoose_config_js_2.required }
}, {
    timestamps: mongoose_config_js_2.timestamps,
    collection: exports.LOCATION_COLLECTION_NAME
});
exports.locationModel = (0, mongoose_1.model)(exports.LOCATION_MODEL_NAME, exports.locationSchema);
