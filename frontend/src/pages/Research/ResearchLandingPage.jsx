import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { LuGalleryVerticalEnd, LuLoaderCircle } from "react-icons/lu";
import ResearchLayout from "../../components/Layout/ResearchLayout/ResearchLayout.jsx"
// import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import FeaturedResearchPost from "./components/FeaturedResearchPost";
import ResearchPostSummaryCard from "./components/ResearchPostSummaryCard";
import TrendingPostsSection from "./components/TrendingPostsSection";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const ResearchLandingPage = () => {
  const navigate = useNavigate();

  const [researchPostList, setResearchPostList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch paginated posts
  const getAllPosts = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_PATHS.POSTS.GET_ALL, {
        params: {
          status: "published",
          page: pageNumber,
        },
      });

      const { posts, totalPages } = response.data;

      setResearchPostList((prevPosts) =>
        pageNumber === 1 ? posts : [...prevPosts, ...posts]
      );

      setTotalPages(totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more posts
  const handleLoadMore = () => {
    if (page < totalPages) {
      getAllPosts(page + 1);
    }
  };

  // Initial load
  useEffect(() => {
    getAllPosts(1);
  }, []);

  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };

  return (
    <ResearchLayout>
        <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-9">
          {researchPostList.length > 0 && (
            <FeaturedResearchPost
              title={researchPostList[0].title}
              coverImageUrl={researchPostList[0].coverImageUrl}
              description={researchPostList[0].content}
              tags={researchPostList[0].tags}
              updatedOn={
                researchPostList[0].updatedAt
                  ? moment(researchPostList[0].updatedAt).format("Do MMM YYYY")
                  : "-"
              }
              authorName={researchPostList[0].author.username}
              authProfileImg={researchPostList[0].author.image}
              onClick={() => handleClick(researchPostList[0])}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {researchPostList.length > 0 &&
              researchPostList
                .slice(1)
                .map((item) => (
                  <ResearchPostSummaryCard
                    key={item._id}
                    title={item.title}
                    coverImageUrl={item.coverImageUrl}
                    description={item.content}
                    tags={item.tags}
                    updatedOn={
                      item.updatedAt
                        ? moment(item.updatedAt).format("Do MMM YYYY")
                        : "-"
                    }
                    authorName={item.author.username}
                    authProfileImg={item.author.image}
                    onClick={() => handleClick(item)}
                  />
                ))}
          </div>

          {page < totalPages && (
            <div className="flex items-center justify-center mt-5">
              <button
                className="flex items-center gap-3 text-sm text-white font-medium bg-black px-7 py-2.5 mt-6 rounded-full text-nowrap hover:scale-105 transition-all cursor-pointer"
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

        <div className="col-span-12 md:col-span-3">
          <TrendingPostsSection />
        </div>
      </div>
    </ResearchLayout>
  )
}
export default ResearchLandingPage