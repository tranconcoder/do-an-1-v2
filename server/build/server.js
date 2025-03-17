"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load env
require("./src/api/helpers/loadEnv.helper");
const jsonfile_1 = __importDefault(require("jsonfile"));
// Configs
const server_config_1 = require("./src/configs/server.config");
// App
const app_1 = __importDefault(require("./src/app"));
const logger_service_1 = __importDefault(require("./src/api/services/logger.service"));
const db_app_1 = __importDefault(require("./src/app/db.app"));
const location_model_1 = require("./src/api/models/location.model");
const path_1 = __importDefault(require("path"));
const server = app_1.default.listen(server_config_1.PORT, server_config_1.HOST, () => {
    console.log(`Server is running on ${server_config_1.BASE_URL}`);
});
process.on('SIGINT', () => {
    // Close database connection
    db_app_1.default.getInstance().disconnect();
    // Close server
    server.close(() => {
        console.log('Server closed');
    });
    // Push notification to developer...
    logger_service_1.default.getInstance().info('Server closed');
});
/* ---------------------------------------------------------- */
/*                        Initial data                        */
/* ---------------------------------------------------------- */
const provinceJsonFile = path_1.default.join(__dirname, './src/api/assets/provinces.json');
const citiesJsonFile = path_1.default.join(__dirname, './src/api/assets/cities.json');
const districtJsonFile = path_1.default.join(__dirname, './src/api/assets/districts.json');
jsonfile_1.default.readFile(provinceJsonFile, (err, data) => {
    if (err) {
        return console.error(err);
    }
    location_model_1.provinceModel.insertMany(data).catch(() => { });
});
jsonfile_1.default.readFile(citiesJsonFile, (err, data) => {
    if (err) {
        return console.error(err);
    }
    location_model_1.cityModel.insertMany(data).catch(() => { });
});
jsonfile_1.default.readFile(districtJsonFile, (err, data) => {
    if (err) {
        return console.error(err);
    }
    location_model_1.districtModel.insertMany(data).catch(() => { });
});
