import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/redux/features/auth/authSlice";

const RedirectToDashboard = ({ children }) => {
const user = useSelector(useCurrentUser);

  if (user && user.role) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  return children;
};

export default RedirectToDashboard;
