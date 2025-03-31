import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUser } from '../redux/slices/userSlice';

const AuthCheck = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Use the fetchUser thunk to handle authentication state
                dispatch(fetchUser());
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        };

        checkAuth();
    }, []); // eslint-disable-line

    return null; // This component doesn't render anything
};

export default AuthCheck;
