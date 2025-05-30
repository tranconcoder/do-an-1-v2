
import orderModel from "@/models/order.model";
import { generateFindAll, generateFindOne } from "@/utils/mongoose.util";

/* ------------------- Common methods ------------------- */
export const findOneOrder = generateFindOne<model.order.OrderSchema>(orderModel)

export const findAllOrder = generateFindAll<model.order.OrderSchema>(orderModel)