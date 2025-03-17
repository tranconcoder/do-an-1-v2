"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.districtModel = exports.DISTRICT_COLLECTION_NAME = exports.DISTRICT_MODEL_NAME = exports.cityModel = exports.CITY_COLLECTION_NAME = exports.CITY_MODEL_NAME = exports.provinceModel = exports.PROVINCE_COLLECTION_NAME = exports.PROVINCE_MODEL_NAME = void 0;
const mongoose_1 = require("mongoose");
const slugify_1 = __importDefault(require("slugify"));
const mongoose_config_1 = require("../../configs/mongoose.config");
/* ---------------------------------------------------------- */
/*                          Province                          */
/* ---------------------------------------------------------- */
exports.PROVINCE_MODEL_NAME = 'Province';
exports.PROVINCE_COLLECTION_NAME = 'provinces';
const provinceSchema = new mongoose_1.Schema({
    province_name: { type: String, required: mongoose_config_1.required },
    province_type: {
        type: String,
        required: mongoose_config_1.required,
        enum: ['tỉnh', 'thành phố trung ương']
    },
    province_slug: String
}, {
    collection: exports.PROVINCE_COLLECTION_NAME,
    timestamps: mongoose_config_1.timestamps
});
provinceSchema.pre('save', function (next) {
    this.province_slug = (0, slugify_1.default)(this.province_name, { lower: true });
    next();
});
exports.provinceModel = (0, mongoose_1.model)(exports.PROVINCE_MODEL_NAME, provinceSchema);
/* ---------------------------------------------------------- */
/*                            City                            */
/* ---------------------------------------------------------- */
exports.CITY_MODEL_NAME = 'City';
exports.CITY_COLLECTION_NAME = 'cities';
const citySchema = new mongoose_1.Schema({
    province: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: exports.PROVINCE_MODEL_NAME,
        required: mongoose_config_1.required
    },
    city_name: {
        type: String,
        required: mongoose_config_1.required
    },
    city_type: {
        type: String,
        required: mongoose_config_1.required,
        enum: ['quận', 'huyện', 'thành phố', 'thị xã']
    },
    city_slug: String
}, {
    timestamps: mongoose_config_1.timestamps,
    collections: exports.CITY_COLLECTION_NAME
});
citySchema.pre('save', function (next) {
    this.city_slug = (0, slugify_1.default)(this.city_name, { lower: true });
    next();
});
exports.cityModel = (0, mongoose_1.model)(exports.CITY_MODEL_NAME, citySchema);
/* ---------------------------------------------------------- */
/*                          District                          */
/* ---------------------------------------------------------- */
exports.DISTRICT_MODEL_NAME = 'District';
exports.DISTRICT_COLLECTION_NAME = 'districts';
const districtSchema = new mongoose_1.Schema({
    province: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: exports.PROVINCE_MODEL_NAME,
        required: mongoose_config_1.required
    },
    city: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: exports.CITY_MODEL_NAME,
        required: mongoose_config_1.required
    },
    district_name: {
        type: String,
        required: mongoose_config_1.required
    },
    district_type: {
        type: String,
        required: mongoose_config_1.required,
        enum: ['phường', 'xã', 'thị trấn']
    },
    district_slug: String
}, {
    timestamps: mongoose_config_1.timestamps,
    collections: exports.CITY_COLLECTION_NAME
});
citySchema.pre('save', function (next) {
    this.city_slug = (0, slugify_1.default)(this.city_name, { lower: true });
    next();
});
exports.districtModel = (0, mongoose_1.model)(exports.DISTRICT_MODEL_NAME, districtSchema);
