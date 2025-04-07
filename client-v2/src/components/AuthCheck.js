import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, selectIsAuthenticated } from '../redux/slices/userSlice';
import { fetchCart } from '../redux/slices/cartSlice';

const AuthCheck = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
            console.log('Fetching cart...');
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        dispatch(fetchUser());
    }, []);

    return null;
};

export default AuthCheck;
