import { findOneCheckout } from '../models/repository/checkout/index';
import { NotFoundErrorResponse } from '../response/error.response';

export default new (class OrderService {
    public async createOrder({ userId }: serviceTypes.order.arguments.CreateOrder) {
        /* ------------------- Check information  ------------------- */
        const shipInfo = {
            // ...
        };
        if (!shipInfo) throw new NotFoundErrorResponse('Not found ship info!');

        /* ------------------ Check checkout info  ------------------ */
        const checkout = await findOneCheckout({ query: { user: userId } });
        if (!checkout) throw new NotFoundErrorResponse('Not found checkout info!');

    }
})();
