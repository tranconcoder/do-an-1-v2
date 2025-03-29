import { findAllPendingShop } from '@/models/repository/shop/index.js';

export default new (class AdminService {
    async getAllPendingShop({ limit, page }: service.shop.arguments.GetPendingShop) {
        return await findAllPendingShop({ limit, page });
    }
})();
