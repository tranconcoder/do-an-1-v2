"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const lodash_1 = __importDefault(require("lodash"));
const mongoose_1 = __importDefault(require("mongoose"));
class UserService {
    static newInstance = (user) => {
        return new user_model_1.userModel(user);
    };
    static saveInstance = async (user) => {
        return await user.save();
    };
    static findOne = async (query) => {
        return await user_model_1.userModel.findOne(query).lean();
    };
    static checkUserExist = async (query) => {
        return await user_model_1.userModel.exists(query).lean();
    };
    static saveUser = async (data) => {
        const user = await user_model_1.userModel.create(data);
        return user ? lodash_1.default.pick(user, ['role', 'id']) : null;
    };
    static removeUser = async (id) => {
        const result = await user_model_1.userModel.deleteOne({
            _id: new mongoose_1.default.Types.ObjectId(id)
        });
        return result.deletedCount > 0;
    };
}
exports.default = UserService;
