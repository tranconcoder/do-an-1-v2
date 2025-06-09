import AnalyticsService from '@/services/analytics.service.js';
import { Request, Response, NextFunction } from 'express';
import { OkResponse } from '@/response/success.response.js';
import shopModel from '@/models/shop.model.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';

export default new (class AnalyticsController {
    async getDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { timeRange = 'all' } = req.query;

            const stats = await AnalyticsService.getDashboardStats(timeRange as string);

            new OkResponse({
                message: 'Dashboard statistics retrieved successfully!',
                metadata: stats
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    async getShopDashboardStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { timeRange = 'all' } = req.query;
            const userId = (req as any).userId; // From auth middleware

            console.log('Analytics - Searching for shop with userId:', userId);

            // Find shop by user ID
            const shop = await shopModel.findOne({ shop_userId: userId }).lean();
            console.log('Analytics - Found shop:', shop ? { id: shop._id, name: shop.shop_name, status: shop.shop_status } : 'null');

            if (!shop) {
                throw new NotFoundErrorResponse({ message: 'Shop not found for this user!' });
            }


            new OkResponse({
                message: 'Shop dashboard statistics retrieved successfully!',
                metadata: await AnalyticsService.getShopDashboardStats(shop._id.toString(), timeRange as string)
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
})(); 