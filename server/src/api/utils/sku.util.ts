import { SKU_COLLECTION_NAME } from '@/models/sku.model.js';

export const getAllSKUAggregate = (limit: number, page: number) => [
    {
        $match: {
            is_deleted: false,
            is_draft: false,
            is_publish: true
        }
    },
    {
        $lookup: {
            from: SKU_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'sku_product',
            as: 'sku'
        }
    },
    {
        $unwind: '$sku'
    },
    {
        $match: {
            'sku.is_deleted': false
        }
    },
    {
        $skip: (page - 1) * limit
    },
    {
        $limit: limit
    },
    addSKUValueField,
    {
        $project: {
            _id: 1,
            product_name: 1,
            product_quantity: 1,
            product_description: 1,
            product_category: 1,
            product_shop: 1,
            product_rating_avg: 1,
            product_slug: 1,
            product_thumb: 1,
            product_images: 1,
            'sku._id': 1,
            'sku.sku_product': 1,
            'sku.sku_price': 1,
            'sku.sku_stock': 1,
            'sku.sku_thumb': 1,
            'sku.sku_images': 1,
            'sku.sku_value': 1
        }
    }
];

export const addSKUValueField = {
    $addFields: {
        'sku.sku_value': {
            $map: {
                input: {
                    $range: [0, { $size: '$sku.sku_tier_idx' }]
                },
                as: 'idx',
                in: {
                    key: {
                        $getField: {
                            field: 'variation_name',
                            input: {
                                $arrayElemAt: ['$product_variations', '$$idx']
                            }
                        }
                    },
                    value: {
                        $arrayElemAt: [
                            {
                                $getField: {
                                    field: 'variation_values',
                                    input: {
                                        $arrayElemAt: ['$product_variations', '$$idx']
                                    }
                                }
                            },
                            {
                                $arrayElemAt: ['$sku.sku_tier_idx', '$$idx']
                            }
                        ]
                    }
                }
            }
        }
    }
};