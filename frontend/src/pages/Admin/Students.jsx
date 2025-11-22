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
import DashboardLayout from "../../components/Layout/DashboardLayout";
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
  ALL_USERS: "/api/all-users", // optional if you have an endpoint for listing users
};

const Students = () => {
  const { user, clerkUserRole } = useContext(UserContext);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // UI state
  const [tabs, setTabs] = useState([
    { label: "Requests", value: "requests", count: 0 },
    { label: "Accepted", value: "accepted", count: 0 },
    { label: "All Students", value: "all", count: 0 },
    ]);
  const [activeTab, setActiveTab] = useState("Requests"); // "requests" | "all"
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

    const fetchJoinRequests = async (pageNumber = 1, status = "pending") => {
        try {
            setIsLoading(true);
            const token = await getToken();

            const res = await axios.get(API_PATHS.AUTH.JOIN_REQUESTS, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: pageNumber, status },
            });

            const type = res.data?.type;

            if (type === "requests") {
            const requests = res.data?.requests || [];
            setRequestsList((prev) =>
                pageNumber === 1 ? requests : [...prev, ...requests]
            );
            }

            if (type === "users") {
            const users = res.data?.users || [];
            setStudentsList((prev) =>
                pageNumber === 1 ? users : [...prev, ...users]
            );
            }

            const counts = res.data?.counts || {};

            setTabs([
            { label: "Requests", value: "requests", count: counts.pending ?? 0 },
            { label: "Accepted", value: "accepted", count: counts.accepted ?? 0 },
            { label: "All Students", value: "all", count: counts.users ?? 0 },
            ]);

        } catch (err) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
        };


    const loadData = async (pageNumber = 1) => {
        if (activeTab === "Requests") {
            await fetchJoinRequests(pageNumber, "pending");
        } else if (activeTab === "Accepted") {
            await fetchJoinRequests(pageNumber, "accepted");
        } else if (activeTab === "All Students") {
            await fetchJoinRequests(pageNumber, "all"); // VERY IMPORTANT
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

  const promoteUser = async (userId) => {
  try {
    const token = await getToken();
    await axios.put(`${API_PATHS.AUTH.GET_USER_CLERK}/${userId}/promote`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("User promoted to Admin");
    fetchStudents();  // refresh list
  } catch (err) {
    toast.error("Failed to promote user");
  }
};

const demoteUser = async (userId) => {
  try {
    const token = await getToken();
    await axios.put(`${API_PATHS.AUTH.GET_USER_CLERK}/${userId}/demote`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("User demoted to Member");
    fetchStudents();  // refresh list
  } catch (err) {
    toast.error("Failed to demote user");
  }
};


  return (
    <DashboardLayout activeMenu="Students">
      <div className="w-auto sm:max-w-[1000px] mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mt-5 mb-5">Students</h2>
        </div>

        <div className="flex justify-between items-center">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* scope selector (optional) */}
          {/* {clerkUserRole === "superadmin" && (
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
          )} */}
        </div>

        <div className="mt-5">
          {/* ---------- Requests Tab ---------- */}
          {activeTab === "Requests" && (
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
                        {/* <LuUser className="text-xl" /> */}
                        <img src={req.userId.image} alt="user image" className="w-28 h-28 rounded-lg object-cover" />
                        <div>
                          <div className="font-semibold">{req.name || req.userId.username || req.userId.email}</div>
                          <div className="text-sm text-gray-500">
                            {req.userId.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {moment(req.createdAt).fromNow()}
                          </div>
                          {req.message && (
                            <p className="mt-3 text-sm text-gray-700">{req.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button
                        onClick={() => acceptUserRequest(req._id)}
                        className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                        disabled={isLoading}
                      >
                        <LuCheck /> Accept
                      </button>

                      <button
                        onClick={() => openRejectModal(req)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                        disabled={isLoading}
                      >
                        <LuX /> Reject
                      </button>

                      <button
                        onClick={() => setConfirmModal({ open: true, id: req._id })}
                        className="px-3 py-2 border rounded-lg text-sm cursor-pointer"
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

        {/* ---------- Accepted Tab ---------- */}
        {activeTab === "Accepted" && (
        <>
            {requestsList.length === 0 && !isLoading && (
            <div className="text-center py-16 text-gray-500">
                No accepted students found.
            </div>
            )}

            <div className="space-y-4">
            {requestsList.map((req) => (
                <div key={req._id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                    {/* <LuUser className="text-xl" /> */}
                    <img src={req.userId.image} alt="user image" className="w-28 h-28 rounded-lg object-cover" />
                    <div>
                    <div className="font-semibold">
                        {req.userId?.username || req.userId?.email}
                    </div>
                    <div className="text-sm text-gray-500">
                        {req.userId?.email}
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                        Accepted {moment(req.updatedAt).fromNow()}
                    </p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </>
        )}


          {/* ---------- All Students Tab ---------- */}
          {activeTab === "All Students" && (
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
                          {stu.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          Role: <span className="font-medium">{stu.role.charAt(0).toUpperCase() + stu.role.slice(1).toLowerCase()}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Joined: {moment(stu.createdAt).format("Do MMM YYYY")}
                      </div>
                    </div>

                    {/* <div className="mt-3 flex gap-2">
                      {stu.role !== "admin" && (
                        <button
                          onClick={() => {
                            acceptUserRequest(stu._id);
                          }}
                          className="px-3 py-1 bg-green-700 text-white rounded-lg text-sm"
                        >
                          Promote to Admin
                        </button>
                      )}
                    </div> */}

                    <div className="flex gap-2 mt-3">
                      {stu.role === "member" && (
                        <button
                          className="px-3 py-2 bg-green-600 text-white rounded-lg cursor-pointer"
                          onClick={() => promoteUser(stu._id)}
                        >
                          Promote to Admin
                        </button>
                      )}

                      {stu.role === "admin" && (
                        <button
                          className="px-3 py-2 bg-yellow-600 text-white rounded-lg cursor-pointer"
                          onClick={() => demoteUser(stu._id)}
                        >
                          Demote to Member
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
        <div className="w-[95%] md:w-[28rem] p-5">
          <p className="mb-3 text-sm text-gray-600">
            Optionally write a message to the requester explaining why the request is rejected.
            This message will be sent to the user.
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
        <div className="w-[95%] md:w-[28rem] p-5">
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