import * as Yup from 'yup';
import { ShopType } from '../constants/shop.enum';

const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
const SUPPORTED_DOCUMENT_FORMATS = [...SUPPORTED_IMAGE_FORMATS, 'application/pdf'];

export const shopRegisterSchema = Yup.object().shape({
    // Authentication
    shop_email: Yup.string().email('Invalid email address').required('Email is required'),
    shop_password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('shop_password')], 'Passwords must match')
        .required('Please confirm your password'),

    // Shop Information
    shop_name: Yup.string()
        .min(2, 'Shop name must be at least 2 characters')
        .max(50, 'Shop name must be less than 50 characters')
        .required('Shop name is required'),
    shop_type: Yup.string()
        .oneOf(Object.values(ShopType), 'Invalid shop type')
        .required('Shop type is required'),
    shop_logo: Yup.mixed()
        .required('Shop logo is required')
        .test('fileFormat', 'Unsupported file format', (value) =>
            value ? SUPPORTED_IMAGE_FORMATS.includes(value.type) : true
        )
        .test(
            'fileSize',
            'File too large',
            (value) => (value ? value.size <= 5 * 1024 * 1024 : true) // 5MB
        ),
    shop_certificate: Yup.mixed()
        .required('Business certificate is required')
        .test('fileFormat', 'Unsupported file format', (value) =>
            value ? SUPPORTED_DOCUMENT_FORMATS.includes(value.type) : true
        )
        .test(
            'fileSize',
            'File too large',
            (value) => (value ? value.size <= 10 * 1024 * 1024 : true) // 10MB
        ),
    shop_phoneNumber: Yup.string()
        .matches(/^[0-9+\s-]{8,15}$/, 'Invalid phone number')
        .required('Shop phone number is required'),
    shop_description: Yup.string().max(500, 'Description must be less than 500 characters'),

    // Shop Owner Information
    shop_owner_fullName: Yup.string()
        .min(2, 'Full name must be at least 2 characters')
        .required('Owner full name is required'),
    shop_owner_email: Yup.string()
        .email('Invalid email address')
        .required('Owner email is required'),
    shop_owner_phoneNumber: Yup.string()
        .matches(/^[0-9+\s-]{8,15}$/, 'Invalid phone number')
        .required('Owner phone number is required'),
    shop_owner_cardID: Yup.string()
        .matches(/^[0-9]{9,12}$/, 'Invalid ID card number')
        .required('Owner ID card is required')
});
