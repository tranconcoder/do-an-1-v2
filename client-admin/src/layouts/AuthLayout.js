import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthLayout = ({ children }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: (theme) => theme.palette.grey[100]
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{ mb: 4 }}>
                        Admin Dashboard
                    </Typography>
                    {children}
                </Paper>
            </Container>
        </Box>
    );
};

export default AuthLayout;
