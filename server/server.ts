// Load env
import './src/api/helpers/loadEnv.helper';
import jsonfile from 'jsonfile';

// Configs
import { HOST, PORT, BASE_URL } from './src/configs/server.config.js';

// App
import app from './src/app.js';
import loggerService from './src/api/services/logger.service.js';
import MongoDB from './src/app/db.app.js';
import { provinceModel, cityModel, districtModel } from './src/api/models/location.model.js';
import path from 'path';

const server = app.listen(PORT, HOST, () => {
    console.log(`Server is running on ${BASE_URL}`);
});

process.on('SIGINT', async () => {
    // Close database connection
    MongoDB.getInstance().disconnect();

    // Close server
    server.close(() => {
        console.log('Server closed');
    });

    // Push notification to developer...
    loggerService.getInstance().info('Server closed');
});

/* ---------------------------------------------------------- */
/*                        Initial data                        */
/* ---------------------------------------------------------- */
const provinceJsonFile = path.join(import.meta.dirname, './src/api/assets/provinces.json');
const citiesJsonFile = path.join(import.meta.dirname, './src/api/assets/cities.json');
const districtJsonFile = path.join(import.meta.dirname, './src/api/assets/districts.json');
jsonfile.readFile(provinceJsonFile, (err, data) => {
    if (err) {
        return console.error(err);
    }

    provinceModel.insertMany(data).catch(() => {});
});
jsonfile.readFile(citiesJsonFile, (err, data) => {
    if (err) {
        return console.error(err);
    }

    cityModel.insertMany(data).catch(() => {});
});
jsonfile.readFile(districtJsonFile, (err, data) => {
    if (err) {
        return console.error(err);
    }

    districtModel.insertMany(data).catch(() => {});
});
