// Sample recommended products data for development and testing
const generateRecommendedProducts = () => {
    const products = [];
    const categories = [
        'Electronics',
        'Home & Kitchen',
        'Fashion',
        'Beauty',
        'Sports',
        'Toys',
        'Books',
        'Health',
        'Automotive',
        'Pet Supplies'
    ];

    for (let i = 1; i <= 60; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = (Math.random() * 200 + 19.99).toFixed(2);

        products.push({
            id: i,
            name: `${category} Item ${i} - Recommended Product`,
            price: parseFloat(price),
            image: 'https://via.placeholder.com/300',
            slug: `recommended-product-${i}`,
            category
        });
    }

    return products;
};

const recommendedProducts = generateRecommendedProducts();

export default recommendedProducts;
