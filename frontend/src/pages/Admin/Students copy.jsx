// import React, { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { LuGalleryVerticalEnd, LuLoaderCircle, LuPlus } from "react-icons/lu";
// import toast from "react-hot-toast";
// import moment from "moment";
// import DashboardLayout from "../../components/layouts/DashboardLayout";

// // import axiosInstance from "../../utils/axiosInstance";
// import { API_PATHS } from "../../utils/apiPaths";
// import Modal from "../../components/Modal";
// import Tabs from "../../components/Tabs";
// import ResearchPostSummaryCard from "../../components/Cards/ResearchPostSummaryCard";
// import DeleteAlertContent from "../../components/DeleteAlertContent";
// import axios from "axios";
// import { useAuth } from "@clerk/clerk-react";
// import { UserContext } from "../../context/userContext";

// axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// const Students = () => {
//   const { user, clerkUserRole } = useContext(UserContext);
//   const navigate = useNavigate();
//   const { getToken } = useAuth();

//   const [tabs, setTabs] = useState([]);
//   const [filterStatus, setFilterStatus] = useState("requests");
//   const [studentsList, setStudentsList] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [scope, setScope] = useState("me"); // "me" | "all"

//   const [openDeleteAlert, setOpenDeleteAlert] = useState({
//     open: false,
//     data: null,
//   });

//   // fetch all research posts
//   const getAllUser = async (pageNumber = 1) => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get(
//         `${API_PATHS.POSTS.GET_ALL_USERS}?scope=${scope}`, {
//         params: {
//           status: filterStatus.toLowerCase(),
//           page: pageNumber,
//         },
//         headers: {
//             Authorization: `Bearer ${await getToken()}`,
//           }, 
//       });

//       const { users, totalPages, counts } = response.data;

//       setResearchPostList((prevUsers) =>
//         pageNumber === 1 ? users : [...prevUsers, ...users]
//       );
//       setTotalPages(totalPages);
//       setPage(pageNumber);

//       // Map statusSummary data with fixed labels and order
//       const statusSummary = counts || {};

//       const statusArray = [
//         { label: "Requests", count: statusSummary.requests || 0 },
//         { label: "All Students", count: statusSummary.all || 0 },
//       ];

//       setTabs(statusArray);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//       getAllUser();
  
//       return () => {};
//     }, [scope]);

//   // acceot user request
//   const acceptUserRequest = async (userId) => {
//     try {
//       await axios.delete(API_PATHS.POSTS.ACCEPT_REQUEST(userId),
//         {
//           headers: {
//             Authorization: `Bearer ${await getToken()}`,
//           },
//         });

//       toast.success("User request accept Successfully");
//     //   setOpenDeleteAlert({
//     //     open: false,
//     //     data: null,
//     //   });
//       getAllUser();
//     } catch (error) {
//       console.error("Error accepting user request:", error);
//     }
//   };

//   // delete user request
//   const deleteUserRequest = async (userId) => {
//     try {
//       await axios.delete(API_PATHS.POSTS.DELETE_REQUEST(userId),
//         {
//           headers: {
//             Authorization: `Bearer ${await getToken()}`,
//           },
//         });

//       toast.success("User request Deleted Successfully");
//       setOpenDeleteAlert({
//         open: false,
//         data: null,
//       });
//       getAllUser();
//     } catch (error) {
//       console.error("Error deleting user request:", error);
//     }
//   };

//   // Load more posts
//   const handleLoadMore = () => {
//     if (page < totalPages) {
//       getAllUser(page + 1);
//     }
//   };

//   useEffect(() => {
//     getAllUser(1);
//     return () => {};
//   }, [filterStatus]);
//   return (
//     <DashboardLayout activeMenu="Students">
//       <div className="w-auto sm:max-w-[900px] mx-auto">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-semibold mt-5 mb-5">Students</h2>

//           {/* <button
//             className="btn-small"
//             onClick={() => navigate("/admin/create")}
//           >
//             <LuPlus className="text-[18px]" /> Create Post
//           </button> */}
//         </div>

//         <div className="flex justify-between items-center">
//         <Tabs
//           tabs={tabs}
//           activeTab={filterStatus}
//           setActiveTab={setFilterStatus}
//         />

//         {/* Only superadmin sees toggle */}
//           {/* {clerkUserRole === "superadmin" && (
//             <div className="flex items-center gap-2">
//               <label className="text-sm font-medium text-gray-600">
//                 View:
//               </label>
//               <select
//                 value={scope}
//                 onChange={(e) => setScope(e.target.value)}
//                 className="border border-gray-300 rounded-lg text-sm px-2 py-1"
//               >
//                 <option value="me">My Data</option>
//                 <option value="all">All Users</option>
//               </select>
//             </div>
//           )} */}
//         </div>

//         <div className="mt-5">
//           {/* {researchPostList.map((post) => (
//             <ResearchPostSummaryCard
//               key={post._id}
//               title={post.title}
//               imgUrl={post.coverImageUrl}
//               updatedOn={
//                 post.updatedAt
//                   ? moment(post.updatedAt).format("Do MMM YYYY")
//                   : "-"
//               }
//               tags={post.tags}
//               likes={post.likes}
//               views={post.views}
//               onClick={() => navigate(`/admin/edit/${post.slug}`)}
//               onDelete={() =>
//                 setOpenDeleteAlert({ open: true, data: post._id })
//               }
//             />
//           ))} */}

//           {page < totalPages && (
//             <div className="flex items-center justify-center mb-8">
//               <button
//                 className="flex items-center gap-3 text-sm text-white font-medium bg-black px-7 py-2.5 rounded-full text-nowrap hover:scale-105 transition-all cursor-pointer"
//                 disabled={isLoading}
//                 onClick={handleLoadMore}
//               >
//                 {isLoading ? (
//                   <LuLoaderCircle className="animate-spin text-[15px]" />
//                 ) : (
//                   <LuGalleryVerticalEnd className="text-lg" />
//                 )}{" "}
//                 {isLoading ? "Loading..." : "Load More"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>


//       <Modal
//         isOpen={openDeleteAlert?.open}
//         onClose={() => {
//           setOpenDeleteAlert({ open: false, data: null });
//         }}
//         title="Delete Alert"
//       >
//         <div className="w-[70vw] md:w-[30vw]">
//           <DeleteAlertContent
//             content="Are you sure you want to delete this student request?"
//             onDelete={() => deletePost(openDeleteAlert.data)}
//           />
//         </div>
//       </Modal>
//     </DashboardLayout>
//   )
// }
// export default Students



import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuGalleryVerticalEnd,
  LuLoaderCircle,
  LuPlus,
  LuUser,
  LuCheck,
  LuX,
} from "react-icons/lu";
import toast from "react-hot-toast";
import moment from "moment";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/Modal";
import Tabs from "../../components/Tabs";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import { API_PATHS } from "../../utils/apiPaths";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { UserContext } from "../../context/userContext";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "";

const ENDPOINTS = {
  JOIN_REQUESTS: "/api/join-requests",
  USERS: "/api/users", // optional if you have an endpoint for listing users
};

const Students = () => {
  const { user, clerkUserRole } = useContext(UserContext);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // UI state
  const [tabs, setTabs] = useState([
    { label: "Requests", count: 0 },
    { label: "All Students", count: 0 },
  ]);
  const [activeTab, setActiveTab] = useState("requests"); // "requests" | "all"
  const [scope, setScope] = useState("me"); // "me" | "all" (if you want)
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Data
  const [requestsList, setRequestsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  // Modal: reject message
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestToReject, setSelectedRequestToReject] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");

  // Simple "confirm delete" modal for requests (reuse)
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  // Fetch requests
  const fetchJoinRequests = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const res = await axios.get(`${API_PATHS.AUTH.JOIN_REQUESTS}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNumber },
      });

      const requests = res.data?.requests || [];
      setRequestsList((prev) => (pageNumber === 1 ? requests : [...prev, ...requests]));
      // update counts & pagination if provided
      setPage(pageNumber);
      setTotalPages(res.data?.totalPages || 1);

      // populate tab counts if backend gives counts
      const counts = res.data?.counts || {};
      setTabs([
        { label: "Requests", count: counts.requests ?? requests.length },
        { label: "All Students", count: counts.all ?? null },
      ]);
    } catch (err) {
      console.error("fetchJoinRequests error:", err);
      toast.error("Failed to load join requests");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all users (students)
  const fetchAllStudents = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const token = await getToken();

      // If you have a specific users endpoint, use it (with scope)
      const res = await axios.get(`${ENDPOINTS.USERS}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { scope, page: pageNumber, status: activeTab }, // adapt if needed
      });

      const users = res.data?.users || [];
      setStudentsList((prev) => (pageNumber === 1 ? users : [...prev, ...users]));
      setPage(pageNumber);
      setTotalPages(res.data?.totalPages || 1);

      // update counts if provided
      const counts = res.data?.counts || {};
      setTabs([
        { label: "Requests", count: counts.requests ?? null },
        { label: "All Students", count: counts.all ?? users.length },
      ]);
    } catch (err) {
      console.error("fetchAllStudents error:", err);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  // unified loader depending on active tab
  const loadData = async (pageNumber = 1) => {
    if (activeTab === "requests") {
      await fetchJoinRequests(pageNumber);
    } else {
      await fetchAllStudents(pageNumber);
    }
  };

  useEffect(() => {
    // whenever tab or scope changes, reset page and load
    setPage(1);
    setTotalPages(1);
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, scope]);

  // Accept a request -> promote user role to "admin"
  const acceptUserRequest = async (requestId) => {
    try {
      setIsLoading(true);
      const token = await getToken();
      await axios.put(
        `${API_PATHS.AUTH.JOIN_REQUESTS}/accept/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Request accepted — user promoted to admin");
      // reload requests
      loadData(1);
    } catch (err) {
      console.error("acceptUserRequest error:", err);
      toast.error("Failed to accept request");
    } finally {
      setIsLoading(false);
    }
  };

  // Open reject modal
  const openRejectModal = (request) => {
    setSelectedRequestToReject(request);
    setRejectMessage("");
    setRejectModalOpen(true);
  };

  // Reject a request with optional message (sent to user)
  const rejectUserRequest = async () => {
    if (!selectedRequestToReject) return;
    try {
      setIsLoading(true);
      const token = await getToken();
      await axios.put(
        `${API_PATHS.AUTH.JOIN_REQUESTS}/reject/${selectedRequestToReject._id}`,
        { message: rejectMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Request rejected");
      setRejectModalOpen(false);
      setSelectedRequestToReject(null);
      loadData(1);
    } catch (err) {
      console.error("rejectUserRequest error:", err);
      toast.error("Failed to reject request");
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: remove request (delete)
  const deleteRequest = async (requestId) => {
    try {
      setIsLoading(true);
      const token = await getToken();
      await axios.delete(`${API_PATHS.AUTH.JOIN_REQUESTS}/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Request deleted");
      setConfirmModal({ open: false, id: null });
      loadData(1);
    } catch (err) {
      console.error("deleteRequest error:", err);
      toast.error("Failed to delete request");
    } finally {
      setIsLoading(false);
    }
  };

  // Load more (pagination)
  const handleLoadMore = () => {
    if (page < totalPages) {
      loadData(page + 1);
    }
  };

  return (
    <DashboardLayout activeMenu="Students">
      <div className="w-auto sm:max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mt-5 mb-5">Students</h2>

          <div className="flex items-center gap-3">
            {/* if you want to add create button */}
            {/* <button className="btn-small" onClick={() => navigate("/admin/create")}>
              <LuPlus className="text-[18px]" /> Create Post
            </button> */}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* scope selector (optional) */}
          {clerkUserRole === "superadmin" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">View:</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="border border-gray-300 rounded-lg text-sm px-2 py-1"
              >
                <option value="me">My Data</option>
                <option value="all">All Users</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-5">
          {/* ---------- Requests Tab ---------- */}
          {activeTab === "requests" && (
            <>
              {requestsList.length === 0 && !isLoading && (
                <div className="text-center py-16 text-gray-500">
                  No join requests found.
                </div>
              )}

              <div className="space-y-4">
                {requestsList.map((req) => (
                  <div
                    key={req._id}
                    className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <LuUser className="text-xl" />
                        <div>
                          <div className="font-semibold">{req.name || req.username || req.email}</div>
                          <div className="text-sm text-gray-500">
                            {req.email} • {moment(req.createdAt).fromNow()}
                          </div>
                        </div>
                      </div>

                      {req.message && (
                        <p className="mt-3 text-sm text-gray-700">{req.message}</p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button
                        onClick={() => acceptUserRequest(req._id)}
                        className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg"
                        disabled={isLoading}
                      >
                        <LuCheck /> Accept
                      </button>

                      <button
                        onClick={() => openRejectModal(req)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
                        disabled={isLoading}
                      >
                        <LuX /> Reject
                      </button>

                      <button
                        onClick={() => setConfirmModal({ open: true, id: req._id })}
                        className="px-3 py-2 border rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {page < totalPages && (
                <div className="flex items-center justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    className="flex items-center gap-3 text-sm text-white font-medium bg-black px-7 py-2.5 rounded-full hover:scale-105 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? <LuLoaderCircle className="animate-spin" /> : <LuGalleryVerticalEnd />}
                    {isLoading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ---------- All Students Tab ---------- */}
          {activeTab === "all" && (
            <>
              {studentsList.length === 0 && !isLoading && (
                <div className="text-center py-16 text-gray-500">No students found.</div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {studentsList.map((stu) => (
                  <div key={stu._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{stu.username || stu.name || stu.email}</div>
                        <div className="text-sm text-gray-500">
                          {stu.email} • Role: <span className="font-medium">{stu.role}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Joined: {moment(stu.createdAt).format("Do MMM YYYY")}
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/user/${stu._id}`)}
                        className="px-3 py-1 border rounded-lg text-sm"
                      >
                        View
                      </button>

                      {stu.role !== "admin" && (
                        <button
                          onClick={() => {
                            // quick promote option (if allowed)
                            acceptUserRequest(stu._id);
                          }}
                          className="px-3 py-1 bg-green-700 text-white rounded-lg text-sm"
                        >
                          Promote to Admin
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {page < totalPages && (
                <div className="flex items-center justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    className="flex items-center gap-3 text-sm text-white font-medium bg-black px-7 py-2.5 rounded-full hover:scale-105 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? <LuLoaderCircle className="animate-spin" /> : <LuGalleryVerticalEnd />}
                    {isLoading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reject modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequestToReject(null);
        }}
        title="Reject Join Request"
      >
        <div className="w-[95%] md:w-[28rem]">
          <p className="mb-3 text-sm text-gray-600">
            Optionally write a message to the requester explaining why the request is rejected.
            This message will be sent to the user (if your backend supports sending messages).
          </p>

          <textarea
            rows={5}
            className="w-full border rounded-lg px-3 py-2"
            value={rejectMessage}
            onChange={(e) => setRejectMessage(e.target.value)}
            placeholder="Write a message (optional)"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setRejectModalOpen(false);
                setSelectedRequestToReject(null);
              }}
              className="px-3 py-1 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={rejectUserRequest}
              className="px-4 py-1 bg-red-600 text-white rounded-lg"
              disabled={isLoading}
            >
              Reject
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm delete modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null })}
        title="Delete Request"
      >
        <div className="w-[95%] md:w-[28rem]">
          <p className="mb-3">Are you sure you want to delete this request?</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmModal({ open: false, id: null })}
              className="px-3 py-1 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteRequest(confirmModal.id)}
              className="px-4 py-1 bg-black text-white rounded-lg"
              disabled={isLoading}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Students;
