import * as Yup from 'yup';
import { ShopType } from '../constants/shop.enum';

const SUPPORTED_IMAGE_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
const SUPPORTED_DOCUMENT_FORMATS = [...SUPPORTED_IMAGE_FORMATS, 'application/pdf'];
const phoneRegExp = /^[0-9]{10}$/;

export const shopRegisterSchema = Yup.object().shape({
    // Authentication
    phoneNumber: Yup.string()
        .required('Login phone number is required')
        .matches(phoneRegExp, 'Login phone number must be 10 digits'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),

    // Shop Information
    shop_name: Yup.string()
        .required('Shop name is required')
        .min(6, 'Shop name must be at least 6 characters')
        .max(30, 'Shop name must not exceed 30 characters'),
    shop_email: Yup.string().email('Invalid email').required('Shop email is required'),
    shop_type: Yup.string().required('Shop type is required'),
    shop_certificate: Yup.string().required('Business certificate is required'),
    shop_phoneNumber: Yup.string()
        .required('Shop phone number is required')
        .matches(phoneRegExp, 'Phone number must be 10 digits'),
    shop_description: Yup.string().max(200, 'Description must not exceed 200 characters'),

    // Shop Location
    shop_location: Yup.object().shape({
        province: Yup.string().required('Province is required'),
        district: Yup.string().required('District is required'),
        ward: Yup.string().required('Ward is required'),
        address: Yup.string()
            .required('Address is required')
            .max(200, 'Address must not exceed 200 characters')
    }),

    // Shop Owner Information
    shop_owner_fullName: Yup.string()
        .required('Owner full name is required')
        .min(6, 'Full name must be at least 6 characters')
        .max(30, 'Full name must not exceed 30 characters'),
    shop_owner_email: Yup.string().email('Invalid email').required('Owner email is required'),
    shop_owner_phoneNumber: Yup.string()
        .required('Owner phone number is required')
        .matches(phoneRegExp, 'Phone number must be 10 digits'),
    shop_owner_cardID: Yup.string().required('Owner ID card is required'),

    // Logo validation
    shop_logo: Yup.mixed().required('Shop logo is required'),

    // Warehouses
    shop_warehouses: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Warehouse name is required'),
            address: Yup.object().shape({
                province: Yup.string().required('Province is required'),
                district: Yup.string().required('District is required'),
                ward: Yup.string(),
                address: Yup.string().required('Address is required')
            }),
            phoneNumber: Yup.string()
                .required('Warehouse phone number is required')
                .matches(phoneRegExp, 'Phone number must be 10 digits')
        })
    )
});
