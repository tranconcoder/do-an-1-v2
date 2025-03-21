import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/userSlice';
import { fetchUserProfile } from '../services/userApi';

const AuthCheck = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const profile = await fetchUserProfile();
                dispatch(loginSuccess(profile));
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        };

        checkAuth();
    }, []); // eslint-disable-line

    return null; // This component doesn't render anything
};

export default AuthCheck;
