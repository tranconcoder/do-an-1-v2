/* import Joi from 'joi';

const test = Joi.object({
    start: Joi.date().required(),
    end: Joi.date().greater(Joi.ref('start')).required()
});

const now = new Date().getTime();

const result = test.validate({
    start: new Date(now),
    end: new Date(now + 1)
});

console.log(result); */

import express, { Router } from 'express';

const app = express();
const testRoute = Router();
const testRouteValidated = Router();

app.use(testRoute);

testRoute.use(testRouteValidated);
testRouteValidated.use((req, res, next) => {
    console.log('Middleware running...');
});

testRoute.get('/', (req, res) => {
    console.log('Root route');
});

testRouteValidated.get('/validated', (req, res) => {
    console.log('Validated route');
});

app.listen(3000, () => {});
