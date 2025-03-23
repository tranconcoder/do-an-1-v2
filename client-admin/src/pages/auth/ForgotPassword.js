import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography, Alert, Link } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { forgotPassword } = useAuth();

    const onSubmit = async (data) => {
        try {
            setError('');
            await forgotPassword(data.email);
            setIsSubmitted(true);
        } catch (error) {
            setError(error.message || 'Failed to process your request');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isSubmitted ? (
                <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Password reset instructions have been sent to your email.
                    </Alert>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/login')}
                        sx={{ mt: 2 }}
                    >
                        Return to Login
                    </Button>
                </Box>
            ) : (
                <>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                        Enter your email address below and we'll send you a link to reset your
                        password.
                    </Typography>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
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

                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Reset Password
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Link component={RouterLink} to="/login" variant="body2">
                            Back to Login
                        </Link>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ForgotPassword;
