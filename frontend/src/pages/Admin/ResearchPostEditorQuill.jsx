import React, { useEffect, useState, useRef } from "react"; // Added useRef
import { useNavigate, useParams } from "react-router-dom";
import { LuLoaderCircle, LuSave, LuSend, LuSparkles, LuTrash2 } from "react-icons/lu";

// 1. REMOVED MDEditor
// import MDEditor, { commands } from "@uiw/react-md-editor";

// 2. ADDED Quill
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Import Quill styles

import DashboardLayout from "../../components/Layout/DashboardLayout";
// import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import CoverImageSelector from "../../components/Inputs/CoverImageSelector";
import TagInput from "../../components/Inputs/TagInput";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import ResearchPostIdeaCard from "../../components/Cards/ResearchPostIdeaCard";
import Modal from "../../components/Modal";
import GenerateResearchPostForm from "./components/GenerateResearchPostForm";
import uploadImage from "../../utils/uploadImages";
import toast from "react-hot-toast";
import { getToastMessagesByType } from "../../utils/helper";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const ResearchPostEditorQuill = ({ isEdit }) => {
  const navigate = useNavigate();
  const { postSlug = "" } = useParams();

  // 3. ADDED Refs for Quill
  const editorRef = useRef(null); // Ref for the editor's container div
  const quillInstanceRef = useRef(null); // Ref to hold the Quill instance

  const [postData, setPostData] = useState({
    id: "",
    title: "",
    content: "", // This will now store HTML from Quill
    coverImageUrl: "",
    coverPreview: "",
    tags: "",
    isDraft: "",
    generatedByAI: false,
  });

  const [postIdeas, setPostIdeas] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openResearchPostGenForm, setOpenResearchPostGenForm] = useState({
    open: false,
    data: null,
  });
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setPostData((prevData) => ({ ...prevData, [key]: value }));
  };

  // ... (All your existing functions: generatePostIdeas, handlePublish, fetchPostDetailsBySlug, deletePost) ...
  // ... (No changes needed in those functions) ...

  // Generate Research Post Ideas Using AI
  const generatePostIdeas = async () => {
    setIdeaLoading(true);
    try {
      const aiResponse = await axios.post(
        API_PATHS.AI.GENERATE_RESEARCH_POST_IDEAS,
        {
          topics: "React JS, Next JS, Node JS, React UI Components",
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      const generatedIdeas = aiResponse.data;

      if (generatedIdeas?.length > 0) {
        setPostIdeas(generatedIdeas);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally {
      setIdeaLoading(false);
    }
  };

  // Handle Research Post Publish
  const handlePublish = async (isDraft) => {
    let coverImageUrl = "";

    // The content validation now checks the Quill HTML content
    if (!postData.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    // A check for empty Quill content (which is <p><br></p>)
    if (!postData.content.trim() || postData.content === "<p><br></p>") {
      setError("Please enter some content.");
      return;
    }

    if (!isDraft) {
      if (!isEdit && !postData.coverImageUrl) {
        setError("Please select a cover image.");
        return;
      }
      if (isEdit && !postData.coverImageUrl && !postData.coverPreview) {
        setError("Please select a cover image.");
        return;
      }
      if (!postData.tags.length) {
        setError("Please add some tags.");
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      // Check if a new image was uploaded (File type)
      if (postData.coverImageUrl instanceof File) {
        const imgUploadRes = await uploadImage(postData.coverImageUrl);
        coverImageUrl = imgUploadRes.imageUrl || "";
      } else {
        coverImageUrl = postData.coverPreview;
      }

      const reqPayload = {
        title: postData.title,
        content: postData.content, // This is now HTML
        coverImageUrl,
        tags: postData.tags,
        isDraft: isDraft ? true : false,
        generatedByAI: true,
      };

      const response = isEdit
        ? await axios.put(
            API_PATHS.POSTS.UPDATE(postData.id),
            reqPayload,
            {
              headers: {
                Authorization: `Bearer ${await getToken()}`,
              },
            }
          )
        : await axios.post(API_PATHS.POSTS.CREATE, reqPayload,
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
            },
          }
        );

      if (response.data) {
        toast.success(
          getToastMessagesByType(
            isDraft ? "draft" : isEdit ? "edit" : "published"
          )
        );
        navigate("/admin/posts");
      }
    } catch (error) {
      setError("Failed to publish research post. Please try again.");
      console.error("Error publishing research post:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get Post Data By slug
  const fetchPostDetailsBySlug = async () => {
    try {
      const response = await axios.get(
        API_PATHS.POSTS.GET_BY_SLUG(postSlug)
      );

      if (response.data) {
        const data = response.data;

        setPostData((prevState) => ({
          ...prevState,
          id: data._id,
          title: data.title,
          content: data.content, // This will trigger the sync useEffect
          coverPreview: data.coverImageUrl,
          tags: data.tags,
          isDraft: data.isDraft,
          generatedByAI: data.generatedByAI,
        }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Delete Research Post
  const deletePost = async () => {
    try {
      await axios.delete(API_PATHS.POSTS.DELETE(postData.id),
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });

      toast.success("Research Post Deleted Successfully");
      setOpenDeleteAlert(false);
      navigate("/admin/posts");
    } catch (error) {
      console.error("Error deleting Research post:", error);
    }
  };

  // Original useEffect for data fetching
  useEffect(() => {
    if (isEdit) {
      fetchPostDetailsBySlug();
    } else {
      generatePostIdeas();
    }

    return () => {};
  }, [isEdit]); // Keep original dependency

  // 4. ADDED: useEffect to initialize Quill
  useEffect(() => {
    // Only initialize if the ref is current and Quill isn't already initialized
    if (editorRef.current && !quillInstanceRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Start writing your research content here...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            ["link", "image", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });

      // Store the Quill instance in the ref
      quillInstanceRef.current = quill;

      // Set up the listener to update React state (Quill -> React)
      quill.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
          const htmlContent = quill.root.innerHTML;
          // Use functional update to avoid state closure issues
          setPostData((prevData) => ({
            ...prevData,
            content: htmlContent,
          }));
        }
      });
    }

    // Cleanup: prevent memory leaks
    return () => {
      quillInstanceRef.current = null;
    };
  }, []); // Empty dependency array: run only once on mount

  // 5. ADDED: useEffect to sync React state TO Quill (React -> Quill)
  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (!quill) return; // Exit if Quill isn't initialized yet

    const currentQuillContent = quill.root.innerHTML;

    // This handles loading data from fetch or AI generator
    if (postData.content !== currentQuillContent) {
      // Check if the state content is empty (e.g., new post)
      if (postData.content === "") {
        if (currentQuillContent !== "<p><br></p>") {
          quill.setText(""); // Clear the editor
        }
      } else {
        // This is an external change (load or AI gen)
        // It triggers 'text-change' with source='api',
        // preventing the infinite loop.
        quill.clipboard.dangerouslyPasteHTML(postData.content);
      }
    }
  }, [postData.content]); // This hook runs *only* when postData.content changes

  return (
    <DashboardLayout activeMenu="Research Posts">
      <div className="my-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-4">
          <div className="form-card p-6 col-span-12 md:col-span-8">
            {/* ... (Your header, buttons, title input, and cover image selector) ... */}
            {/* ... (No changes needed there) ... */}

            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-medium">
                {!isEdit ? "Add New Post" : "Edit Post"}
              </h2>

              <div className="flex items-center gap-3">
                {isEdit && (
                  <button
                    className="flex items-center gap-2.5 text-[13px] font-medium text-rose-500 bg-rose-50/60 rounded px-1.5 md:px-3 py-1 md:py-[3px] border border-rose-50 hover:border-rose-300 cursor-pointer hover:scale-[1.02] transition-all"
                    disabled={loading}
                    onClick={() => setOpenDeleteAlert(true)}
                  >
                    <LuTrash2 className="text-sm" />{" "}
                    <span className="hidden md:block">Delete</span>
                  </button>
                )}

                <button
                  className="flex items-center gap-2.5 text-[13px] font-medium text-sky-500 bg-sky-50/60 rounded px-1.5 md:px-3 py-1 md:py-[3px] border border-sky-100 hover:border-sky-400 cursor-pointer hover:scale-[1.02] transition-all"
                  disabled={loading}
                  onClick={() => handlePublish(true)}
                >
                  <LuSave className="text-sm" />{" "}
                  <span className="hidden md:block">Save as Draft</span>
                </button>

                <button
                  className="flex items-center gap-2.5 text-[13px] font-medium text-sky-600 hover:text-white hover:bg-linear-to-r hover:from-sky-500 hover:to-indigo-500 rounded px-3 py-[3px] border border-sky-500 hover:border-sky-50 cursor-pointer transition-all"
                  disabled={loading}
                  onClick={() => handlePublish(false)}
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin text-[15px]" />
                  ) : (
                    <LuSend className="text-sm" />
                  )}{" "}
                  Publish
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Post Title
              </label>

              <input
                placeholder="Type your research post title here..."
                className="form-input"
                value={postData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />
            </div>

            <div className="mt-4">
              <CoverImageSelector
                image={postData.coverImageUrl}
                setImage={(value) => handleValueChange("coverImageUrl", value)}
                preview={postData.coverPreview}
                setPreview={(value) => handleValueChange("coverPreview", value)}
              />
            </div>

            {/* 6. REPLACED MDEditor JSX */}
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Content
              </label>

              <div className="mt-3">
                {/* This div is the container Quill will attach to.
                  The `quill.snow.css` import will style it.
                  Set a minHeight so it's visible on load.
                */}
                <div ref={editorRef} style={{ minHeight: "350px" }} />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">Tags</label>

              <TagInput
                tags={postData?.tags || []}
                setTags={(data) => {
                  handleValueChange("tags", data);
                }}
              />
            </div>
          </div>

          {/* ... (Your right sidebar for AI generation) ... */}
          {/* ... (No changes needed there) ... */}
          {!isEdit && (
            <div className="form-card col-span-12 md:col-span-4 p-0">
              <div className="flex items-center justify-between px-6 pt-6">
                <h4 className="text-sm md:text-base font-medium inline-flex items-center gap-2">
                  <span className="text-sky-600">
                    <LuSparkles />
                  </span>
                  Ideas for your next post
                </h4>

                <button
                  className="bg-linear-to-r from-sky-500 to-cyan-400 text-[13px] font-semibold text-white px-3 py-1 rounded hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-sky-200"
                  onClick={() =>
                    setOpenResearchPostGenForm({ open: true, data: null })
                  }
                >
                  Generate New
                </button>
              </div>

              <div>
                {ideaLoading ? (
                  <div className="p-5">
                    <SkeletonLoader />
                  </div>
                ) : (
                  postIdeas.map((idea, index) => (
                    <ResearchPostIdeaCard
                      key={`idea_${index}`}
                      title={idea.title || ""}
                      description={idea.description || ""}
                      tags={idea.tags || []}
                      tone={idea.tone || "casual"}
                      onSelect={() =>
                        setOpenResearchPostGenForm({ open: true, data: idea })
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ... (Your Modals) ... */}
      {/* ... (No changes needed there) ... */}
      <Modal
        isOpen={openResearchPostGenForm?.open}
        onClose={() => {
          setOpenResearchPostGenForm({ open: false, data: null });
        }}
        hideHeader
      >
        <GenerateResearchPostForm
          contentParams={openResearchPostGenForm?.data || null}
          setPostContent={(title, content) => {
            const postInfo = openResearchPostGenForm?.data || null;
            // This setPostData call will trigger the sync useEffect
            setPostData((prevState) => ({
              ...prevState,
              title: title || prevState.title,
              content: content,
              tags: postInfo?.tags || prevState.tags,
              generatedByAI: true,
            }));
          }}
          handleCloseForm={() => {
            setOpenResearchPostGenForm({ open: false, data: null });
          }}
        />
      </Modal>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => {
          setOpenDeleteAlert(false);
        }}
        title="Delete Alert"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Are you sure you want to delete this research post?"
            onDelete={() => deletePost()}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};
export default ResearchPostEditorQuill;