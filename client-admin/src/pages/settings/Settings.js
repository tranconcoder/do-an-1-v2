import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Divider,
    Typography,
    TextField,
    Button,
    Grid,
    Switch,
    FormControlLabel,
    Alert,
    Tabs,
    Tab,
    CircularProgress
} from '@mui/material';
import { useForm } from 'react-hook-form';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
};

const Settings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [generalLoading, setGeneralLoading] = useState(false);
    const [securityLoading, setSecurityLoading] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const [generalSuccess, setGeneralSuccess] = useState('');
    const [securitySuccess, setSecuritySuccess] = useState('');
    const [notificationSuccess, setNotificationSuccess] = useState('');
    const [error, setError] = useState('');

    const {
        register: registerGeneral,
        handleSubmit: handleSubmitGeneral,
        formState: { errors: errorsGeneral }
    } = useForm({
        defaultValues: {
            siteName: 'Admin Dashboard',
            siteDescription: 'A powerful admin dashboard for managing your business.',
            contactEmail: 'admin@example.com',
            maintenanceMode: false,
            enableRegistration: true
        }
    });

    const {
        register: registerSecurity,
        handleSubmit: handleSubmitSecurity,
        formState: { errors: errorsSecurity },
        reset: resetSecurity
    } = useForm();

    const {
        register: registerNotification,
        handleSubmit: handleSubmitNotification,
        formState: { errors: errorsNotification }
    } = useForm({
        defaultValues: {
            emailNotifications: true,
            orderUpdates: true,
            newUserSignups: false,
            productUpdates: true,
            marketingEmails: false
        }
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setError('');
        setGeneralSuccess('');
        setSecuritySuccess('');
        setNotificationSuccess('');
    };

    const onGeneralSubmit = async (data) => {
        setGeneralLoading(true);
        setError('');
        setGeneralSuccess('');

        try {
            // In a real app, you'd save this data via API
            console.log('General settings data:', data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setGeneralSuccess('General settings updated successfully.');
        } catch (err) {
            setError('An error occurred while saving settings.');
            console.error('Error saving settings:', err);
        } finally {
            setGeneralLoading(false);
        }
    };

    const onSecuritySubmit = async (data) => {
        setSecurityLoading(true);
        setError('');
        setSecuritySuccess('');

        try {
            if (data.newPassword !== data.confirmPassword) {
                setError('Passwords do not match.');
                setSecurityLoading(false);
                return;
            }

            // In a real app, you'd save this data via API
            console.log('Security settings data:', data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setSecuritySuccess('Security settings updated successfully.');
            resetSecurity();
        } catch (err) {
            setError('An error occurred while updating security settings.');
            console.error('Error saving security settings:', err);
        } finally {
            setSecurityLoading(false);
        }
    };

    const onNotificationSubmit = async (data) => {
        setNotificationLoading(true);
        setError('');
        setNotificationSuccess('');

        try {
            // In a real app, you'd save this data via API
            console.log('Notification settings data:', data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setNotificationSuccess('Notification preferences updated successfully.');
        } catch (err) {
            setError('An error occurred while saving notification preferences.');
            console.error('Error saving notification preferences:', err);
        } finally {
            setNotificationLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>

            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
                        <Tab label="General" />
                        <Tab label="Security" />
                        <Tab label="Notifications" />
                    </Tabs>
                </Box>

                {error && (
                    <Box sx={{ px: 3, pt: 3 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                {/* General Settings */}
                <TabPanel value={activeTab} index={0}>
                    {generalSuccess && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {generalSuccess}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmitGeneral(onGeneralSubmit)}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Site Name"
                                    {...registerGeneral('siteName', {
                                        required: 'Site name is required'
                                    })}
                                    error={Boolean(errorsGeneral.siteName)}
                                    helperText={errorsGeneral.siteName?.message}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Site Description"
                                    multiline
                                    rows={3}
                                    {...registerGeneral('siteDescription')}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Contact Email"
                                    type="email"
                                    {...registerGeneral('contactEmail', {
                                        required: 'Contact email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    error={Boolean(errorsGeneral.contactEmail)}
                                    helperText={errorsGeneral.contactEmail?.message}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color="primary"
                                            {...registerGeneral('maintenanceMode')}
                                        />
                                    }
                                    label="Maintenance Mode"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color="primary"
                                            {...registerGeneral('enableRegistration')}
                                        />
                                    }
                                    label="Enable User Registration"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={generalLoading}
                                    >
                                        {generalLoading ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            'Save Settings'
                                        )}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>

                {/* Security Settings */}
                <TabPanel value={activeTab} index={1}>
                    {securitySuccess && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {securitySuccess}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmitSecurity(onSecuritySubmit)}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    type="password"
                                    {...registerSecurity('currentPassword', {
                                        required: 'Current password is required'
                                    })}
                                    error={Boolean(errorsSecurity.currentPassword)}
                                    helperText={errorsSecurity.currentPassword?.message}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type="password"
                                    {...registerSecurity('newPassword', {
                                        required: 'New password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters'
                                        }
                                    })}
                                    error={Boolean(errorsSecurity.newPassword)}
                                    helperText={errorsSecurity.newPassword?.message}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type="password"
                                    {...registerSecurity('confirmPassword', {
                                        required: 'Please confirm your password'
                                    })}
                                    error={Boolean(errorsSecurity.confirmPassword)}
                                    helperText={errorsSecurity.confirmPassword?.message}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color="primary"
                                            defaultChecked
                                            {...registerSecurity('twoFactorAuth')}
                                        />
                                    }
                                    label="Enable Two-Factor Authentication"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={securityLoading}
                                    >
                                        {securityLoading ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            'Update Password'
                                        )}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>

                {/* Notification Settings */}
                <TabPanel value={activeTab} index={2}>
                    {notificationSuccess && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {notificationSuccess}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmitNotification(onNotificationSubmit)}>
                        <Typography variant="h6" gutterBottom>
                            Email Notifications
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color="primary"
                                            {...registerNotification('emailNotifications')}
                                        />
                                    }
                                    label="Enable Email Notifications"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color="primary"
                                            {...registerNotification('orderUpdates')}
                                        />
                                    }
                                    label="Order Updates"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color="primary"
                                            {...registerNotification('newUserSignups')}
                                        />
                                    }
                                    label="New User Registrations"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color="primary"
                                            {...registerNotification('productUpdates')}
                                        />
                                    }
                                    label="Product Updates"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            color="primary"
                                            {...registerNotification('marketingEmails')}
                                        />
                                    }
                                    label="Marketing Emails"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={notificationLoading}
                                    >
                                        {notificationLoading ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            'Save Preferences'
                                        )}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>
            </Card>
        </Box>
    );
};

export default Settings;
