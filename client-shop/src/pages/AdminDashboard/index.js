import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './AdminDashboard.module.scss';
import {
    FaStore,
    FaUsers,
    FaShoppingCart,
    FaChartLine,
    FaArrowUp,
    FaArrowDown,
    FaCalendarAlt,
    FaEye
} from 'react-icons/fa';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';

const cx = classNames.bind(styles);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');

    const timeRangeOptions = [
        { value: 'today', label: 'Hôm nay' },
        { value: 'week', label: 'Tuần này' },
        { value: 'month', label: 'Tháng này' },
        { value: 'year', label: 'Năm này' },
        { value: 'all', label: 'Toàn bộ' }
    ];

    useEffect(() => {
        fetchDashboardStats();
    }, [timeRange]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await analyticsService.getDashboardStats(timeRange);

            if (response.metadata) {
                setStats(response.metadata);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            showToast('Lỗi khi tải thống kê dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStatCard = (title, icon, data, color, onClick) => {
        const { total, change } = data || { total: 0, change: 0 };
        const isPositive = change >= 0;

        return (
            <div className={cx('stat-card', color)} onClick={onClick}>
                <div className={cx('stat-icon')}>{icon}</div>
                <div className={cx('stat-content')}>
                    <h3>{title}</h3>
                    <div className={cx('stat-number')}>{total?.toLocaleString() || 0}</div>
                    <div
                        className={cx('stat-change', {
                            positive: isPositive,
                            negative: !isPositive
                        })}
                    >
                        {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                        <span>{Math.abs(change)}%</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderOrderStatusChart = () => {
        if (!stats?.orderStats) return null;

        const data = [
            { name: 'Chờ xác nhận', value: stats.orderStats.pending?.count || 0, color: '#ffc107' },
            {
                name: 'Đã xác nhận',
                value: stats.orderStats.confirmed?.count || 0,
                color: '#28a745'
            },
            { name: 'Đang giao', value: stats.orderStats.shipped?.count || 0, color: '#17a2b8' },
            { name: 'Hoàn thành', value: stats.orderStats.delivered?.count || 0, color: '#007bff' },
            { name: 'Đã hủy', value: stats.orderStats.cancelled?.count || 0, color: '#dc3545' }
        ].filter((item) => item.value > 0);

        return (
            <div className={cx('chart-container')}>
                <h3>Thống kê đơn hàng theo trạng thái</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderOrdersByDayChart = () => {
        if (!stats?.charts?.ordersByDay?.length) return null;

        const data = stats.charts.ordersByDay;

        return (
            <div className={cx('chart-container')}>
                <h3>Số lượng đơn hàng theo ngày</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip
                            labelFormatter={(value) => `Ngày: ${value}`}
                            formatter={(value, name) => {
                                if (name === 'count') return [`${value} đơn`, 'Số lượng đơn hàng'];
                                if (name === 'totalValue')
                                    return [formatCurrency(value), 'Tổng giá trị'];
                                return [value, name];
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#2c8c99"
                            fill="#2c8c99"
                            fillOpacity={0.6}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const quickActions = [
        {
            title: 'Đăng ký Shop',
            icon: <FaStore />,
            description: 'Xem và quản lý yêu cầu đăng ký shop',
            onClick: () => navigate('/admin/shops'),
            color: 'blue'
        },
        {
            title: 'Quản lý User',
            icon: <FaUsers />,
            description: 'Quản lý tài khoản và quyền người dùng',
            onClick: () => navigate('/admin/users'),
            color: 'green'
        },
        {
            title: 'Sản phẩm',
            icon: <FaShoppingCart />,
            description: 'Quản lý và kiểm duyệt sản phẩm',
            onClick: () => navigate('/admin/products'),
            color: 'purple'
        },
        {
            title: 'Báo cáo chi tiết',
            icon: <FaEye />,
            description: 'Xem báo cáo analytics chi tiết',
            onClick: () => navigate('/admin/analytics'),
            color: 'orange'
        }
    ];

    if (loading) {
        return (
            <div className={cx('dashboard-container')}>
                <div className={cx('loading-state')}>
                    <div className={cx('loader')}></div>
                    <p>Đang tải thống kê...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('dashboard-container')}>
            {/* Header with Time Range Selector */}
            <div className={cx('dashboard-header')}>
                <div className={cx('header-left')}>
                    <h1>Dashboard Quản Trị</h1>
                    <p>Tổng quan về hoạt động của hệ thống</p>
                </div>
                <div className={cx('header-right')}>
                    <div className={cx('time-selector')}>
                        <FaCalendarAlt className={cx('calendar-icon')} />
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className={cx('time-dropdown')}
                        >
                            {timeRangeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className={cx('stats-grid')}>
                    {renderStatCard(
                        'Tổng đơn hàng',
                        <FaShoppingCart />,
                        stats.overview.totalOrders,
                        'blue',
                        () => navigate('/admin/orders')
                    )}
                    {renderStatCard(
                        'Shop hoạt động',
                        <FaStore />,
                        stats.overview.totalShops,
                        'green',
                        () => navigate('/admin/shops')
                    )}
                    {renderStatCard(
                        'Người dùng',
                        <FaUsers />,
                        stats.overview.totalUsers,
                        'purple',
                        () => navigate('/admin/users')
                    )}
                    {renderStatCard(
                        'Sản phẩm',
                        <FaShoppingCart />,
                        stats.overview.totalProducts,
                        'orange',
                        () => navigate('/admin/products')
                    )}
                </div>
            )}

            {/* Charts Section */}
            {stats && (
                <div className={cx('charts-section')}>
                    <div className={cx('charts-grid')}>
                        <div className={cx('chart-wrapper')}>{renderOrdersByDayChart()}</div>
                        <div className={cx('chart-wrapper')}>{renderOrderStatusChart()}</div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className={cx('quick-actions-section')}>
                <h2>Hành động nhanh</h2>
                <div className={cx('actions-grid')}>
                    {quickActions.map((action, index) => (
                        <div
                            key={index}
                            className={cx('action-card', action.color)}
                            onClick={action.onClick}
                        >
                            <div className={cx('action-icon')}>{action.icon}</div>
                            <h3>{action.title}</h3>
                            <p>{action.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
