import moment from 'moment';
import { Types } from 'mongoose';
import orderModel from '@/models/order.model.js';
import shopModel from '@/models/shop.model.js';
import { userModel } from '@/models/user.model.js';
import { spuModel } from '@/models/spu.model.js';

export default new (class AnalyticsService {
    public async getDashboardStats(timeRange: string = 'all') {
        const dateFilter = await this.getDateFilter(timeRange);

        // Parallel queries for better performance
        const [
            totalOrders,
            totalShops,
            totalUsers,
            totalProducts,
            orderStats,
            shopStats,
            ordersByDay
        ] = await Promise.all([
            this.getTotalOrders(dateFilter),
            this.getTotalShops(dateFilter),
            this.getTotalUsers(dateFilter),
            this.getTotalProducts(dateFilter),
            this.getOrderStats(dateFilter),
            this.getShopStats(dateFilter),
            this.getOrdersByDay(timeRange)
        ]);

        return {
            overview: {
                totalOrders,
                totalShops,
                totalUsers,
                totalProducts
            },
            orderStats,
            shopStats,
            charts: {
                ordersByDay
            }
        };
    }

    public async getShopDashboardStats(shopId: string, timeRange: string = 'all') {
        const dateFilter = await this.getDateFilter(timeRange);
        // Convert shopId to ObjectId for proper MongoDB querying
        const shopObjectId = new Types.ObjectId(shopId);
        const shopFilter = { shop_id: shopObjectId, ...dateFilter };

        console.log('Analytics Service - shopId (string):', shopId);
        console.log('Analytics Service - shopObjectId:', shopObjectId);
        console.log('Analytics Service - dateFilter:', dateFilter);
        console.log('Analytics Service - shopFilter:', shopFilter);

        // Check if there are any orders for this shop
        const testOrderCount = await orderModel.countDocuments({ shop_id: shopObjectId });
        console.log('Analytics Service - Total orders for this shop (all time):', testOrderCount);

        // Check if orders exist with different date field
        const testOrdersWithCreatedAt = await orderModel.countDocuments({
            shop_id: shopObjectId,
            createdAt: { $exists: true }
        });
        const testOrdersWithCreated_at = await orderModel.countDocuments({
            shop_id: shopObjectId,
            created_at: { $exists: true }
        });
        console.log('Orders with createdAt field:', testOrdersWithCreatedAt);
        console.log('Orders with created_at field:', testOrdersWithCreated_at);

        // Test sample order to check actual field names
        const sampleOrder = await orderModel.findOne({ shop_id: shopObjectId }).lean();
        console.log('Sample order keys:', sampleOrder ? Object.keys(sampleOrder) : 'No orders found');

        // Parallel queries for shop data
        const [
            totalOrders,
            totalRevenue,
            orderStats,
            ordersByDay,
            productCount,
            recentOrders,
            topProducts
        ] = await Promise.all([
            this.getShopTotalOrders(shopFilter),
            this.getShopTotalRevenue(shopFilter),
            this.getShopOrderStats(shopFilter),
            this.getShopOrdersByDay(shopId, timeRange),
            this.getShopProductCount(shopId, dateFilter),
            this.getShopRecentOrders(shopId),
            this.getShopTopProductsByRevenue(shopId, dateFilter)
        ]);

        return {
            overview: {
                totalOrders,
                totalRevenue,
                productCount
            },
            orderStats,
            recentOrders,
            charts: {
                ordersByDay,
                topProducts
            }
        };
    }

    private async getShopTotalOrders(filter: any) {
        const total = await orderModel.countDocuments(filter);

        // Get percentage change from previous period
        const prevPeriodFilter = this.getPreviousPeriodFilter(filter);
        const prevTotal = await orderModel.countDocuments({
            ...prevPeriodFilter,
            shop_id: filter.shop_id
        });

        const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

        return { total, change: Math.round(change * 100) / 100 };
    }

    private async getShopTotalRevenue(filter: any) {
        // Only count revenue from completed orders
        const revenueFilter = { ...filter, order_status: 'completed' };

        const pipeline = [
            { $match: revenueFilter },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price_to_payment' }
                }
            }
        ];

        const result = await orderModel.aggregate(pipeline);
        const total = result[0]?.total || 0;

        // Get percentage change from previous period (also only completed orders)
        const prevPeriodFilter = this.getPreviousPeriodFilter(filter);
        const prevRevenueFilter = { ...prevPeriodFilter, shop_id: filter.shop_id, order_status: 'completed' };

        const prevPipeline = [
            { $match: prevRevenueFilter },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price_to_payment' }
                }
            }
        ];

        const prevResult = await orderModel.aggregate(prevPipeline);
        const prevTotal = prevResult[0]?.total || 0;

        const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

        console.log('Revenue calculation:', {
            revenueFilter,
            total,
            prevTotal,
            change
        });

        return { total, change: Math.round(change * 100) / 100 };
    }

    private async getShopOrderStats(filter: any) {
        const pipeline = [
            { $match: filter },
            {
                $group: {
                    _id: '$order_status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$price_to_payment' }
                }
            }
        ];

        const stats = await orderModel.aggregate(pipeline);

        const orderStats = {
            pending: { count: 0, totalValue: 0 },
            confirmed: { count: 0, totalValue: 0 },
            shipped: { count: 0, totalValue: 0 },
            delivered: { count: 0, totalValue: 0 },
            cancelled: { count: 0, totalValue: 0 }
        };

        stats.forEach(stat => {
            if (stat._id && (orderStats as any)[stat._id]) {
                (orderStats as any)[stat._id] = {
                    count: stat.count,
                    totalValue: stat.totalValue
                };
            }
        });

        return orderStats;
    }

    private async getShopOrdersByDay(shopId: string, timeRange: string) {
        const now = moment();
        let startDate: moment.Moment;
        let dateFormat: string;
        let groupFormat: string;

        switch (timeRange) {
            case 'week':
                startDate = now.clone().startOf('week');
                dateFormat = 'YYYY-MM-DD';
                groupFormat = '%Y-%m-%d';
                break;
            case 'month':
                startDate = now.clone().startOf('month');
                dateFormat = 'YYYY-MM-DD';
                groupFormat = '%Y-%m-%d';
                break;
            default:
                // Default to current month
                startDate = now.clone().startOf('month');
                dateFormat = 'YYYY-MM-DD';
                groupFormat = '%Y-%m-%d';
        }

        const endDate = timeRange === 'week'
            ? now.clone().endOf('week')
            : now.clone().endOf('month');

        // Convert shopId to ObjectId and get correct date field
        const shopObjectId = new Types.ObjectId(shopId);
        const dateField = await this.detectDateField();

        const pipeline = [
            {
                $match: {
                    shop_id: shopObjectId,
                    [dateField]: {
                        $gte: startDate.toDate(),
                        $lte: endDate.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: `$${dateField}` } },
                    count: { $sum: 1 },
                    totalValue: { $sum: '$price_to_payment' }
                }
            },
            {
                $sort: { '_id': 1 as 1 }
            }
        ];

        console.log('Shop orders by day pipeline:', JSON.stringify(pipeline, null, 2));

        const results = await orderModel.aggregate(pipeline as any);
        console.log('Shop orders by day results:', results);

        // Create complete date range with zeros for missing days
        const dateRange = [];
        const current = startDate.clone();

        while (current.isSameOrBefore(endDate, 'day')) {
            const dateStr = current.format(dateFormat);
            const existing = results.find(r => r._id === dateStr);

            dateRange.push({
                date: dateStr,
                count: existing?.count || 0,
                totalValue: existing?.totalValue || 0,
                label: current.format('DD/MM')
            });

            current.add(1, 'day');
        }

        return dateRange;
    }

    private async getShopProductCount(shopId: string, dateFilter: any) {
        const total = await spuModel.countDocuments({
            ...dateFilter,
            product_shop: shopId,
            product_is_published: true
        });

        const prevPeriodFilter = this.getPreviousPeriodFilter(dateFilter);
        const prevTotal = await spuModel.countDocuments({
            ...prevPeriodFilter,
            product_shop: shopId,
            product_is_published: true
        });

        const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

        return { total, change: Math.round(change * 100) / 100 };
    }

    private async getDateFilter(timeRange: string) {
        const dateField = await this.detectDateField();
        console.log('Using date field:', dateField);

        const now = moment();
        let startDate: moment.Moment | null = null;
        let endDate: moment.Moment | null = null;

        switch (timeRange) {
            case 'today':
                startDate = now.clone().startOf('day');
                endDate = now.clone().endOf('day');
                break;
            case 'week':
                startDate = now.clone().startOf('week');
                endDate = now.clone().endOf('week');
                break;
            case 'month':
                startDate = now.clone().startOf('month');
                endDate = now.clone().endOf('month');
                break;
            case 'year':
                startDate = now.clone().startOf('year');
                endDate = now.clone().endOf('year');
                break;
            case 'all':
            default:
                return {}; // No filter for 'all'
        }

        const filter = startDate && endDate ? {
            [dateField]: {
                $gte: startDate.toDate(),
                $lte: endDate.toDate()
            }
        } : {};

        console.log('Date filter for', timeRange, ':', filter);
        return filter;
    }

    private async getTotalOrders(dateFilter: any) {
        const total = await orderModel.countDocuments(dateFilter);

        // Get percentage change from previous period
        const prevPeriodFilter = this.getPreviousPeriodFilter(dateFilter);
        const prevTotal = await orderModel.countDocuments(prevPeriodFilter);

        const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

        return { total, change: Math.round(change * 100) / 100 };
    }

    private async getTotalShops(dateFilter: any) {
        const total = await shopModel.countDocuments({
            ...dateFilter,
            shop_status: 'approved'
        });

        const prevPeriodFilter = this.getPreviousPeriodFilter(dateFilter);
        const prevTotal = await shopModel.countDocuments({
            ...prevPeriodFilter,
            shop_status: 'approved'
        });

        const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

        return { total, change: Math.round(change * 100) / 100 };
    }

    private async getTotalUsers(dateFilter: any) {
        const total = await userModel.countDocuments(dateFilter);

        const prevPeriodFilter = this.getPreviousPeriodFilter(dateFilter);
        const prevTotal = await userModel.countDocuments(prevPeriodFilter);

        const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

        return { total, change: Math.round(change * 100) / 100 };
    }

    private async getTotalProducts(dateFilter: any) {
        const total = await spuModel.countDocuments({
            ...dateFilter,
            product_is_published: true
        });

        const prevPeriodFilter = this.getPreviousPeriodFilter(dateFilter);
        const prevTotal = await spuModel.countDocuments({
            ...prevPeriodFilter,
            product_is_published: true
        });

        const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

        return { total, change: Math.round(change * 100) / 100 };
    }

    private async getOrderStats(dateFilter: any) {
        const pipeline = [
            { $match: dateFilter },
            {
                $group: {
                    _id: '$order_status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$price_to_payment' }
                }
            }
        ];

        const stats = await orderModel.aggregate(pipeline);

        const orderStats = {
            pending: { count: 0, totalValue: 0 },
            confirmed: { count: 0, totalValue: 0 },
            shipped: { count: 0, totalValue: 0 },
            delivered: { count: 0, totalValue: 0 },
            cancelled: { count: 0, totalValue: 0 }
        };

        stats.forEach(stat => {
            if (orderStats[stat._id]) {
                orderStats[stat._id] = {
                    count: stat.count,
                    totalValue: stat.totalValue
                };
            }
        });

        return orderStats;
    }

    private async getShopStats(dateFilter: any) {
        const pipeline = [
            { $match: dateFilter },
            {
                $group: {
                    _id: '$shop_status',
                    count: { $sum: 1 }
                }
            }
        ];

        const stats = await shopModel.aggregate(pipeline);

        const shopStats = {
            pending: 0,
            approved: 0,
            rejected: 0
        };

        stats.forEach(stat => {
            if (shopStats[stat._id] !== undefined) {
                shopStats[stat._id] = stat.count;
            }
        });

        return shopStats;
    }

    private async getOrdersByDay(timeRange: string) {
        const now = moment();
        let startDate: moment.Moment;
        let dateFormat: string;
        let groupFormat: string;

        switch (timeRange) {
            case 'week':
                startDate = now.clone().startOf('week');
                dateFormat = 'YYYY-MM-DD';
                groupFormat = '%Y-%m-%d';
                break;
            case 'month':
                startDate = now.clone().startOf('month');
                dateFormat = 'YYYY-MM-DD';
                groupFormat = '%Y-%m-%d';
                break;
            default:
                // Default to current month
                startDate = now.clone().startOf('month');
                dateFormat = 'YYYY-MM-DD';
                groupFormat = '%Y-%m-%d';
        }

        const endDate = timeRange === 'week'
            ? now.clone().endOf('week')
            : now.clone().endOf('month');

        const pipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: startDate.toDate(),
                        $lte: endDate.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                    count: { $sum: 1 },
                    totalValue: { $sum: '$price_to_payment' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ];

        const results = await orderModel.aggregate(pipeline);

        // Create complete date range with zeros for missing days
        const dateRange = [];
        const current = startDate.clone();

        while (current.isSameOrBefore(endDate, 'day')) {
            const dateStr = current.format(dateFormat);
            const existing = results.find(r => r._id === dateStr);

            dateRange.push({
                date: dateStr,
                count: existing?.count || 0,
                totalValue: existing?.totalValue || 0,
                label: current.format('DD/MM')
            });

            current.add(1, 'day');
        }

        return dateRange;
    }

    private getPreviousPeriodFilter(currentFilter: any) {
        if (!currentFilter.createdAt) {
            return {};
        }

        const currentStart = moment(currentFilter.createdAt.$gte);
        const currentEnd = moment(currentFilter.createdAt.$lte);
        const duration = moment.duration(currentEnd.diff(currentStart));

        const prevEnd = currentStart.clone().subtract(1, 'day');
        const prevStart = prevEnd.clone().subtract(duration);

        return {
            createdAt: {
                $gte: prevStart.toDate(),
                $lte: prevEnd.toDate()
            }
        };
    }

    private async getShopRecentOrders(shopId: string) {
        const shopObjectId = new Types.ObjectId(shopId);
        const dateField = await this.detectDateField();

        const sortObj = { [dateField]: -1 };

        const recentOrders = await orderModel
            .find({ shop_id: shopObjectId })
            .sort(sortObj as any)
            .limit(10)
            .select(`_id customer_full_name price_to_payment order_status ${dateField} products_info`)
            .lean();

        console.log('Recent orders found:', recentOrders.length);

        return recentOrders.map(order => ({
            orderId: order._id,
            customerName: order.customer_full_name,
            amount: order.price_to_payment,
            status: order.order_status,
            orderDate: (order as any)[dateField],
            itemCount: order.products_info?.length || 0
        }));
    }

    private async getShopTopProductsByRevenue(shopId: string, dateFilter: any) {
        const shopObjectId = new Types.ObjectId(shopId);

        const pipeline = [
            { $match: { shop_id: shopObjectId, ...dateFilter, order_status: 'completed' } },
            { $unwind: '$products_info' },
            {
                $group: {
                    _id: {
                        sku_id: '$products_info.sku_id',
                        product_name: '$products_info.product_name'
                    },
                    totalRevenue: { $sum: '$products_info.price_raw' },
                    totalQuantity: { $sum: '$products_info.quantity' }
                }
            },
            { $sort: { totalRevenue: -1 as -1 } },
            { $limit: 5 }
        ];

        console.log('Top products pipeline:', JSON.stringify(pipeline, null, 2));

        const results = await orderModel.aggregate(pipeline as any);
        console.log('Top products results:', results);

        return results.map((result: any) => ({
            productName: result._id.product_name,
            skuId: result._id.sku_id,
            totalRevenue: result.totalRevenue,
            totalQuantity: result.totalQuantity
        }));
    }

    // Helper function to detect the correct date field
    private async detectDateField(): Promise<string> {
        const sampleOrder = await orderModel.findOne().lean();
        if (!sampleOrder) return 'createdAt'; // default

        if (sampleOrder.createdAt) return 'createdAt';
        if ((sampleOrder as any).created_at) return 'created_at';
        return 'createdAt'; // fallback
    }
})(); 