import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { LuChartLine, LuCheckCheck, LuGalleryVerticalEnd, LuHeart } from "react-icons/lu";
import DashboardSummaryCard from "../../components/Cards/DashboardSummaryCard";
import TagInsights from "../../components/Cards/TagInsights";
import TopPostCard from "../../components/Cards/TopPostCard";
import RecentCommentsList from "../../components/Cards/RecentCommentsList";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const { user, clerkUserRole } = useContext(UserContext);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [maxViews, setMaxViews] = useState(0);
  const [scope, setScope] = useState("me"); // "me" | "all"

  const getDashboardData = async () => {
    try {
      const response = await axios.get(
        `${API_PATHS.DASHBOARD.GET_DASHBOARD_DATA}?scope=${scope}`,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (response.data) {
        setDashboardData(response.data);

        const topPosts = response.data?.topPosts || [];
        const totalViews = Math.max(...topPosts.map((p) => p.views), 1);
        setMaxViews(totalViews);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getDashboardData();

    return () => {};
  }, [scope]);
  
  return (
    // <div className="relative inline-flex flex-col w-full items-center mt-14 sm:mt-16 px-6 md:px-16 lg-px-24 xl:px-32 text-black bg-[url('/src/assets/gradientBackground.png')] bg-no-repeat bg-cover min-h-screen my-12 sm:my-16">
    //   Dashboard
    // </div>

    <DashboardLayout activeMenu="Dashboard">
      {/* {dashboardData && (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 mt-5">
            <div>
              <div className="col-span-3">
                <h2 className="text-xl md:text-2xl font-medium">
                  Good Morning! {user.fullName}
                </h2>
                <p className="text-xs md:text-[13px] font-medium text-gray-400 mt-1.5">
                  {moment().format("dddd MMM YYYY")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
              <DashboardSummaryCard
                icon={<LuGalleryVerticalEnd />}
                label="Total Posts"
                value={dashboardData?.stats?.totalPosts || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuCheckCheck />}
                label="Published"
                value={dashboardData?.stats?.published || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuChartLine />}
                label="Total Views"
                value={dashboardData?.stats?.totalViews || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuHeart />}
                label="Total Likes"
                value={dashboardData?.stats?.totalLikes || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 md:my-6">
            <div className="col-span-12 md:col-span-7 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Tag Insights</h5>
              </div>

              <TagInsights tagUsage={dashboardData?.tagUsage || []} />
            </div>

            <div className="col-span-12 md:col-span-5 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Top Posts</h5>
              </div>

               {dashboardData?.topPosts?.slice(0,3)?.map((post) => (
                <TopPostCard
                  key={post._id}
                  title={post.title}
                  coverImageUrl={post.coverImageUrl}
                  views={post.views}
                  likes={post.likes}
                  maxViews={maxViews}
                />
              ))}
            </div>

            <div className="col-span-12 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Recent Comments</h5>
              </div>

              <RecentCommentsList
                comments={dashboardData.recentComments || []}
              />
            </div>
          </div>
        </>
      )} */}


      {/* New */}
      <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 mt-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-medium">
              Good Morning! {user.fullName}
            </h2>
            <p className="text-xs md:text-[13px] font-medium text-gray-400 mt-1.5">
              {moment().format("dddd MMM YYYY")}
            </p>
          </div>

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

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
              <DashboardSummaryCard
                icon={<LuGalleryVerticalEnd />}
                label="Total Posts"
                value={dashboardData?.stats?.totalPosts || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuCheckCheck />}
                label="Published"
                value={dashboardData?.stats?.published || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuChartLine />}
                label="Total Views"
                value={dashboardData?.stats?.totalViews || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuHeart />}
                label="Total Likes"
                value={dashboardData?.stats?.totalLikes || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />
            </div>
      </div>

      {dashboardData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 md:my-6">
            <div className="col-span-12 md:col-span-7 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Tag Insights</h5>
              </div>

              <TagInsights tagUsage={dashboardData?.tagUsage || []} />
            </div>

            <div className="col-span-12 md:col-span-5 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Top Posts</h5>
              </div>

               {dashboardData?.topPosts?.slice(0,3)?.map((post) => (
                <TopPostCard
                  key={post._id}
                  title={post.title}
                  coverImageUrl={post.coverImageUrl}
                  views={post.views}
                  likes={post.likes}
                  maxViews={maxViews}
                />
              ))}
            </div>

            <div className="col-span-12 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Recent Comments</h5>
              </div>

              <RecentCommentsList
                comments={dashboardData.recentComments || []}
              />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
export default Dashboard