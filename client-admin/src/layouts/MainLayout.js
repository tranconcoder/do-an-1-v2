import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Collapse
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    Settings as SettingsIcon,
    AccountCircle,
    Logout,
    ExpandLess,
    ExpandMore
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen
            }),
            marginLeft: 0
        })
    })
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        ...(open && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen
            })
        })
    })
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end'
}));

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [productsOpen, setProductsOpen] = useState(false);
    const [usersOpen, setUsersOpen] = useState(false);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProductsClick = () => {
        setProductsOpen(!productsOpen);
    };

    const handleUsersClick = () => {
        setUsersOpen(!usersOpen);
    };

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBarStyled position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        {open ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Admin Dashboard
                    </Typography>
                    <div>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                {user?.name?.charAt(0) || 'A'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right'
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem
                                onClick={() => {
                                    handleClose();
                                    navigate('/admin/profile');
                                }}
                            >
                                <ListItemIcon>
                                    <AccountCircle fontSize="small" />
                                </ListItemIcon>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBarStyled>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box'
                    }
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <Typography variant="h6" sx={{ flexGrow: 1, pl: 2 }}>
                        Menu
                    </Typography>
                </DrawerHeader>
                <Divider />
                <List>
                    {/* Dashboard */}
                    <ListItem
                        button
                        onClick={() => navigate('/admin')}
                        selected={location.pathname === '/admin'}
                    >
                        <ListItemIcon>
                            <DashboardIcon
                                color={location.pathname === '/admin' ? 'primary' : 'inherit'}
                            />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>

                    {/* Users */}
                    <ListItem button onClick={handleUsersClick}>
                        <ListItemIcon>
                            <PeopleIcon color={isActive('/admin/users') ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText primary="Users" />
                        {usersOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={usersOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem
                                button
                                onClick={() => navigate('/admin/users')}
                                selected={location.pathname === '/admin/users'}
                                sx={{ pl: 4 }}
                            >
                                <ListItemText primary="All Users" />
                            </ListItem>
                            <ListItem
                                button
                                onClick={() => navigate('/admin/users/add')}
                                selected={location.pathname === '/admin/users/add'}
                                sx={{ pl: 4 }}
                            >
                                <ListItemText primary="Add User" />
                            </ListItem>
                        </List>
                    </Collapse>

                    {/* Products */}
                    <ListItem button onClick={handleProductsClick}>
                        <ListItemIcon>
                            <InventoryIcon
                                color={isActive('/admin/products') ? 'primary' : 'inherit'}
                            />
                        </ListItemIcon>
                        <ListItemText primary="Products" />
                        {productsOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={productsOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem
                                button
                                onClick={() => navigate('/admin/products')}
                                selected={location.pathname === '/admin/products'}
                                sx={{ pl: 4 }}
                            >
                                <ListItemText primary="All Products" />
                            </ListItem>
                            <ListItem
                                button
                                onClick={() => navigate('/admin/products/add')}
                                selected={location.pathname === '/admin/products/add'}
                                sx={{ pl: 4 }}
                            >
                                <ListItemText primary="Add Product" />
                            </ListItem>
                        </List>
                    </Collapse>

                    {/* Settings */}
                    <ListItem
                        button
                        onClick={() => navigate('/admin/settings')}
                        selected={location.pathname === '/admin/settings'}
                    >
                        <ListItemIcon>
                            <SettingsIcon
                                color={
                                    location.pathname === '/admin/settings' ? 'primary' : 'inherit'
                                }
                            />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItem>
                </List>
            </Drawer>
            <Main open={open}>
                <DrawerHeader />
                <Outlet />
            </Main>
        </Box>
    );
};

export default MainLayout;
