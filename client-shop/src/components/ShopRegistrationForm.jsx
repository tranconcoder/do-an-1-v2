import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Upload, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../configs/axios';
import { registerShopSchema } from '../../validations/shop.validation';

const { Title, Text } = Typography;
const { Option } = Select;

const ShopRegistrationForm = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);

    const shopTypes = [
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Beauty & Health',
        'Sports & Outdoors',
        'Toys & Games',
        'Books & Media',
        'Food & Grocery',
        'Other'
    ];

    const onFinish = async (values) => {
        try {
            await registerShopSchema.validate(values, { abortEarly: false });

            setLoading(true);

            // First, upload logo if provided
            let logoUrl = '';
            if (logoFile) {
                const formData = new FormData();
                formData.append('file', logoFile);
                const uploadResponse = await axios.post('/media/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                logoUrl = uploadResponse.data.metadata.url;
            }

            // Submit shop registration with logo URL
            const response = await axios.post('/shops/register', {
                ...values,
                shop_logo: logoUrl
            });

            message.success(
                'Shop registration submitted successfully! Please wait for admin approval.'
            );
        } catch (error) {
            if (error.name === 'ValidationError') {
                error.errors.forEach((err) => message.error(err));
            } else {
                message.error('Failed to submit shop registration. Please try again.');
                console.error('Registration error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (info) => {
        if (info.file.status === 'uploading') {
            return;
        }
        if (info.file.status === 'done') {
            setLogoFile(info.file.originFileObj);
        }
    };

    const logoProps = {
        name: 'file',
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return Upload.LIST_IGNORE;
            }
            return false;
        },
        onChange: handleLogoChange
    };

    return (
        <Card style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>Shop Registration</Title>
                <Text>
                    Please fill out the form below to register your shop. Our team will review your
                    application and respond within 2-3 business days.
                </Text>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Title level={4}>Shop Information</Title>
                    <Form.Item
                        name="shop_name"
                        label="Shop Name"
                        rules={[{ required: true, message: 'Please enter your shop name' }]}
                    >
                        <Input placeholder="Your shop's name" />
                    </Form.Item>

                    <Form.Item
                        name="shop_email"
                        label="Shop Email"
                        rules={[
                            { required: true, message: 'Please enter your shop email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="contact@yourshop.com" />
                    </Form.Item>

                    <Form.Item
                        name="shop_phoneNumber"
                        label="Shop Phone Number"
                        rules={[{ required: true, message: 'Please enter your shop phone number' }]}
                    >
                        <Input placeholder="Shop contact number" />
                    </Form.Item>

                    <Form.Item
                        name="shop_type"
                        label="Shop Category"
                        rules={[{ required: true, message: 'Please select your shop type' }]}
                    >
                        <Select placeholder="Select shop category">
                            {shopTypes.map((type) => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="shop_certificate"
                        label="Business Certificate Number"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter your business certificate number'
                            }
                        ]}
                    >
                        <Input placeholder="Business registration/certificate number" />
                    </Form.Item>

                    <Form.Item name="shop_description" label="Shop Description">
                        <Input.TextArea
                            placeholder="Tell us about your shop and what you sell..."
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item name="shop_logo" label="Shop Logo">
                        <Upload {...logoProps}>
                            <Button icon={<UploadOutlined />}>Upload Shop Logo</Button>
                        </Upload>
                    </Form.Item>

                    <Title level={4} style={{ marginTop: 20 }}>
                        Owner Information
                    </Title>

                    <Form.Item
                        name="shop_owner_fullName"
                        label="Owner's Full Name"
                        rules={[{ required: true, message: "Please enter the owner's full name" }]}
                    >
                        <Input placeholder="Full name of shop owner" />
                    </Form.Item>

                    <Form.Item
                        name="shop_owner_email"
                        label="Owner's Email"
                        rules={[
                            { required: true, message: "Please enter the owner's email" },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="owner@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="shop_owner_phoneNumber"
                        label="Owner's Phone Number"
                        rules={[
                            { required: true, message: "Please enter the owner's phone number" }
                        ]}
                    >
                        <Input placeholder="Owner's contact number" />
                    </Form.Item>

                    <Form.Item
                        name="shop_owner_cardID"
                        label="Owner's ID Card Number"
                        rules={[
                            { required: true, message: "Please enter the owner's ID card number" }
                        ]}
                    >
                        <Input placeholder="National ID card number" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            style={{ width: '100%', marginTop: 20 }}
                        >
                            Submit Shop Registration
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </Card>
    );
};

export default ShopRegistrationForm;
