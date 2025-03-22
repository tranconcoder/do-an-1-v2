import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../redux/slices/userSlice';
import classNames from 'classnames/bind';
import styles from './Profile.module.scss';
import axiosClient from '../../configs/axios';

const cx = classNames.bind(styles);

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = useSelector(selectUserInfo);

    // Address management state
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [currentAddress, setCurrentAddress] = useState({
        id: null,
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
    });
    const [isEditingAddress, setIsEditingAddress] = useState(false);

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

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/user/profile');
                setProfileData(response.data.metadata);

                // In a real app, fetch addresses from API
                // const addressesResponse = await axiosClient.get('/user/addresses');
                // setAddresses(addressesResponse.data.metadata.addresses || []);

                // Using sample data for now
                setAddresses(sampleAddresses);

                setError(null);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Failed to load profile data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleAddNewAddress = () => {
        setCurrentAddress({
            id: null,
            fullName: profileData?.fullName || user.fullName || '',
            phoneNumber: profileData?.phoneNumber || user.phoneNumber || '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            zipCode: '',
            isDefault: addresses.length === 0 // Make default if it's the first address
        });
        setIsEditingAddress(false);
        setShowAddressForm(true);
    };

    const handleEditAddress = (address) => {
        setCurrentAddress({ ...address });
        setIsEditingAddress(true);
        setShowAddressForm(true);
    };

    const handleRemoveAddress = (addressId) => {
        // In production, call API to remove address
        // await axiosClient.delete(`/user/addresses/${addressId}`);

        const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);
        setAddresses(updatedAddresses);

        // If we removed a default address and there are other addresses, make the first one default
        if (
            addresses.find((addr) => addr.id === addressId)?.isDefault &&
            updatedAddresses.length > 0
        ) {
            updatedAddresses[0].isDefault = true;
        }
    };

    const handleAddressFormSubmit = (e) => {
        e.preventDefault();

        if (isEditingAddress) {
            // Update existing address
            const updatedAddresses = addresses.map((addr) =>
                addr.id === currentAddress.id
                    ? currentAddress
                    : currentAddress.isDefault
                    ? { ...addr, isDefault: false }
                    : addr
            );
            setAddresses(updatedAddresses);

            // In production: await axiosClient.put(`/user/addresses/${currentAddress.id}`, currentAddress);
        } else {
            // Add new address
            const newAddress = {
                ...currentAddress,
                id: Date.now() // Generate a temporary ID (use API-provided ID in production)
            };

            // If this is set as default, update other addresses
            const updatedAddresses = currentAddress.isDefault
                ? addresses.map((addr) => ({ ...addr, isDefault: false }))
                : [...addresses];

            setAddresses([...updatedAddresses, newAddress]);

            // In production: await axiosClient.post('/user/addresses', newAddress);
        }

        setShowAddressForm(false);
    };

    const handleAddressInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentAddress({
            ...currentAddress,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSetDefaultAddress = (addressId) => {
        const updatedAddresses = addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === addressId
        }));
        setAddresses(updatedAddresses);

        // In production: await axiosClient.put(`/user/addresses/${addressId}/default`);
    };

    return (
        <div className={cx('profile-container')}>
            <h1 className={cx('page-title')}>My Profile</h1>

            {loading && <div className={cx('loading')}>Loading profile...</div>}

            {error && <div className={cx('error')}>{error}</div>}

            {!loading && !error && profileData && (
                <div className={cx('profile-content')}>
                    <div className={cx('profile-card')}>
                        <div className={cx('profile-header')}>
                            <div className={cx('profile-avatar')}>
                                {profileData.fullName
                                    ? profileData.fullName.charAt(0).toUpperCase()
                                    : user.fullName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className={cx('profile-name')}>
                                <h2>{profileData.fullName || user.fullName || 'User'}</h2>
                                <span className={cx('profile-role')}>
                                    {profileData.role || user.role || 'Customer'}
                                </span>
                            </div>
                        </div>

                        <div className={cx('profile-info')}>
                            <div className={cx('info-row')}>
                                <span className={cx('info-label')}>Phone Number:</span>
                                <span className={cx('info-value')}>
                                    {profileData.phoneNumber || user.phoneNumber || 'Not provided'}
                                </span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('info-label')}>Email:</span>
                                <span className={cx('info-value')}>
                                    {profileData.email || user.email || 'Not provided'}
                                </span>
                            </div>
                            <div className={cx('info-row')}>
                                <span className={cx('info-label')}>Member Since:</span>
                                <span className={cx('info-value')}>
                                    {profileData.createdAt
                                        ? new Date(profileData.createdAt).toLocaleDateString()
                                        : 'Not available'}
                                </span>
                            </div>
                        </div>

                        <button className={cx('edit-profile-btn')}>Edit Profile</button>
                    </div>

                    <div className={cx('recent-orders')}>
                        <h3 className={cx('section-title')}>Recent Orders</h3>
                        <div className={cx('orders-placeholder')}>
                            <p>You haven't placed any orders yet.</p>
                            <a href="/products" className={cx('shop-now-btn')}>
                                Shop Now
                            </a>
                        </div>
                    </div>

                    {/* Shipping Addresses Section */}
                    <div className={cx('shipping-addresses')}>
                        <div className={cx('section-header')}>
                            <h3 className={cx('section-title')}>Shipping Addresses</h3>
                            {!showAddressForm && (
                                <button
                                    className={cx('add-address-btn')}
                                    onClick={handleAddNewAddress}
                                >
                                    + Add New Address
                                </button>
                            )}
                        </div>

                        {addresses.length === 0 && !showAddressForm ? (
                            <div className={cx('no-addresses')}>
                                <p>You haven't added any shipping addresses yet.</p>
                                <button
                                    className={cx('add-first-address-btn')}
                                    onClick={handleAddNewAddress}
                                >
                                    Add Your First Address
                                </button>
                            </div>
                        ) : (
                            <div className={cx('addresses-list')}>
                                {!showAddressForm &&
                                    addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className={cx('address-card', {
                                                default: address.isDefault
                                            })}
                                        >
                                            {address.isDefault && (
                                                <div className={cx('default-badge')}>Default</div>
                                            )}
                                            <div className={cx('address-content')}>
                                                <div className={cx('address-name')}>
                                                    {address.fullName}
                                                </div>
                                                <div className={cx('address-phone')}>
                                                    {address.phoneNumber}
                                                </div>
                                                <div className={cx('address-lines')}>
                                                    <div>{address.addressLine1}</div>
                                                    {address.addressLine2 && (
                                                        <div>{address.addressLine2}</div>
                                                    )}
                                                    <div>{`${address.city}, ${address.state} ${address.zipCode}`}</div>
                                                </div>
                                            </div>
                                            <div className={cx('address-actions')}>
                                                <button
                                                    className={cx('address-edit')}
                                                    onClick={() => handleEditAddress(address)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={cx('address-remove')}
                                                    onClick={() => handleRemoveAddress(address.id)}
                                                >
                                                    Remove
                                                </button>
                                                {!address.isDefault && (
                                                    <button
                                                        className={cx('address-set-default')}
                                                        onClick={() =>
                                                            handleSetDefaultAddress(address.id)
                                                        }
                                                    >
                                                        Set as Default
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                {showAddressForm && (
                                    <div className={cx('address-form-container')}>
                                        <h4 className={cx('form-title')}>
                                            {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                                        </h4>
                                        <form
                                            onSubmit={handleAddressFormSubmit}
                                            className={cx('address-form')}
                                        >
                                            <div className={cx('form-row')}>
                                                <div className={cx('form-group')}>
                                                    <label htmlFor="fullName">Full Name</label>
                                                    <input
                                                        type="text"
                                                        id="fullName"
                                                        name="fullName"
                                                        value={currentAddress.fullName}
                                                        onChange={handleAddressInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className={cx('form-group')}>
                                                    <label htmlFor="phoneNumber">
                                                        Phone Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        id="phoneNumber"
                                                        name="phoneNumber"
                                                        value={currentAddress.phoneNumber}
                                                        onChange={handleAddressInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className={cx('form-group')}>
                                                <label htmlFor="addressLine1">Address Line 1</label>
                                                <input
                                                    type="text"
                                                    id="addressLine1"
                                                    name="addressLine1"
                                                    value={currentAddress.addressLine1}
                                                    onChange={handleAddressInputChange}
                                                    placeholder="Street address, P.O. box"
                                                    required
                                                />
                                            </div>

                                            <div className={cx('form-group')}>
                                                <label htmlFor="addressLine2">
                                                    Address Line 2 (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    id="addressLine2"
                                                    name="addressLine2"
                                                    value={currentAddress.addressLine2}
                                                    onChange={handleAddressInputChange}
                                                    placeholder="Apartment, suite, unit, building, floor, etc."
                                                />
                                            </div>

                                            <div className={cx('form-row')}>
                                                <div className={cx('form-group')}>
                                                    <label htmlFor="city">City</label>
                                                    <input
                                                        type="text"
                                                        id="city"
                                                        name="city"
                                                        value={currentAddress.city}
                                                        onChange={handleAddressInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className={cx('form-group')}>
                                                    <label htmlFor="state">State</label>
                                                    <input
                                                        type="text"
                                                        id="state"
                                                        name="state"
                                                        value={currentAddress.state}
                                                        onChange={handleAddressInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className={cx('form-group')}>
                                                    <label htmlFor="zipCode">ZIP Code</label>
                                                    <input
                                                        type="text"
                                                        id="zipCode"
                                                        name="zipCode"
                                                        value={currentAddress.zipCode}
                                                        onChange={handleAddressInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className={cx('form-group', 'checkbox-group')}>
                                                <input
                                                    type="checkbox"
                                                    id="isDefault"
                                                    name="isDefault"
                                                    checked={currentAddress.isDefault}
                                                    onChange={handleAddressInputChange}
                                                />
                                                <label htmlFor="isDefault">
                                                    Set as default shipping address
                                                </label>
                                            </div>

                                            <div className={cx('form-actions')}>
                                                <button
                                                    type="button"
                                                    className={cx('cancel-btn')}
                                                    onClick={() => setShowAddressForm(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button type="submit" className={cx('save-btn')}>
                                                    {isEditingAddress
                                                        ? 'Update Address'
                                                        : 'Save Address'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
