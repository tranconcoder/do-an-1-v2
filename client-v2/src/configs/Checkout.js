// Sample checkout data for development and testing

// Sample cart items for checkout
const sampleCartItems = [
    {
        id: 1,
        name: 'Wireless Bluetooth Headphones',
        price: 89.99,
        image: 'https://via.placeholder.com/150',
        quantity: 1,
        shopId: 1,
        shopName: 'Tech Universe'
    },
    {
        id: 2,
        name: 'Premium Smartphone Case',
        price: 24.99,
        image: 'https://via.placeholder.com/150',
        quantity: 2,
        shopId: 1,
        shopName: 'Tech Universe'
    },
    {
        id: 3,
        name: 'Ultra HD Smart TV 55"',
        price: 549.99,
        image: 'https://via.placeholder.com/150',
        quantity: 1,
        shopId: 2,
        shopName: 'Home Electronics'
    },
    {
        id: 4,
        name: 'Wireless Charging Pad',
        price: 29.99,
        image: 'https://via.placeholder.com/150',
        quantity: 1,
        shopId: 2,
        shopName: 'Home Electronics'
    }
];

// Sample addresses
const sampleAddresses = [
    {
        id: 1,
        name: 'John Doe',
        phone: '(555) 123-4567',
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        isDefault: true
    },
    {
        id: 2,
        name: 'John Doe',
        phone: '(555) 987-6543',
        street: '456 Oak Avenue',
        city: 'Somewhere',
        state: 'NY',
        zipCode: '67890',
        isDefault: false
    }
];

// Sample discount codes
const availableDiscounts = [
    { code: 'WELCOME10', value: 10, type: 'percentage', isAdmin: true },
    { code: 'FREESHIP', value: 10.99, type: 'fixed', isAdmin: true },
    { code: 'SAVE20', value: 20, type: 'fixed', isAdmin: true }
];

// Sample shop-specific discount codes
const shopDiscountsList = [
    { code: 'TECH15', value: 15, type: 'percentage', shopId: 1 },
    { code: 'TECHDEAL', value: 10, type: 'fixed', shopId: 1 },
    { code: 'HOME10', value: 10, type: 'percentage', shopId: 2 },
    { code: 'ELECTRONICS', value: 5, type: 'fixed', shopId: 2 }
];

export { sampleCartItems, sampleAddresses, availableDiscounts, shopDiscountsList };
