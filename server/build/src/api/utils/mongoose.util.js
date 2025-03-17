"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFindOneAndUpdate = exports.generateUpdateAll = exports.generateFindAllPageSplit = exports.omitFields = exports.get$SetNestedFromObject = exports.addFieldToSchemaDefinition = exports.convertToMongooseId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_config_1 = require("../../configs/mongoose.config");
const convertToMongooseId = (id) => new mongoose_1.default.Types.ObjectId(id);
exports.convertToMongooseId = convertToMongooseId;
const addFieldToSchemaDefinition = (schema, field) => {
    return {
        ...schema,
        ...field
    };
};
exports.addFieldToSchemaDefinition = addFieldToSchemaDefinition;
const get$SetNestedFromObject = (source, target, parent = '') => {
    Object.keys(source).forEach((k) => {
        const targetKey = parent === '' ? k : `${parent}.${k}`;
        if (source[k] instanceof Object && !Array.isArray(source[k])) {
            (0, exports.get$SetNestedFromObject)(source[k], target, targetKey);
        }
        else {
            target[targetKey] = source[k];
        }
    });
};
exports.get$SetNestedFromObject = get$SetNestedFromObject;
const omitFields = (fields) => {
    const results = {};
    fields.forEach((field) => {
        results[field] = 0;
    });
    return results;
};
exports.omitFields = omitFields;
/* -------------------- Find all wrapper -------------------- */
const generateFindAllPageSplit = (model) => {
    return async ({ query, projection = {}, sort = {}, limit = 50, page = 1, select = [], omit = [] }) => {
        const skip = limit * (page - 1);
        for (const field of select)
            projection[field] = 1;
        for (const field of omit)
            projection[field] = 0;
        return await model.find(query, projection).sort(sort).skip(skip).limit(limit).lean();
    };
};
exports.generateFindAllPageSplit = generateFindAllPageSplit;
/* ------------------- Update all wrapper ------------------- */
const generateUpdateAll = (model) => {
    return async ({ query, update }) => {
        return (await model.updateMany(query, update).modifiedCount) > 0;
    };
};
exports.generateUpdateAll = generateUpdateAll;
const generateFindOneAndUpdate = (model) => {
    return ({ query, update, options = {}, select = [], omit = [], sort = 'ctime', projection = {} }) => {
        /* ------------------------- Select ------------------------- */
        for (const field of select)
            projection[field] = 1;
        /* -------------------------- Omit -------------------------- */
        if (omit === 'metadata') {
            const metadataField = ['__v', ...Object.values(mongoose_config_1.timestamps)];
            for (const field of metadataField)
                projection[field] = 0;
        }
        else
            for (const field of omit)
                projection[field] = 0;
        const result = model
            .findOneAndUpdate(query, update, options)
            .select(projection)
            .sort(sort === 'ctime' ? { [mongoose_config_1.timestamps.updatedAt]: -1 } : sort);
        return result;
    };
};
exports.generateFindOneAndUpdate = generateFindOneAndUpdate;
