import React, { useState } from "react";
import { useContext } from "react";
import { LuMessageCircleDashed } from "react-icons/lu";
import { PiHandsClapping } from "react-icons/pi";
// import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import clsx from "clsx";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { UserContext } from "../../../context/userContext";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const LikeCommentButton = ({ postId, likes, comments }) => {
  const { user } = useContext(UserContext);
  const [postLikes, setPostLikes] = useState(likes || 0);
  const [liked, setLiked] = useState(false);
  const { getToken } = useAuth();

  const handleLikeClick = async () => {
    if (!user) return;
    if (!postId) return;

    try {
      // const response = await axios.post(API_PATHS.POSTS.LIKE(postId), {},
      const response = await axios.put(API_PATHS.POSTS.LIKE(postId), {},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });

      if (response.data) {
        // setPostLikes((prevState) => prevState + 1);
        // setLiked(true);
        const { liked, likes } = response.data;
        setLiked(liked);
        setPostLikes(likes);

        // Reset animation after 500ms
        // setTimeout(() => {
        //   setLiked(false);
        // }, 500);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return <div className="flex justify-center items-center h-screen">
      <div className="fixed bottom-8 right-8 px-6 py-3 bg-black text-white rounded-full shadow-lg flex items-center justify-center">
        <button
          className="flex items-end gap-2 cursor-pointer"
          onClick={handleLikeClick}
          disabled={!user}
        >
          <PiHandsClapping
            className={clsx(
              "text-[22px] transition-transform duration-300",
              liked && "scale-125 text-cyan-500"
            )}
          />
          <span className="text-base font-medium leading-4">{postLikes}</span>
        </button>

        <div className="h-6 w-px bg-gray-500 mx-5"></div>

        <button className="flex items-end gap-2">
          <LuMessageCircleDashed className="text-[22px]" />
          <span className="text-base font-medium leading-4">{comments}</span>
        </button>
      </div>
    </div>
};

export default LikeCommentButton;
