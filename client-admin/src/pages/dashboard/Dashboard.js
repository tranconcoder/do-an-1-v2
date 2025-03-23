import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    CircularProgress
} from '@mui/material';
import {
    PeopleOutlined,
    ShoppingCartOutlined,
    AttachMoneyOutlined,
    AssignmentOutlined
} from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0,
        revenue: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        // Simulate API call
        const fetchDashboardData = async () => {
            // In a real app, you would fetch data from your backend
            setTimeout(() => {
                setStats({
                    users: 2584,
                    products: 468,
                    orders: 876,
                    revenue: 215400
                });

                setRecentUsers([
                    { id: 1, name: 'John Doe', email: 'john@example.com', date: '2023-06-15' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', date: '2023-06-14' },
                    { id: 3, name: 'Sam Wilson', email: 'sam@example.com', date: '2023-06-13' },
                    { id: 4, name: 'Emily Brown', email: 'emily@example.com', date: '2023-06-12' }
                ]);

                setRecentOrders([
                    {
                        id: 'ORD-1234',
                        customer: 'John Doe',
                        amount: 540,
                        status: 'Completed',
                        date: '2023-06-15'
                    },
                    {
                        id: 'ORD-1233',
                        customer: 'Jane Smith',
                        amount: 120,
                        status: 'Processing',
                        date: '2023-06-14'
                    },
                    {
                        id: 'ORD-1232',
                        customer: 'Sam Wilson',
                        amount: 880,
                        status: 'Completed',
                        date: '2023-06-13'
                    },
                    {
                        id: 'ORD-1231',
                        customer: 'Emily Brown',
                        amount: 340,
                        status: 'Pending',
                        date: '2023-06-12'
                    }
                ]);

                setLoading(false);
            }, 1000);
        };

        fetchDashboardData();
    }, []);

    const salesData = {
        labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ],
        datasets: [
            {
                label: 'Sales 2023',
                data: [
                    18000, 22000, 19000, 27000, 25000, 24000, 28000, 26000, 32000, 35000, 37000,
                    40000
                ],
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const productCategoryData = {
        labels: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
        datasets: [
            {
                data: [35, 25, 15, 15, 10],
                backgroundColor: ['#1976d2', '#dc004e', '#ff9800', '#4caf50', '#9c27b0']
            }
        ]
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
                Dashboard
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        TOTAL USERS
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.users.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'primary.light', height: 56, width: 56 }}>
                                    <PeopleOutlined />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        TOTAL PRODUCTS
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.products.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'success.light', height: 56, width: 56 }}>
                                    <ShoppingCartOutlined />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        TOTAL ORDERS
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.orders.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'warning.light', height: 56, width: 56 }}>
                                    <AssignmentOutlined />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        TOTAL REVENUE
                                    </Typography>
                                    <Typography variant="h4">
                                        ${stats.revenue.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'error.light', height: 56, width: 56 }}>
                                    <AttachMoneyOutlined />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardHeader title="Sales Overview" />
                        <Divider />
                        <CardContent>
                            <Box sx={{ height: 380, position: 'relative' }}>
                                <Line
                                    data={salesData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top'
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardHeader title="Product Categories" />
                        <Divider />
                        <CardContent>
                            <Box
                                sx={{
                                    height: 380,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Doughnut
                                    data={productCategoryData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: '70%',
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Activity */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="Recent Users" />
                        <Divider />
                        <List>
                            {recentUsers.map((user) => (
                                <React.Fragment key={user.id}>
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar>{user.name.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.name}
                                            secondary={`${user.email} • Registered on ${user.date}`}
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="Recent Orders" />
                        <Divider />
                        <List>
                            {recentOrders.map((order) => (
                                <React.Fragment key={order.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`${order.id} - ${order.customer}`}
                                            secondary={`$${order.amount} • ${order.status} • ${order.date}`}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
