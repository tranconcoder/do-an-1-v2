import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    FormHelperText
} from '@mui/material';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const isEditMode = Boolean(id);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm();

    useEffect(() => {
        // Load categories
        setCategories([
            { id: 'electronics', name: 'Electronics' },
            { id: 'wearables', name: 'Wearables' },
            { id: 'audio', name: 'Audio' },
            { id: 'gaming', name: 'Gaming' },
            { id: 'photography', name: 'Photography' },
            { id: 'home', name: 'Home' }
        ]);

        // Load product data if in edit mode
        if (isEditMode) {
            setLoading(true);
            // In a real app, you'd fetch product data from API
            // Simulate API call
            setTimeout(() => {
                // Mock product data
                const productData = {
                    name: 'Smartphone X',
                    description: 'The latest smartphone with advanced features.',
                    price: '899.99',
                    stock: '120',
                    category: 'electronics',
                    imageUrl: 'https://example.com/smartphone.jpg',
                    status: 'In Stock',
                    features: 'High-resolution camera, Long battery life, Water resistant'
                };

                // Set form values
                Object.keys(productData).forEach((key) => {
                    setValue(key, productData[key]);
                });

                setLoading(false);
            }, 500);
        }
    }, [id, isEditMode, setValue]);

    const onSubmit = async (data) => {
        setError('');
        setSaveLoading(true);

        try {
            // In a real app, you'd call your API to create/update product
            console.log('Form data submitted:', data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            navigate('/admin/products');
        } catch (err) {
            setError('An error occurred while saving the product.');
            console.error('Error saving product:', err);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {isEditMode ? 'Edit Product' : 'Add New Product'}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    {...register('name', { required: 'Product name is required' })}
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={4}
                                    {...register('description', {
                                        required: 'Description is required'
                                    })}
                                    error={Boolean(errors.description)}
                                    helperText={errors.description?.message}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Price ($)"
                                    type="number"
                                    inputProps={{ step: '0.01', min: '0' }}
                                    {...register('price', {
                                        required: 'Price is required',
                                        min: { value: 0, message: 'Price must be positive' }
                                    })}
                                    error={Boolean(errors.price)}
                                    helperText={errors.price?.message}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Stock Quantity"
                                    type="number"
                                    inputProps={{ step: '1', min: '0' }}
                                    {...register('stock', {
                                        required: 'Stock quantity is required',
                                        min: { value: 0, message: 'Stock must be positive' }
                                    })}
                                    error={Boolean(errors.stock)}
                                    helperText={errors.stock?.message}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth error={Boolean(errors.category)}>
                                    <InputLabel id="category-label">Category</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        label="Category"
                                        defaultValue=""
                                        {...register('category', {
                                            required: 'Category is required'
                                        })}
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.category && (
                                        <FormHelperText>{errors.category.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth error={Boolean(errors.status)}>
                                    <InputLabel id="status-label">Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        label="Status"
                                        defaultValue=""
                                        {...register('status', { required: 'Status is required' })}
                                    >
                                        <MenuItem value="In Stock">In Stock</MenuItem>
                                        <MenuItem value="Low Stock">Low Stock</MenuItem>
                                        <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                                    </Select>
                                    {errors.status && (
                                        <FormHelperText>{errors.status.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField fullWidth label="Image URL" {...register('imageUrl')} />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Features"
                                    multiline
                                    rows={2}
                                    placeholder="Enter product features, separated by commas"
                                    {...register('features')}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: 2,
                                        mt: 3
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/admin/products')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={saveLoading}
                                    >
                                        {saveLoading ? (
                                            <CircularProgress size={24} />
                                        ) : isEditMode ? (
                                            'Update Product'
                                        ) : (
                                            'Create Product'
                                        )}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProductForm;
