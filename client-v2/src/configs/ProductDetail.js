// Sample product detail data for development and testing
const sampleProduct = {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    price: 89.99,
    originalPrice: 129.99,
    discount: 30,
    stock: 10,
    rating: 4.5,
    reviewCount: 128,
    shopId: 1,
    shopName: 'Tech Universe',
    description:
        'High-quality wireless headphones with noise cancellation technology. Experience crystal-clear sound and comfort for all-day wear. Features include Bluetooth 5.0 connectivity, 30-hour battery life, and premium build quality.',
    specifications: [
        { name: 'Brand', value: 'AudioTech' },
        { name: 'Model', value: 'BT-500' },
        { name: 'Connectivity', value: 'Bluetooth 5.0' },
        { name: 'Battery Life', value: '30 hours' },
        { name: 'Charging Time', value: '2 hours' },
        { name: 'Weight', value: '250g' }
    ],
    images: [
        'https://via.placeholder.com/600x600?text=Headphones+Main',
        'https://via.placeholder.com/600x600?text=Headphones+Side',
        'https://via.placeholder.com/600x600?text=Headphones+Folded',
        'https://via.placeholder.com/600x600?text=Headphones+Detail'
    ],
    colors: ['Black', 'White', 'Blue'],
    features: [
        'Active Noise Cancellation',
        'Voice Assistant Integration',
        'Foldable Design',
        'Touch Controls',
        'Quick Charging'
    ]
};

export default sampleProduct;
