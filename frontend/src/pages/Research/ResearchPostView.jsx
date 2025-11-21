import React, { useContext, useEffect, useState } from 'react'
import axios from "axios";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { LuCircleAlert, LuDot, LuSparkles } from "react-icons/lu";
import { UserContext } from "../../context/userContext";
import CommentReplyInput from "../../components/Inputs/CommentReplyInput";
import toast from "react-hot-toast";
import TrendingPostsSection from "./components/TrendingPostsSection";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import { useNavigate, useParams } from 'react-router-dom';
import ResearchLayout from '../../components/layouts/ResearchLayout/ResearchLayout';
import MarkdownContent from './components/MarkdownContent';
import SharePost from './components/SharePost';
import { sanitizeMarkdown } from '../../utils/helper';
import CommentInfoCard from './components/CommentInfoCard';
import Drawer from '../../components/Drawer';
import LikeCommentButton from './components/LikeCommentButton';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const ResearchPostView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getToken  } = useAuth();
  const { openSignIn } = useClerk();

  const [researchPostData, setResearchPostData] = useState(null);
  const [comments, setComments] = useState(null);

  const { user, setOpenAuthForm } = useContext(UserContext);

  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const [openSummarizeDrawer, setOpenSummarizeDrawer] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Image popup states
  const [selectedImage, setSelectedImage] = useState(null);


  // Get Post Data By slug
  const fetchPostDetailsBySlug = async () => {
    try {
      const response = await axios.get(
        API_PATHS.POSTS.GET_BY_SLUG(slug)
      );

      if (response.data) {
        const data = response.data;
        console.log("Research Post Data:", data);
        setResearchPostData(data);
        fetchCommentByPostId(data._id);
        incrementViews(data._id);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Get Comment by Post ID
  const fetchCommentByPostId = async (postId) => {
    try {
      const response = await axios.get(
        API_PATHS.COMMENTS.GET_ALL_BY_POST(postId)
      );

      if (response.data) {
        const data = response.data;
        setComments(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Generate Research Post Summary
  const generateResearchPostSummary = async () => {
   try {
      setErrorMsg("");
      setSummaryContent(null);

      setIsLoading(true);
      setOpenSummarizeDrawer(true);

      const response = await axios.post(
        API_PATHS.AI.GENERATE_POST_SUMMARY,
        {
          content: researchPostData.content || "",
        }
      );

      if (response.data) {
        setSummaryContent(response.data);
      }
    } catch (error) {
      setSummaryContent(null);
      setErrorMsg("Failed to generate summary, Try again later");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Increment views
  const incrementViews = async (postId) => {
    if (!postId) return;

    try {
      const response = await axios.post(
        API_PATHS.POSTS.INCREMENT_VIEW(postId)
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //  Handles canceling a reply
  const handleCancelReply = () => {
    setReplyText("");
    setShowReplyForm(false);
  };

  // Add Reply
  const handleAddReply = async () => {
    try {
      const response = await axios.post(
        API_PATHS.COMMENTS.ADD(researchPostData._id),
        {
          content: replyText,
          parentComment: "",
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      toast.success("Reply added successfully!");

      setReplyText("");
      setShowReplyForm(false);
      fetchCommentByPostId(researchPostData._id);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  useEffect(() => {
    fetchPostDetailsBySlug();
    return () => {};
  }, [slug]);

  return (
    // <div className="w-full items-center mt-14 sm:mt-16 text-black bg-[url('/src/assets/gradientBackground.png')] bg-no-repeat bg-cover min-h-screen my-12 sm:my-16">
    //   ResearchPostView
    // </div>

    <ResearchLayout>
      {researchPostData && (
        <>
          <title>{researchPostData.title}</title>

          <meta name="description" content={researchPostData.title} />
          <meta property="og:title" content={researchPostData.title} />
          <meta property="og:image" content={researchPostData.coverImageUrl} />
          <meta property="og:type" content="article" />

          <div className="grid grid-cols-12 gap-8 relative">
            <div className="col-span-12 md:col-span-8 relative">
              <h1 className="text-lg md:text-2xl font-bold mb-2 line-clamp-3">
                {researchPostData.title}
              </h1>

              <div className="flex items-center gap-1 flex-wrap mt-3 mb-5">
                <span className="text-[13px] text-gray-500 font-medium">
                  {moment(researchPostData.updatedAt || "").format("Do MMM YYYY")}
                </span>

                <LuDot className="text-xl text-gray-400" />

                <div className="flex items-center flex-wrap gap-2">
                  {researchPostData.tags.slice(0, 3).map((tag, index) => (
                    <button
                      key={index}
                      className="bg-sky-200/50 text-sky-800/80 text-xs font-medium px-3 py-0.5 rounded-full text-nowrap cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tag/${tag}`);
                      }}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>

                <LuDot className="text-xl text-gray-400" />

                <button
                  className="flex items-center gap-2 bg-linear-to-r from-sky-500 to-cyan-400 text-xs text-white font-medium px-3 py-0.5 rounded-full text-nowrap cursor-pointer hover:scale-[1.02] transition-all my-1"
                  onClick={generateResearchPostSummary}
                >
                  <LuSparkles /> Summarize Post
                </button>
              </div>

              <img
                src={researchPostData.coverImageUrl || ""}
                alt={researchPostData.title}
                className="w-full h-96 object-cover mb-6 rounded-lg"
              />

              <div>
                <MarkdownContent
                  content={sanitizeMarkdown(researchPostData?.content || "")}
                />

              {/* ---------- Additional Images Section ---------- */}
              {researchPostData.images && researchPostData.images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Research Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {researchPostData.images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage(imgUrl)}
                      >
                        <img
                          src={imgUrl}
                          alt={`Research Image ${index + 1}`}
                          className="w-full h-56 object-cover rounded-lg border hover:scale-[1.03] transition-all"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center text-white text-sm font-medium">
                          View Full
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}



                {/* ---------- PDF Viewer Section ---------- */}
                {researchPostData.documentUrl && researchPostData.documentUrl.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-lg font-semibold mb-3">Research Documents (PDF)</h3>
                    <div className="space-y-6">
                        <div
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">
                              PDF File
                            </p>
                            {/* <button
                              onClick={() => window.open(researchPostData.documentUrl, "_blank")}
                              className="text-xs bg-sky-600 text-white px-3 py-1 rounded-full hover:bg-sky-700 transition-all"
                            >
                              Open
                            </button> */}
                            <a
                              href={researchPostData.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-sky-600 text-white px-3 py-1 rounded-full hover:bg-sky-700 transition-all"
                            >
                              Open
                            </a>
                          </div>

                          {/* <iframe
                            src={researchPostData.documentUrl}
                            title={`PDF`}
                            className="w-full h-96 border rounded-lg"
                          ></iframe> */}

                          <iframe
                            src={`${researchPostData.documentUrl}#toolbar=0`}
                            title={`PDF`}
                            className="w-full h-96 border rounded-lg"
                          ></iframe>
                        </div>
                    </div>
                  </div>
                )}

                {/* {researchPostData.documentUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Attached Document</h3>
                    <iframe
                      src={`${researchPostData.documentUrl}#toolbar=0`}
                      width="100%"
                      height="600px"
                      title="Research PDF"
                      className="border rounded-md"
                    />
                  </div>
                )} */}


                <SharePost title={researchPostData.title} />

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Comments</h4>

                    <button
                      className="flex items-center justify-center gap-3 bg-linear-to-r from-sky-500 to-cyan-400 text-xs font-semibold text-white px-5 py-2 rounded-full hover:bg-black hover:text-white cursor-pointer"
                      onClick={() => {
                        if (!user) {
                          openSignIn();
                          setOpenAuthForm(true);
                          return;
                        }
                        setShowReplyForm(true);
                      }}
                    >
                      Add Comment
                    </button>
                  </div>

                  {showReplyForm && (
                    <div className="bg-white pt-1 pb-5 pr-8 rounded-lg mb-8">
                      <CommentReplyInput
                        user={user}
                        authorName={user.fullname}
                        content={""}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        handleAddReply={handleAddReply}
                        handleCancelReply={handleCancelReply}
                        disableAutoGen
                        type="new"
                      />
                    </div>
                  )}


                  {comments?.length > 0 &&
                    comments.map((comment) => (
                      <CommentInfoCard
                        key={comment._id}
                        commentId={comment._id || null}
                        authorName={comment.author.username}
                        authorPhoto={comment.author.image}
                        content={comment.content}
                        updatedOn={
                          comment.updatedAt
                            ? moment(comment.updatedAt).format("Do MMM YYYY")
                            : "-"
                        }
                        post={comment.post}
                        replies={comment.replies || []}
                        getAllComments={() =>
                          fetchCommentByPostId(researchPostData._id)
                        }
                        onDelete={(commentId) =>
                          setOpenDeleteAlert({
                            open: true,
                            data: commentId || comment._id,
                          })
                        }
                      />
                    ))}

                </div>

              </div>

              <LikeCommentButton
                postId={researchPostData._id || ""}
                likes={researchPostData.likes || 0}
                comments={comments?.length || 0}
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <TrendingPostsSection />
            </div>
          </div>

          <Drawer
            isOpen={openSummarizeDrawer}
            onClose={() => setOpenSummarizeDrawer(false)}
            title={!isLoading && summaryContent?.title}
          >
            {errorMsg && (
              <p className="flex gap-2 text-sm text-amber-600 font-medium">
                <LuCircleAlert className="mt-1" /> {errorMsg}
              </p>
            )}
            {isLoading && <SkeletonLoader />}
            {!isLoading && summaryContent && (
              <MarkdownContent content={summaryContent?.summary || ""} />
            )}
          </Drawer>
        </>
      )}

      {/* ---------- Image Popup Viewer ---------- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)} // close when clicking outside
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()} // prevent close when clicking on image
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-gray-300"
            >
              ✕
            </button>

            <img
              src={selectedImage}
              alt="Full View"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

    </ResearchLayout>
  )
}
export default ResearchPostView