// Sample profile data for development and testing

// Sample user profile data
const sampleProfileData = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '(555) 123-4567',
    role: 'Customer',
    createdAt: '2023-01-15T08:30:00.000Z'
};

// Sample addresses
const sampleAddresses = [
    {
        id: 1,
        fullName: 'John Doe',
        phoneNumber: '1234567890',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        isDefault: true
    },
    {
        id: 2,
        fullName: 'John Doe',
        phoneNumber: '9876543210',
        addressLine1: '456 Park Avenue',
        addressLine2: '',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        isDefault: false
    }
];

export { sampleProfileData, sampleAddresses };
