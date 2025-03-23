import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from '../../configs/axios';

const ShopRegistrationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [actionResult, setActionResult] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchShopDetails = async () => {
            try {
                setLoading(true);
                // Replace with actual API endpoint
                const response = await axios.get(`/shops/registrations/${id}`);
                setShop(response.data.metadata);
            } catch (err) {
                console.error('Error fetching shop details:', err);
                setError('Failed to load shop registration details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchShopDetails();
    }, [id]);

    const handleApproveRequest = async () => {
        try {
            setSubmitting(true);
            // Replace with actual API endpoint
            await axios.put(`/shops/registrations/${id}/approve`);
            setActionResult({
                type: 'success',
                message: 'Shop registration has been approved successfully!'
            });
            // Update shop status in current view
            setShop({ ...shop, status: 'APPROVED' });
        } catch (err) {
            console.error('Error approving shop:', err);
            setActionResult({
                type: 'error',
                message: 'Failed to approve shop. Please try again.'
            });
        } finally {
            setSubmitting(false);
            setOpenApproveDialog(false);
        }
    };

    const handleRejectRequest = async () => {
        try {
            setSubmitting(true);
            // Replace with actual API endpoint
            await axios.put(`/shops/registrations/${id}/reject`, { reason: rejectionReason });
            setActionResult({
                type: 'success',
                message: 'Shop registration has been rejected.'
            });
            // Update shop status in current view
            setShop({ ...shop, status: 'REJECTED', rejectionReason });
        } catch (err) {
            console.error('Error rejecting shop:', err);
            setActionResult({
                type: 'error',
                message: 'Failed to reject shop. Please try again.'
            });
        } finally {
            setSubmitting(false);
            setOpenRejectDialog(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !shop) {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography color="error">{error || 'Shop not found'}</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
                    Back to Registrations
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
                    Back
                </Button>
                <Typography variant="h4">Shop Registration Details</Typography>
            </Box>

            {actionResult.message && (
                <Alert severity={actionResult.type} sx={{ mb: 3 }}>
                    {actionResult.message}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Shop Status
                        </Typography>
                        <Box
                            sx={{
                                display: 'inline-block',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor:
                                    shop.status === 'APPROVED'
                                        ? 'success.main'
                                        : shop.status === 'REJECTED'
                                        ? 'error.main'
                                        : 'warning.main',
                                color: 'white'
                            }}
                        >
                            {shop.status || 'PENDING'}
                        </Box>
                    </Grid>

                    {shop.status === 'REJECTED' && shop.rejectionReason && (
                        <Grid item xs={12}>
                            <Alert severity="info">
                                <Typography variant="subtitle2">Rejection Reason:</Typography>
                                {shop.rejectionReason}
                            </Alert>
                        </Grid>
                    )}

                    {shop.status !== 'APPROVED' && shop.status !== 'REJECTED' && (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => setOpenApproveDialog(true)}
                                >
                                    Approve Registration
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setOpenRejectDialog(true)}
                                >
                                    Reject Registration
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Shop Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={shop.shop_logo || 'https://via.placeholder.com/300'}
                                        alt={`${shop.shop_name} Logo`}
                                        sx={{ objectFit: 'contain' }}
                                    />
                                    <CardContent>
                                        <Typography variant="h5">{shop.shop_name}</Typography>
                                        <Typography color="textSecondary">
                                            {shop.shop_type}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Certificate Number:</Typography>
                                <Typography>{shop.shop_certificate}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Phone Number:</Typography>
                                <Typography>{shop.shop_phoneNumber}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2">Email:</Typography>
                                <Typography>{shop.shop_email}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2">Description:</Typography>
                                <Typography>
                                    {shop.shop_description || 'No description provided'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Owner Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2">Full Name:</Typography>
                                <Typography>{shop.shop_owner_fullName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Email:</Typography>
                                <Typography>{shop.shop_owner_email}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Phone Number:</Typography>
                                <Typography>{shop.shop_owner_phoneNumber}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2">ID Card Number:</Typography>
                                <Typography>{shop.shop_owner_cardID}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Approve Dialog */}
            <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
                <DialogTitle>Approve Shop Registration</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to approve this shop registration? The shop owner will
                        be notified and will be able to access the seller platform.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenApproveDialog(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApproveRequest}
                        variant="contained"
                        color="success"
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Approve'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
                <DialogTitle>Reject Shop Registration</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please provide a reason for rejecting this shop registration. This
                        information will be sent to the shop owner.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rejection Reason"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRejectDialog(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRejectRequest}
                        color="error"
                        variant="contained"
                        disabled={submitting || !rejectionReason.trim()}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ShopRegistrationDetail;
