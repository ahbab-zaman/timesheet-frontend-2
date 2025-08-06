// components/RedirectToDashboard.js
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/redux/features/auth/authSlice';

const RedirectToDashboard = () => {
  const user = useSelector(useCurrentUser);

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
};

export default RedirectToDashboard;
