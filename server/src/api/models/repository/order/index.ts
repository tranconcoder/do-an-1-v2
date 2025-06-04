
import orderModel from "@/models/order.model";
import { generateFindAll, generateFindById, generateFindOne } from "@/utils/mongoose.util";

/* ------------------- Common methods ------------------- */
export const findOrderById = generateFindById<model.order.OrderSchema>(orderModel);

export const findOneOrder = generateFindOne<model.order.OrderSchema>(orderModel)

export const findAllOrder = generateFindAll<model.order.OrderSchema>(orderModel)