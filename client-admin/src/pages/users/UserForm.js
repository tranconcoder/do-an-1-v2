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

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm();

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            // In a real app, you'd fetch user data from API
            // Simulate API call with timeout
            setTimeout(() => {
                // Mock user data
                const userData = {
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'Admin',
                    status: 'Active',
                    phone: '(123) 456-7890',
                    address: '123 Main St, Anytown, USA'
                };

                // Set form values
                Object.keys(userData).forEach((key) => {
                    setValue(key, userData[key]);
                });

                setLoading(false);
            }, 500);
        }
    }, [id, isEditMode, setValue]);

    const onSubmit = async (data) => {
        setError('');
        setSaveLoading(true);

        try {
            // In a real app, you'd call your API to create/update user
            console.log('Form data submitted:', data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            navigate('/admin/users');
        } catch (err) {
            setError('An error occurred while saving the user.');
            console.error('Error saving user:', err);
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
                {isEditMode ? 'Edit User' : 'Add New User'}
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
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    {...register('name', { required: 'Name is required' })}
                                    error={Boolean(errors.name)}
                                    helperText={errors.name?.message}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    error={Boolean(errors.email)}
                                    helperText={errors.email?.message}
                                />
                            </Grid>

                            {!isEditMode && (
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        {...register('password', {
                                            required: !isEditMode ? 'Password is required' : false,
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters'
                                            }
                                        })}
                                        error={Boolean(errors.password)}
                                        helperText={errors.password?.message}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Phone Number" {...register('phone')} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth error={Boolean(errors.role)}>
                                    <InputLabel id="role-label">Role</InputLabel>
                                    <Select
                                        labelId="role-label"
                                        label="Role"
                                        defaultValue=""
                                        {...register('role', { required: 'Role is required' })}
                                    >
                                        <MenuItem value="Admin">Admin</MenuItem>
                                        <MenuItem value="Editor">Editor</MenuItem>
                                        <MenuItem value="User">User</MenuItem>
                                    </Select>
                                    {errors.role && (
                                        <FormHelperText>{errors.role.message}</FormHelperText>
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
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                    </Select>
                                    {errors.status && (
                                        <FormHelperText>{errors.status.message}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    multiline
                                    rows={3}
                                    {...register('address')}
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
                                        onClick={() => navigate('/admin/users')}
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
                                            'Update User'
                                        ) : (
                                            'Create User'
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

export default UserForm;
