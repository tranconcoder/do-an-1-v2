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

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        // Simulate API call to fetch products
        const fetchProducts = async () => {
            // In a real app, you would fetch from your API
            setTimeout(() => {
                const mockProducts = [
                    {
                        id: 1,
                        name: 'Smartphone X',
                        category: 'Electronics',
                        price: 899.99,
                        stock: 120,
                        status: 'In Stock'
                    },
                    {
                        id: 2,
                        name: 'Laptop Pro',
                        category: 'Electronics',
                        price: 1299.99,
                        stock: 45,
                        status: 'In Stock'
                    },
                    {
                        id: 3,
                        name: 'Wireless Headphones',
                        category: 'Electronics',
                        price: 199.99,
                        stock: 75,
                        status: 'In Stock'
                    },
                    {
                        id: 4,
                        name: 'Fitness Tracker',
                        category: 'Wearables',
                        price: 89.99,
                        stock: 30,
                        status: 'Low Stock'
                    },
                    {
                        id: 5,
                        name: 'Smart Watch',
                        category: 'Wearables',
                        price: 249.99,
                        stock: 55,
                        status: 'In Stock'
                    },
                    {
                        id: 6,
                        name: 'Bluetooth Speaker',
                        category: 'Audio',
                        price: 79.99,
                        stock: 0,
                        status: 'Out of Stock'
                    },
                    {
                        id: 7,
                        name: 'Gaming Console',
                        category: 'Gaming',
                        price: 499.99,
                        stock: 15,
                        status: 'Low Stock'
                    },
                    {
                        id: 8,
                        name: 'Digital Camera',
                        category: 'Photography',
                        price: 649.99,
                        stock: 28,
                        status: 'In Stock'
                    },
                    {
                        id: 9,
                        name: 'Drone',
                        category: 'Photography',
                        price: 799.99,
                        stock: 0,
                        status: 'Out of Stock'
                    },
                    {
                        id: 10,
                        name: 'Tablet',
                        category: 'Electronics',
                        price: 349.99,
                        stock: 62,
                        status: 'In Stock'
                    },
                    {
                        id: 11,
                        name: 'Coffee Maker',
                        category: 'Home',
                        price: 129.99,
                        stock: 41,
                        status: 'In Stock'
                    },
                    {
                        id: 12,
                        name: 'Robot Vacuum',
                        category: 'Home',
                        price: 299.99,
                        stock: 8,
                        status: 'Low Stock'
                    }
                ];
                setProducts(mockProducts);
                setLoading(false);
            }, 1000);
        };

        fetchProducts();
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

    const handleAddProduct = () => {
        navigate('/admin/products/add');
    };

    const handleEditProduct = (id) => {
        navigate(`/admin/products/edit/${id}`);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        // In a real app, you would call your API to delete the product
        setProducts(products.filter((product) => product.id !== productToDelete.id));
        setDeleteDialogOpen(false);
        setProductToDelete(null);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
    };

    // Filter products based on search term
    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const paginatedProducts = filteredProducts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Stock':
                return 'success';
            case 'Low Stock':
                return 'warning';
            case 'Out of Stock':
                return 'error';
            default:
                return 'default';
        }
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}
            >
                <Typography variant="h4">Products</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddProduct}>
                    Add Product
                </Button>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Search products by name or category"
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
                            <TableCell>Product Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Stock</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                                    <TableCell align="right">{product.stock}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={product.status}
                                            color={getStatusColor(product.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleEditProduct(product.id)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(product)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No products found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredProducts.length}
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
                        Are you sure you want to delete product "{productToDelete?.name}"? This
                        action cannot be undone.
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

export default Products;
