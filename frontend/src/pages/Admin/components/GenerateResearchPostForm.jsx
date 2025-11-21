import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/Inputs/Input";
// import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import { LuLoaderCircle } from "react-icons/lu";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const GenerateResearchPostForm = ({ contentParams, setPostContent, handleCloseForm }) => {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ title: contentParams?.title || "", tone: contentParams?.tone || "",});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleGenerateResearchPost = async (e) => {
    e.preventDefault();

    const { title, tone } = formData;

    if (!title || !tone) {
      setError("Please fill all the required fields.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Call AI API to generate research post
      const aiResponse = await axios.post(
        API_PATHS.AI.GENERATE_RESEARCH_POST,
        {
          title,
          tone,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          }
        }
      );
console.log(aiResponse.data);
      const generatedPost = aiResponse.data;
      setPostContent(title, generatedPost || "");
      handleCloseForm();
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Generate a Research Post</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-3">
        Provide a title and tone to generate your reserach post.
      </p>

      <form onSubmit={handleGenerateResearchPost} className="flex flex-col gap-3">
        <Input
          value={formData.title}
          onChange={({ target }) => handleChange("title", target.value)}
          label="Research Post Title"
          placeholder=""
          type="text"
        />

        <Input
          value={formData.tone}
          onChange={({ target }) => handleChange("tone", target.value)}
          label="Tone"
          placeholder="beginner friendly, technical, casual, etc"
          type="text"
        />

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={isLoading}
        >
          {isLoading && <LuLoaderCircle className="animate-spin text-[18px]" />}{" "}
          {isLoading ? "Generating..." : "Generate Post"}
        </button>
      </form>
    </div>
  )
}
export default GenerateResearchPostForm