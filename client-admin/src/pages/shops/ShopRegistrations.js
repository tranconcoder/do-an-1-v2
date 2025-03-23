import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Button,
    Chip,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../configs/axios';

const ShopRegistrations = () => {
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                setLoading(true);
                // Replace with your actual API endpoint for fetching shop registrations
                const response = await axios.get('/shops/registrations');
                setRegistrations(response.data.metadata || []);
            } catch (err) {
                console.error('Error fetching shop registrations:', err);
                setError('Failed to load shop registrations. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = (shopId) => {
        navigate(`/admin/shops/registrations/${shopId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Shop Registration Requests
            </Typography>

            <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Shop ID</TableCell>
                                <TableCell>Shop Name</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {registrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        No shop registration requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                registrations
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((shop) => (
                                        <TableRow hover key={shop._id}>
                                            <TableCell>{shop._id}</TableCell>
                                            <TableCell>{shop.shop_name}</TableCell>
                                            <TableCell>{shop.shop_owner_fullName}</TableCell>
                                            <TableCell>{shop.shop_email}</TableCell>
                                            <TableCell>{shop.shop_phoneNumber}</TableCell>
                                            <TableCell>{shop.shop_type}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={shop.status || 'PENDING'}
                                                    color={
                                                        shop.status === 'APPROVED'
                                                            ? 'success'
                                                            : shop.status === 'REJECTED'
                                                            ? 'error'
                                                            : 'warning'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleViewDetails(shop._id)}
                                                >
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={registrations.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default ShopRegistrations;
