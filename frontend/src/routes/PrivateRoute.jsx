import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/userContext";

const PrivateRoute = ({allowedRoles}) => {
  const { clerkUser, loading, clerkUserRole } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  if (!clerkUser) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(clerkUserRole)) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />
}
export default PrivateRoute