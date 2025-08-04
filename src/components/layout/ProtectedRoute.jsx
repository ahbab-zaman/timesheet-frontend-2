import { useCurrentToken } from '@/redux/features/auth/authSlice';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children}) => {

    const token = useSelector(useCurrentToken);

    if (!token) {
        return <Navigate to="/login" replace={true}  />;
    }



    return children;
};

export default ProtectedRoute;