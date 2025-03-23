import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import StoreIcon from '@mui/icons-material/Store';

function Sidebar() {
    const location = useLocation();
    const { pathname } = location;

    return (
        <div className="sidebar">
            {/* ...existing menu items... */}

            {/* Add this new menu item for shop registrations */}
            <ListItem
                button
                component={Link}
                to="/admin/shops/registrations"
                selected={pathname.startsWith('/admin/shops/registrations')}
            >
                <ListItemIcon>
                    <StoreIcon />
                </ListItemIcon>
                <ListItemText primary="Shop Registrations" />
            </ListItem>

            {/* ...existing code... */}
        </div>
    );
}

export default Sidebar;
