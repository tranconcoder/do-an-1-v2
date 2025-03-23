import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    IconButton,
    Chip,
    Avatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        // Simulate API call to fetch users
        const fetchUsers = async () => {
            // In a real app, you would fetch from your API
            setTimeout(() => {
                const mockUsers = [
                    {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'Admin',
                        status: 'Active',
                        lastLogin: '2023-06-15'
                    },
                    {
                        id: 2,
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        role: 'Editor',
                        status: 'Active',
                        lastLogin: '2023-06-14'
                    },
                    {
                        id: 3,
                        name: 'Sam Wilson',
                        email: 'sam@example.com',
                        role: 'User',
                        status: 'Inactive',
                        lastLogin: '2023-06-10'
                    },
                    {
                        id: 4,
                        name: 'Emily Brown',
                        email: 'emily@example.com',
                        role: 'User',
                        status: 'Active',
                        lastLogin: '2023-06-12'
                    },
                    {
                        id: 5,
                        name: 'Robert Johnson',
                        email: 'robert@example.com',
                        role: 'Editor',
                        status: 'Active',
                        lastLogin: '2023-06-11'
                    },
                    {
                        id: 6,
                        name: 'Lisa Davis',
                        email: 'lisa@example.com',
                        role: 'User',
                        status: 'Active',
                        lastLogin: '2023-06-09'
                    },
                    {
                        id: 7,
                        name: 'Michael Miller',
                        email: 'michael@example.com',
                        role: 'User',
                        status: 'Inactive',
                        lastLogin: '2023-06-08'
                    },
                    {
                        id: 8,
                        name: 'Sarah Garcia',
                        email: 'sarah@example.com',
                        role: 'User',
                        status: 'Active',
                        lastLogin: '2023-06-07'
                    },
                    {
                        id: 9,
                        name: 'David Martinez',
                        email: 'david@example.com',
                        role: 'Editor',
                        status: 'Active',
                        lastLogin: '2023-06-06'
                    },
                    {
                        id: 10,
                        name: 'Anna Rodriguez',
                        email: 'anna@example.com',
                        role: 'User',
                        status: 'Active',
                        lastLogin: '2023-06-05'
                    },
                    {
                        id: 11,
                        name: 'James Wilson',
                        email: 'james@example.com',
                        role: 'User',
                        status: 'Inactive',
                        lastLogin: '2023-06-04'
                    },
                    {
                        id: 12,
                        name: 'Patricia Moore',
                        email: 'patricia@example.com',
                        role: 'User',
                        status: 'Active',
                        lastLogin: '2023-06-03'
                    }
                ];
                setUsers(mockUsers);
                setLoading(false);
            }, 1000);
        };

        fetchUsers();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleAddUser = () => {
        navigate('/admin/users/add');
    };

    const handleEditUser = (id) => {
        navigate(`/admin/users/edit/${id}`);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        // In a real app, you would call your API to delete the user
        setUsers(users.filter((user) => user.id !== userToDelete.id));
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    // Filter users based on search term
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}
            >
                <Typography variant="h4">Users</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUser}>
                    Add User
                </Button>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Search users by name, email, or role"
                        variant="outlined"
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                </CardContent>
            </Card>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last Login</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar sx={{ mr: 2 }}>{user.name.charAt(0)}</Avatar>
                                            {user.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            color={
                                                user.role === 'Admin'
                                                    ? 'primary'
                                                    : user.role === 'Editor'
                                                    ? 'secondary'
                                                    : 'default'
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status}
                                            color={user.status === 'Active' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{user.lastLogin}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEditUser(user.id)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete user "{userToDelete?.name}"? This action
                        cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
