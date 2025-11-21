import React, { createContext, useState, useEffect } from "react";
// import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [clerkUserRole, setClerkUserRole] = useState(null);
  const [clerkUser, setClerkUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAuthForm, setOpenAuthForm] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();

//   const fetchUser = async () => {
//       try {
//         // const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
//         const { data } = await axios.get('/api/user', {
//           headers: {
//             Authorization: `Bearer ${await getToken()}`,
//           },
//         });
//         if (data.success) {
//           setClerkUserRole(data.role);
//           setClerkUser(data.user);
//           console.log(clerkUserRole);
//           console.log(clerkUser);
//         }
//       } catch (error) {
//         console.error("User not authenticated", error);
//       } finally {
//         setLoading(false);
//       }
//     };
// fetchUser();

  useEffect(() => {
      const fetchUser = async () => {
      try {
        // const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        // const { data } = await axios.get('/api/user', {
        const { data } = await axios.get(API_PATHS.AUTH.GET_USER_CLERK, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });
        if (data.success) {
          setClerkUserRole(data.role);
          setClerkUser(data.user);
        }
      } catch (error) {
        console.error("User not authenticated", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        clerkUserRole,
        clerkUser,
        loading,
        openAuthForm,
        setOpenAuthForm,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
