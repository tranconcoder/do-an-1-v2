/**
 * Centralized Products Data Store
 *
 * This file maintains all product data and provides utility functions
 * for components like Flash Sale, Popular Products, Recommended Products,
 * as well as cart, wishlist, checkout, and order functionality.
 */

// Import any necessary dependencies
import { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Sample categories for products
const categories = [
    {
        id: 1,
        name: 'Electronics',
        slug: 'electronics',
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '📱'
    },
    {
        id: 2,
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        image: 'https://images.unsplash.com/photo-1522071901873-411886a10004?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '🏠'
    },
    {
        id: 3,
        name: 'Fashion',
        slug: 'fashion',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '👕'
    },
    {
        id: 4,
        name: 'Beauty',
        slug: 'beauty',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '💄'
    },
    {
        id: 5,
        name: 'Sports',
        slug: 'sports',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '🎾'
    },
    {
        id: 6,
        name: 'Toys',
        slug: 'toys',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '🧸'
    },
    {
        id: 7,
        name: 'Books',
        slug: 'books',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '📚'
    },
    {
        id: 8,
        name: 'Health',
        slug: 'health',
        image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '💊'
    },
    {
        id: 9,
        name: 'Automotive',
        slug: 'automotive',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '🚗'
    },
    {
        id: 10,
        name: 'Pet Supplies',
        slug: 'pet-supplies',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=300&auto=format&fit=crop&q=80',
        icon: '🐶'
    }
];

// Sample shops/vendors
const shops = [
    {
        id: 1,
        name: 'Tech Universe',
        slug: 'tech-universe',
        isOfficial: true,
        logo: 'https://images.unsplash.com/photo-1621319332247-ce870cdad56c?w=200&h=200&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&h=300&auto=format&fit=crop&q=80'
    },
    {
        id: 2,
        name: 'Home Electronics',
        slug: 'home-electronics',
        isOfficial: true,
        logo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=200&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=1200&h=300&auto=format&fit=crop&q=80'
    },
    {
        id: 3,
        name: 'Fashion Central',
        slug: 'fashion-central',
        isOfficial: true,
        logo: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=200&h=200&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=300&auto=format&fit=crop&q=80'
    },
    {
        id: 4,
        name: 'Beauty Paradise',
        slug: 'beauty-paradise',
        isOfficial: false,
        logo: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=200&h=200&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=300&auto=format&fit=crop&q=80'
    },
    {
        id: 5,
        name: 'Sports World',
        slug: 'sports-world',
        isOfficial: true,
        logo: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&h=200&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&h=300&auto=format&fit=crop&q=80'
    }
];

// Main products array with comprehensive information
const products = [
    {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        slug: 'wireless-bluetooth-headphones',
        price: 89.99,
        originalPrice: 129.99,
        discount: 31, // Percentage discount
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1549441205-ec7de8f07d14?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&auto=format&fit=crop&q=80',
        description:
            'High-quality wireless headphones with noise cancellation technology and long battery life.',
        stock: 50,
        sold: 120,
        rating: 4.5,
        reviewCount: 68,
        categoryId: 1,
        shopId: 1,
        isNew: false,
        isFeatured: true,
        isPopular: true,
        isFlashSale: true,
        isRecommended: true,
        specifications: {
            brand: 'AudioTech',
            model: 'WH-1000',
            color: ['Black', 'White', 'Blue'],
            batteryLife: '30 hours',
            connectivity: 'Bluetooth 5.0',
            weight: '250g'
        },
        tags: ['wireless', 'bluetooth', 'headphones', 'audio', 'noise-cancelling']
    },
    {
        id: 2,
        name: 'Smart Watch Series 5',
        slug: 'smart-watch-series-5',
        price: 129.99,
        originalPrice: 199.99,
        discount: 35,
        images: [
            'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&h=300&auto=format&fit=crop&q=80',
        description:
            'Feature-rich smartwatch with health monitoring, notifications, and customizable watch faces.',
        stock: 75,
        sold: 85,
        rating: 4.7,
        reviewCount: 42,
        categoryId: 1,
        shopId: 1,
        isNew: true,
        isFeatured: true,
        isPopular: true,
        isFlashSale: true,
        isRecommended: false,
        specifications: {
            brand: 'TechWear',
            model: 'SW-500',
            color: ['Black', 'Silver', 'Rose Gold'],
            display: '1.5" AMOLED',
            batteryLife: '5 days',
            waterResistant: true
        },
        tags: ['smart watch', 'fitness tracker', 'wearable tech', 'health monitor']
    },
    {
        id: 3,
        name: 'Portable Bluetooth Speaker',
        slug: 'portable-bluetooth-speaker',
        price: 39.99,
        originalPrice: 79.99,
        discount: 50,
        images: [
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1558089687-f282ffcbc0d4?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1563330232-57114bb0823c?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&auto=format&fit=crop&q=80',
        description:
            'Compact, waterproof bluetooth speaker with immersive 360-degree sound and 12-hour battery life.',
        stock: 120,
        sold: 45,
        rating: 4.2,
        reviewCount: 34,
        categoryId: 1,
        shopId: 2,
        isNew: false,
        isFeatured: false,
        isPopular: false,
        isFlashSale: true,
        isRecommended: true,
        specifications: {
            brand: 'SoundBox',
            model: 'Splash Mini',
            color: ['Red', 'Black', 'Blue'],
            batteryLife: '12 hours',
            waterproof: 'IPX7 rated',
            weight: '300g'
        },
        tags: ['bluetooth speaker', 'portable', 'waterproof', 'audio']
    },
    {
        id: 4,
        name: 'Noise Cancelling Headphones',
        slug: 'noise-cancelling-headphones',
        price: 89.99,
        originalPrice: 149.99,
        discount: 40,
        images: [
            'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1548378329-437e1ef27a94?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&auto=format&fit=crop&q=80',
        description:
            'Premium noise cancelling headphones with high-fidelity sound and comfortable over-ear design.',
        stock: 60,
        sold: 42,
        rating: 4.8,
        reviewCount: 56,
        categoryId: 1,
        shopId: 1,
        isNew: false,
        isFeatured: true,
        isPopular: true,
        isFlashSale: true,
        isRecommended: true,
        specifications: {
            brand: 'SonicPro',
            model: 'NC-800',
            color: ['Black', 'Silver'],
            batteryLife: '24 hours',
            connectivity: 'Bluetooth 5.0 & 3.5mm jack',
            weight: '280g'
        },
        tags: ['headphones', 'noise cancelling', 'wireless', 'audio']
    },
    {
        id: 5,
        name: 'Ultra HD 4K Action Camera',
        slug: 'ultra-hd-4k-action-camera',
        price: 149.99,
        originalPrice: 249.99,
        discount: 40,
        images: [
            'https://images.unsplash.com/photo-1525059337994-6f2a1311b4d4?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1643130819766-e036b718d900?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1525059337994-6f2a1311b4d4?w=300&h=300&auto=format&fit=crop&q=80',
        description:
            'Waterproof 4K action camera with image stabilization, perfect for capturing adventures.',
        stock: 40,
        sold: 18,
        rating: 4.4,
        reviewCount: 27,
        categoryId: 1,
        shopId: 1,
        isNew: true,
        isFeatured: true,
        isPopular: false,
        isFlashSale: true,
        isRecommended: false,
        specifications: {
            brand: 'ActionTech',
            model: 'Explorer Pro',
            resolution: '4K @ 60fps',
            waterproof: 'Up to 30m',
            batteryLife: '2.5 hours',
            storage: 'MicroSD up to 256GB'
        },
        tags: ['action camera', '4k', 'waterproof', 'adventure']
    },
    {
        id: 6,
        name: 'Professional Blender with Multiple Settings',
        slug: 'professional-blender',
        price: 79.99,
        originalPrice: 129.99,
        discount: 38,
        images: [
            'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1590330813083-fc22d4b6a48c?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1619853404737-bc27775d9c8e?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&h=300&auto=format&fit=crop&q=80',
        description:
            'High-power professional blender with multiple speed settings and durable stainless steel blades.',
        stock: 30,
        sold: 25,
        rating: 4.6,
        reviewCount: 42,
        categoryId: 2,
        shopId: 2,
        isNew: false,
        isFeatured: false,
        isPopular: true,
        isFlashSale: false,
        isRecommended: true,
        specifications: {
            brand: 'KitchenPro',
            model: 'Ultra Blend',
            power: '1200W',
            capacity: '1.5L',
            speeds: '10 variable speeds',
            material: 'BPA-free Tritan jar'
        },
        tags: ['blender', 'kitchen', 'appliance', 'smoothie']
    },
    {
        id: 7,
        name: 'Smartphone with Triple Camera',
        slug: 'smartphone-triple-camera',
        price: 599.99,
        originalPrice: 749.99,
        discount: 20,
        images: [
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1611791484670-ce19b801d192?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&auto=format&fit=crop&q=80',
        description:
            'Feature-packed smartphone with triple camera system, large display and long-lasting battery.',
        stock: 25,
        sold: 18,
        rating: 4.7,
        reviewCount: 89,
        categoryId: 2,
        shopId: 1,
        isNew: true,
        isFeatured: true,
        isPopular: true,
        isFlashSale: false,
        isRecommended: true,
        specifications: {
            brand: 'MobiTech',
            model: 'X3 Pro',
            screen: '6.5" AMOLED',
            storage: '128GB',
            ram: '8GB',
            camera: 'Triple 48MP + 12MP + 8MP',
            battery: '4500mAh'
        },
        tags: ['smartphone', 'mobile', 'camera', 'android']
    },
    {
        id: 8,
        name: 'Electric Coffee Grinder',
        slug: 'electric-coffee-grinder',
        price: 34.99,
        originalPrice: 49.99,
        discount: 30,
        images: [
            'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1610889556528-9a770e32642a?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1623123095585-bbd6ea0118f6?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=300&h=300&auto=format&fit=crop&q=80',
        description:
            'Electric coffee grinder with adjustable settings for the perfect grind every time.',
        stock: 45,
        sold: 32,
        rating: 4.3,
        reviewCount: 28,
        categoryId: 2,
        shopId: 2,
        isNew: false,
        isFeatured: false,
        isPopular: false,
        isFlashSale: false,
        isRecommended: true,
        specifications: {
            brand: 'BrewMaster',
            model: 'Precision Grind',
            power: '150W',
            capacity: '70g',
            settings: '18 grind settings',
            material: 'Stainless steel blades'
        },
        tags: ['coffee', 'grinder', 'kitchen', 'appliance']
    },
    {
        id: 9,
        name: 'Wireless Charging Pad',
        slug: 'wireless-charging-pad',
        price: 29.99,
        originalPrice: 49.99,
        discount: 40,
        images: [
            'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1586251900928-0a5b91c12e5e?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1623126467607-29d792f9f667?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=300&h=300&auto=format&fit=crop&q=80',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        stock: 60,
        sold: 38,
        rating: 4.5,
        reviewCount: 45,
        categoryId: 1,
        shopId: 2,
        isNew: false,
        isFeatured: true,
        isPopular: false,
        isFlashSale: false,
        isRecommended: true,
        specifications: {
            brand: 'PowerUp',
            model: 'Qi-Charge Pro',
            input: '5V/2A',
            output: '10W max',
            compatibility: 'All Qi-enabled devices',
            color: ['Black', 'White']
        },
        tags: ['wireless charger', 'charging pad', 'phone accessory', 'Qi']
    },
    {
        id: 10,
        name: 'Premium Smartphone Case',
        slug: 'premium-smartphone-case',
        price: 24.99,
        originalPrice: 34.99,
        discount: 29,
        images: [
            'https://images.unsplash.com/photo-1572345006795-d047839c0e51?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1614016136163-493f9e2f01f8?w=600&h=600&auto=format&fit=crop&q=80'
        ],
        thumbnail:
            'https://images.unsplash.com/photo-1572345006795-d047839c0e51?w=300&h=300&auto=format&fit=crop&q=80',
        description: 'Durable and stylish smartphone case with military-grade drop protection.',
        stock: 100,
        sold: 75,
        rating: 4.6,
        reviewCount: 52,
        categoryId: 1,
        shopId: 1,
        isNew: false,
        isFeatured: false,
        isPopular: true,
        isFlashSale: false,
        isRecommended: false,
        specifications: {
            brand: 'TechShield',
            compatibility: 'iPhone 13/14 Pro',
            material: 'Shock-absorbing TPU',
            protection: 'Military-grade drop tested',
            color: ['Black', 'Navy Blue', 'Red', 'Clear']
        },
        tags: ['phone case', 'smartphone accessory', 'protection']
    }
];

// Generate additional products for testing variety (20 more products)
const generateAdditionalProducts = () => {
    const additionalProducts = [];
    const productTypes = [
        'Laptop',
        'Tablet',
        'Phone Stand',
        'Bluetooth Earbuds',
        'Desk Lamp',
        'Fitness Tracker'
    ];

    // Real image collections by product type
    const productImages = {
        Laptop: [
            {
                images: [
                    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&auto=format&fit=crop&q=80'
            },
            {
                images: [
                    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1609240873213-1b3502f92ff0?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&h=300&auto=format&fit=crop&q=80'
            },
            {
                images: [
                    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&h=300&auto=format&fit=crop&q=80'
            }
        ],
        Tablet: [
            {
                images: [
                    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1623126908029-58cb08a2b272?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&auto=format&fit=crop&q=80'
            },
            {
                images: [
                    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1623126899912-6bc51c6a5a53?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&h=300&auto=format&fit=crop&q=80'
            }
        ],
        'Phone Stand': [
            {
                images: [
                    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1581351721010-8cf859cb14f1?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1611791484670-ce19b801d192?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&h=300&auto=format&fit=crop&q=80'
            }
        ],
        'Bluetooth Earbuds': [
            {
                images: [
                    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1645952275645-5f3e3d22d6a7?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&auto=format&fit=crop&q=80'
            },
            {
                images: [
                    'https://images.unsplash.com/photo-1649143316092-57a7d224c765?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1600086827875-a63b01f1335c?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1601391474441-889c9d99922c?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1649143316092-57a7d224c765?w=300&h=300&auto=format&fit=crop&q=80'
            }
        ],
        'Desk Lamp': [
            {
                images: [
                    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1573249493082-b1dc325f5130?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1542728928-4a83d9c1e720?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300&h=300&auto=format&fit=crop&q=80'
            }
        ],
        'Fitness Tracker': [
            {
                images: [
                    'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1557935728-e6d1eaabe558?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&h=300&auto=format&fit=crop&q=80'
            },
            {
                images: [
                    'https://images.unsplash.com/photo-1576699378482-a627469d4d36?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1557935111-6dee3c39429b?w=600&h=600&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1631844913051-1766e41a944a?w=600&h=600&auto=format&fit=crop&q=80'
                ],
                thumbnail:
                    'https://images.unsplash.com/photo-1576699378482-a627469d4d36?w=300&h=300&auto=format&fit=crop&q=80'
            }
        ]
    };

    const brands = ['TechBrand', 'HomeStyle', 'FitGear', 'AudioPlus', 'SmartLife'];

    for (let i = 0; i < 20; i++) {
        const type = productTypes[Math.floor(Math.random() * productTypes.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const basePrice = 50 + Math.floor(Math.random() * 450);
        const discount = 10 + Math.floor(Math.random() * 40);
        const originalPrice = basePrice / (1 - discount / 100);
        const stock = 10 + Math.floor(Math.random() * 90);
        const sold = Math.floor(Math.random() * stock);

        // Get random image set for this product type
        const imageCollection = productImages[type];
        const randomImageSet = imageCollection[Math.floor(Math.random() * imageCollection.length)];

        additionalProducts.push({
            id: products.length + i + 1,
            name: `${brand} ${type} ${1000 + i}`,
            slug: `${brand.toLowerCase()}-${type.toLowerCase().replace(' ', '-')}-${1000 + i}`,
            price: basePrice,
            originalPrice: parseFloat(originalPrice.toFixed(2)), // Convert to number
            discount: discount,
            images: randomImageSet.images,
            thumbnail: randomImageSet.thumbnail,
            description: `High-quality ${type} from ${brand} with the latest features and technology.`,
            stock: stock,
            sold: sold,
            rating: (3 + Math.random() * 2).toFixed(1),
            reviewCount: Math.floor(Math.random() * 100),
            categoryId: Math.floor(Math.random() * categories.length) + 1,
            shopId: Math.floor(Math.random() * shops.length) + 1,
            isNew: Math.random() > 0.7,
            isFeatured: Math.random() > 0.7,
            isPopular: Math.random() > 0.7,
            isFlashSale: Math.random() > 0.8,
            isRecommended: Math.random() > 0.5,
            specifications: {
                brand: brand,
                model: `${type}-${1000 + i}`,
                color: ['Black', 'White', Math.random() > 0.5 ? 'Blue' : 'Red']
            },
            tags: [type.toLowerCase(), brand.toLowerCase(), 'electronics', 'gadget']
        });
    }

    return additionalProducts;
};

// Append additional products
const allProducts = [...products, ...generateAdditionalProducts()];

// ====== UTILITY FUNCTIONS ======

/**
 * Get all products
 */
export const getAllProducts = () => {
    return allProducts;
};

/**
 * Get a single product by ID
 */
export const getProductById = (id) => {
    return allProducts.find((product) => product.id === id);
};

/**
 * Get a single product by slug
 */
export const getProductBySlug = (slug) => {
    return allProducts.find((product) => product.slug === slug);
};

/**
 * Get products for flash sale
 */
export const getFlashSaleProducts = () => {
    return allProducts.filter((product) => product.isFlashSale);
};

/**
 * Get popular products
 */
export const getPopularProducts = () => {
    return allProducts.filter((product) => product.isPopular);
};

/**
 * Get recommended products
 */
export const getRecommendedProducts = () => {
    return allProducts.filter((product) => product.isRecommended);
};

/**
 * Get products by category
 */
export const getProductsByCategory = (categoryId) => {
    return allProducts.filter((product) => product.categoryId === categoryId);
};

/**
 * Get products by shop
 */
export const getProductsByShop = (shopId) => {
    return allProducts.filter((product) => product.shopId === shopId);
};

/**
 * Search products by name or description
 */
export const searchProducts = (query) => {
    const searchTerm = query.toLowerCase();
    return allProducts.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
};

/**
 * Filter products by multiple criteria
 */
export const filterProducts = ({
    categoryId = null,
    shopId = null,
    minPrice = null,
    maxPrice = null,
    onSale = false,
    inStock = false
}) => {
    return allProducts.filter((product) => {
        // Category filter
        if (categoryId !== null && product.categoryId !== categoryId) return false;

        // Shop filter
        if (shopId !== null && product.shopId !== shopId) return false;

        // Price range filter
        if (minPrice !== null && product.price < minPrice) return false;
        if (maxPrice !== null && product.price > maxPrice) return false;

        // Sale filter
        if (onSale && product.discount <= 0) return false;

        // Stock filter
        if (inStock && product.stock <= 0) return false;

        return true;
    });
};

/**
 * Get all categories
 */
export const getAllCategories = () => {
    return categories;
};

/**
 * Get all shops/vendors
 */
export const getAllShops = () => {
    return shops;
};

// ====== CONTEXT API FOR STATE MANAGEMENT ======

// Create context for products data
export const ProductsContext = createContext();

/**
 * Products Provider component to manage global product state
 */
export const ProductsProvider = ({ children }) => {
    // State for cart, wishlist, and viewed products
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    // Load initial state from localStorage if available
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            const savedWishlist = localStorage.getItem('wishlist');
            const savedRecent = localStorage.getItem('recentlyViewed');

            if (savedCart) setCart(JSON.parse(savedCart));
            if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
            if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }, []);

    // Save changes to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }, [cart, wishlist, recentlyViewed]);

    // ===== CART FUNCTIONS =====

    // Add item to cart
    const addToCart = useCallback((productId, quantity = 1) => {
        const product = getProductById(productId);
        if (!product) return;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === productId);

            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === productId
                        ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                        : item
                );
            } else {
                return [
                    ...prevCart,
                    { id: productId, quantity: Math.min(quantity, product.stock) }
                ];
            }
        });
    }, []);

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    // Update cart item quantity
    const updateCartQuantity = (productId, quantity) => {
        const product = getProductById(productId);
        if (!product) return;

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId
                    ? { ...item, quantity: Math.min(Math.max(1, quantity), product.stock) }
                    : item
            )
        );
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
    };

    // ===== WISHLIST FUNCTIONS =====

    // Add to wishlist
    const addToWishlist = (productId) => {
        const product = getProductById(productId);
        if (!product) return;

        setWishlist((prevWishlist) => {
            if (prevWishlist.some((item) => item.id === productId)) {
                return prevWishlist;
            } else {
                return [...prevWishlist, { id: productId }];
            }
        });
    };

    // Remove from wishlist
    const removeFromWishlist = (productId) => {
        setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== productId));
    };

    // Check if item is in wishlist
    const isInWishlist = (productId) => {
        return wishlist.some((item) => item.id === productId);
    };

    // ===== RECENTLY VIEWED FUNCTIONS =====

    // Add to recently viewed
    const addToRecentlyViewed = useCallback((productId) => {
        const product = getProductById(productId);
        if (!product) return;

        setRecentlyViewed((prevViewed) => {
            // Remove if already exists (to move it to the front)
            const filtered = prevViewed.filter((item) => item.id !== productId);
            // Add to the beginning of the array
            return [{ id: productId, viewedAt: new Date().toISOString() }, ...filtered].slice(
                0,
                10
            );
        });
    }, []);

    // ===== CART CALCULATIONS =====

    // Get cart items with full product data - memoize the result
    const getCartItems = useCallback(() => {
        return cart.map((item) => {
            const product = getProductById(item.id);
            return {
                ...product,
                quantity: item.quantity,
                totalPrice: product.price * item.quantity
            };
        });
    }, [cart]);

    // Calculate cart subtotal
    const getCartSubtotal = () => {
        return getCartItems().reduce((total, item) => total + item.totalPrice, 0);
    };

    // Calculate cart item count
    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    // ===== WISHLIST CALCULATIONS =====

    // Get wishlist items with full product data
    const getWishlistItems = () => {
        return wishlist.map((item) => getProductById(item.id));
    };

    // Get recently viewed products with full data
    const getRecentlyViewedProducts = () => {
        return recentlyViewed.map((item) => getProductById(item.id)).filter(Boolean);
    };

    // Context value
    const value = {
        // Products data
        products: allProducts,
        categories,
        shops,

        // Products getters
        getAllProducts,
        getProductById,
        getProductBySlug: useCallback((slug) => {
            return allProducts.find((product) => product.slug === slug);
        }, []),
        getFlashSaleProducts,
        getPopularProducts,
        getRecommendedProducts,
        getProductsByCategory,
        getProductsByShop,
        searchProducts,
        filterProducts,
        getAllCategories,
        getAllShops,

        // Cart state and functions
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartItems,
        getCartSubtotal,
        getCartItemCount,

        // Wishlist state and functions
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistItems,

        // Recently viewed
        recentlyViewed,
        addToRecentlyViewed,
        getRecentlyViewedProducts
    };

    return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

/**
 * Custom hook to use the products context
 */
export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
};

export default {
    products: allProducts,
    categories,
    shops,
    getAllProducts,
    getProductById,
    getProductBySlug,
    getFlashSaleProducts,
    getPopularProducts,
    getRecommendedProducts,
    getProductsByCategory,
    getProductsByShop,
    searchProducts,
    filterProducts,
    getAllCategories,
    getAllShops,
    ProductsProvider,
    useProducts
};
