import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuGalleryVerticalEnd, LuLoaderCircle, LuPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import moment from "moment";
import DashboardLayout from "../../components/layouts/DashboardLayout";

// import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Modal from "../../components/Modal";
import Tabs from "../../components/Tabs";
import ResearchPostSummaryCard from "../../components/Cards/ResearchPostSummaryCard";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { UserContext } from "../../context/userContext";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const ResearchPost = () => {
  const { user, clerkUserRole } = useContext(UserContext);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [researchPostList, setResearchPostList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scope, setScope] = useState("me"); // "me" | "all"

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  // fetch all research posts
  const getAllPosts = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_PATHS.POSTS.GET_ALL_FOR_DASHBOARD}?scope=${scope}`, {
        params: {
          status: filterStatus.toLowerCase(),
          page: pageNumber,
        },
        headers: {
            Authorization: `Bearer ${await getToken()}`,
          }, 
      });

      const { posts, totalPages, counts } = response.data;

      setResearchPostList((prevPosts) =>
        pageNumber === 1 ? posts : [...prevPosts, ...posts]
      );
      setTotalPages(totalPages);
      setPage(pageNumber);

      // Map statusSummary data with fixed labels and order
      const statusSummary = counts || {};

      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Published", count: statusSummary.published || 0 },
        { label: "Draft", count: statusSummary.draft || 0 },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
      getAllPosts();
  
      return () => {};
    }, [scope]);

  // delete research post
  const deletePost = async (postId) => {
    try {
      await axios.delete(API_PATHS.POSTS.DELETE(postId),
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });

      toast.success("Research Post Deleted Successfully");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      getAllPosts();
    } catch (error) {
      console.error("Error deleting research post:", error);
    }
  };

  // Load more posts
  const handleLoadMore = () => {
    if (page < totalPages) {
      getAllPosts(page + 1);
    }
  };

  useEffect(() => {
    getAllPosts(1);
    return () => {};
  }, [filterStatus]);
  return (
    <DashboardLayout activeMenu="Research Posts">
      <div className="w-auto sm:max-w-[900px] mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mt-5 mb-5">Research Posts</h2>

          <button
            className="btn-small"
            onClick={() => navigate("/admin/create")}
          >
            <LuPlus className="text-[18px]" /> Create Post
          </button>
        </div>

        <div className="flex justify-between items-center">
        <Tabs
          tabs={tabs}
          activeTab={filterStatus}
          setActiveTab={setFilterStatus}
        />

        {/* Only superadmin sees toggle */}
          {clerkUserRole === "superadmin" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">
                View:
              </label>
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
          {researchPostList.map((post) => (
            <ResearchPostSummaryCard
              key={post._id}
              title={post.title}
              imgUrl={post.coverImageUrl}
              updatedOn={
                post.updatedAt
                  ? moment(post.updatedAt).format("Do MMM YYYY")
                  : "-"
              }
              tags={post.tags}
              likes={post.likes}
              views={post.views}
              onClick={() => navigate(`/admin/edit/${post.slug}`)}
              onDelete={() =>
                setOpenDeleteAlert({ open: true, data: post._id })
              }
            />
          ))}

          {page < totalPages && (
            <div className="flex items-center justify-center mb-8">
              <button
                className="flex items-center gap-3 text-sm text-white font-medium bg-black px-7 py-2.5 rounded-full text-nowrap hover:scale-105 transition-all cursor-pointer"
                disabled={isLoading}
                onClick={handleLoadMore}
              >
                {isLoading ? (
                  <LuLoaderCircle className="animate-spin text-[15px]" />
                ) : (
                  <LuGalleryVerticalEnd className="text-lg" />
                )}{" "}
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>


      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null });
        }}
        title="Delete Alert"
      >
        <div className="w-[70vw] md:w-[30vw]">
          <DeleteAlertContent
            content="Are you sure you want to delete this research post?"
            onDelete={() => deletePost(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  )
}
export default ResearchPost