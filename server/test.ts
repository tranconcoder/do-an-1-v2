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
/*
import express, { Router } from 'express';
import mongoose, { Schema, model } from 'mongoose';

mongoose.connect('mongodb://localhost:27017');

const testModel = model(
    'testModel',
    new Schema({
        stock: Number
    })
);

const app = express();
const testRoute = Router();
let i = 0;

app.get('/', (req, res, next) => {
    testModel.updateOne({ stock: { $gt: 0 } }, { $inc: { stock: -1 } }).then((order) => {
        if (order.modifiedCount > 0) {
            const result = {
                success: true,
                i,
                // stock_after: order.stock,
                messsage: 'Order successully!'
            };

            console.log(i++);
            res.status(200).send();
        } else {
            console.log('Het hang');
            res.status(400).send();
        }
    });
});

app.listen(3000, () => {}); */



/* --------------------- Add stack test --------------------- */
