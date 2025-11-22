import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LuLoaderCircle, LuSave, LuSend, LuSparkles, LuTrash2 } from "react-icons/lu";
import MDEditor, { commands } from "@uiw/react-md-editor";
import DashboardLayout from "../../components/Layout/DashboardLayout";
// import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import CoverImageSelector from "../../components/Inputs/CoverImageSelector";
import TagInput from "../../components/Inputs/TagInput";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import ResearchPostIdeaCard from "../../components/Cards/ResearchPostIdeaCard";
import Modal from "../../components/Modal";
import GenerateResearchPostForm from "./components/GenerateResearchPostForm";
// import uploadImage from "../../utils/uploadImages";
import toast from "react-hot-toast";
import { getToastMessagesByType } from "../../utils/helper";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { assets } from "../../assets/assets";
import DocumentSelector from "../../components/Inputs/DocumentSelector";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const ResearchPostEditor = ({ isEdit }) => {
  const navigate = useNavigate();
  const { postSlug = "" } = useParams();
  const { getToken } = useAuth();

  const [images, setImages] = useState({1: null, 2: null, 3: null, 4: null, 5: null});

  const [postData, setPostData] = useState({
    id: "",
    title: "",
    content: "",
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
          }
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
  // const handlePublish = async (isDraft) => {
  //   let coverImageUrl = "";

  //   if (!postData.title.trim()) {
  //     setError("Please enter a title.");
  //     return;
  //   }
  //   if (!postData.content.trim()) {
  //     setError("Please enter some content.");
  //     return;
  //   }

  //   if (!isDraft) {
  //     if (!isEdit && !postData.coverImageUrl) {
  //       setError("Please select a cover image.");
  //       return;
  //     }
  //     if (isEdit && !postData.coverImageUrl && !postData.coverPreview) {
  //       setError("Please select a cover image.");
  //       return;
  //     }
  //     if (!postData.tags.length) {
  //       setError("Please add some tags.");
  //       return;
  //     }
  //   }

  //   setLoading(true);
  //   setError("");
  //   try {
  //     // Check if a new image was uploaded (File type)
  //     // if (postData.coverImageUrl instanceof File) {
  //     //   const imgUploadRes = await uploadImage(postData.coverImageUrl);
  //     //   coverImageUrl = imgUploadRes.imageUrl || "";
  //     // } else {
  //     //   coverImageUrl = postData.coverPreview;
  //     // }

  //     Object.keys(images).forEach( async (key) => {
  //       // if(images[key] instanceof File){
  //       //   const imgUploadRes = await uploadImage(images[key]);
  //       //   console.log(`Image ${key} uploaded:`, imgUploadRes.imageUrl);
  //       // }
  //       images[key] && postData.append( "images", images[key] );
  //     });

  //     const reqPayload = {
  //       title: postData.title,
  //       content: postData.content,
  //       coverImageUrl,
  //       tags: postData.tags,
  //       isDraft: isDraft ? true : false,
  //       generatedByAI: true,
  //     };

  //     const response = isEdit
  //       ? await axios.put(
  //           API_PATHS.POSTS.UPDATE(postData.id),
  //           reqPayload,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${await getToken()}`,
  //             },
  //           }
  //         )
  //       : await axios.post(API_PATHS.POSTS.CREATE, reqPayload,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${await getToken()}`,
  //           },
  //         }
  //       );

  //     if (response.data) {
  //       toast.success(
  //         getToastMessagesByType(
  //           isDraft ? "draft" : isEdit ? "edit" : "published"
  //         )
  //       );
  //       navigate("/admin/posts");
  //     }
  //   } catch (error) {
  //     setError("Failed to publish research post. Please try again.");
  //     console.error("Error publishing research post:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Handle Research Post Publish with new file upload logic
  const handlePublish = async (isDraft) => {
    let coverImageUrl = "";

    if (!postData.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!postData.content.trim()) {
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
      const formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);
      formData.append("isDraft", isDraft ? true : false);
      formData.append("generatedByAI", true);
      postData.tags.forEach((tag) => formData.append("tags[]", tag));

      // ✅ Cover Image
      if (postData.coverImageUrl instanceof File) {
        formData.append("coverImage", postData.coverImageUrl);
      }

      // ✅ Optional Images
      Object.keys(images).forEach((key) => {
        if (images[key]) {
          formData.append("images", images[key]);
        }
      });

      // ✅ Optional Document (PDF)
      if (postData.document) {
        formData.append("document", postData.document);
      }

      // const reqPayload = {
      //   title: postData.title,
      //   content: postData.content,
      //   coverImageUrl,
      //   tags: postData.tags,
      //   isDraft: isDraft ? true : false,
      //   generatedByAI: true,
      // };
console.log("Form Data:", formData);
      const response = isEdit
        ? await axios.put(
            // API_PATHS.POSTS.UPDATE(formData.id),
            API_PATHS.POSTS.UPDATE(postData.id),
            formData,
            // reqPayload,
            {
              headers: {
                Authorization: `Bearer ${await getToken()}`,
                "Content-Type": "multipart/form-data",
              },
            }
          )
        : await axios.post(API_PATHS.POSTS.CREATE, formData,
          {
            headers: {
              Authorization: `Bearer ${await getToken()}`,
              "Content-Type": "multipart/form-data",
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
          content: data.content,
          coverPreview: data.coverImageUrl,
          tags: data.tags,
          isDraft: data.isDraft,
          generatedByAI: data.generatedByAI,
          document: data.documentUrl || null,
        }));

        const mappedImages = { 1: null, 2: null, 3: null, 4: null, 5: null };

        if (Array.isArray(data.images) && data.images.length > 0) {
          data.images.forEach((imgUrl, index) => {
            mappedImages[index + 1] = imgUrl;
          });
        }

        setImages(mappedImages);

        // ✅ Set image previews
        // if (data.images && data.images.length > 0) {
        //   const mappedImages = {};
        //   data.images.forEach((img, index) => {
        //     mappedImages[index + 1] = img; // Match existing image keys 1..5
        //   });
        //   setImages(mappedImages);
        // }
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

  useEffect(() => {
    if (isEdit) {
      fetchPostDetailsBySlug();
    } else {
      generatePostIdeas();
    }

    return () => {};
  }, []);

  useEffect(() => {
    return () => {
      Object.values(images).forEach((img) => {
        if (img instanceof File) {
          URL.revokeObjectURL(img);
        }
      });
    };
  }, [images]);

  return (
    <DashboardLayout activeMenu="Research Posts">
      <div className="my-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-4">
          <div className="form-card p-6 col-span-12 md:col-span-8">
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

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Content
              </label>

              <div data-color-mode="light" className="mt-3">
                <MDEditor
                  value={postData.content}
                  onChange={(data) => {
                    handleValueChange("content", data);
                  }}
                  commands={[
                    commands.bold,
                    commands.italic,
                    commands.strikethrough,
                    commands.hr,
                    commands.title,
                    // commands.group([commands.title1, commands.title2, commands.title3, commands.title4, commands.title5, commands.title6], {
                    //   name: 'title',
                    //   groupName: 'title',
                    //   buttonProps: { 'aria-label': 'Insert title'}
                    // }),
                    commands.divider,
                    commands.link,
                    commands.code,
                    commands.image,
                    commands.unorderedListCommand,
                    commands.orderedListCommand,
                    commands.checkedListCommand,
                  ]}
                  hideMenu={true}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">Images</label>

              {/* <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
                {Object.keys(images).map((key) => (
                  <label htmlFor={`researchImage${key}`} key={key}>
                      <img className="max-h-13 cursor-pointer opacity-80" src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea} alt="" />
                      <input type="file" accept="image/*" id={`researchImage${key}`} hidden onChange={e=> setImages({...images, [key]: e.target.files[0]})}/>
                  </label>
                ))}
              </div> */}

              {/* New one */}
              {/* <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
                {Object.keys(images).map((key) => (
                  <label htmlFor={`researchImage${key}`} key={key}>
                    {typeof images[key] === "string" ? (
                      // ✅ Show existing uploaded image (Cloudinary URL)
                      <img
                        className="max-h-13 cursor-pointer opacity-80"
                        src={images[key]}
                        alt=""
                      />
                    ) : (
                      // ✅ Show newly uploaded local preview
                      <img
                        className="max-h-13 cursor-pointer opacity-80"
                        src={URL.createObjectURL(images[key])}
                        alt=""
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      id={`researchImage${key}`}
                      hidden
                      onChange={(e) => setImages({ ...images, [key]: e.target.files[0] })}
                    />
                  </label>
                ))}
              </div> */}

              {/* New Two */}
              <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
              {Object.keys(images).map((key) => {
                const img = images[key];
                const previewSrc =
                  typeof img === "string"
                    ? img // existing uploaded image URL
                    : img instanceof File
                    ? URL.createObjectURL(img)
                    : assets.uploadArea;

                return (
                  <label htmlFor={`researchImage${key}`} key={key}>
                    <img
                      className="max-h-13 cursor-pointer opacity-80"
                      src={previewSrc}
                      alt=""
                    />
                    <input
                      type="file"
                      accept="image/*"
                      id={`researchImage${key}`}
                      hidden
                      onChange={(e) =>
                        setImages({
                          ...images,
                          [key]: e.target.files[0],
                        })
                      }
                    />
                  </label>
                );
              })}
            </div>

            </div>

            {/* <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">Research Document (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                className="form-input mt-1"
                onChange={(e) =>
                  handleValueChange("document", e.target.files[0])
                }
              />
              {postData.document && (
                <p className="text-xs text-gray-500 mt-1">{postData.document.name}</p>
              )}
            </div> */}

            {/* New One */}
            {/* <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Research Document (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                className="form-input mt-1"
                onChange={(e) => handleValueChange("document", e.target.files[0])}
              />
              
              {postData.document && (
                typeof postData.document === "string" ? (
                  <a
                    href={postData.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 mt-1 underline block"
                  >
                    View existing document
                  </a>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">{postData.document.name}</p>
                )
              )}
            </div> */}

            {/* New Two */}
            {/* <div className="mt-3">
  <label className="text-xs font-medium text-slate-600">
    Research Document (PDF)
  </label>
  <input
    type="file"
    accept="application/pdf"
    className="form-input mt-1"
    onChange={(e) =>
      handleValueChange("document", e.target.files[0])
    }
  />

  {postData.document && (
    typeof postData.document === "string" ? (
      <a
        href={postData.document}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 mt-1 underline block"
      >
        View existing document
      </a>
    ) : (
      <p className="text-xs text-gray-500 mt-1">{postData.document.name}</p>
    )
  )}
</div> */}


<div className="mt-3">
  <label className="text-xs font-medium text-slate-600">
    Research Document (PDF)
  </label>
  <DocumentSelector
    document={postData.document}
    setDocument={(value) => handleValueChange("document", value)}
  />
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
  )
}
export default ResearchPostEditor