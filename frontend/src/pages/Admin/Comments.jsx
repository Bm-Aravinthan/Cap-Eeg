import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout'
import CommentInfoCard from '../../components/Cards/CommentInfoCard';
// import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DeleteAlertContent from '../../components/DeleteAlertContent';
import Modal from '../../components/Modal';
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const Comments = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const { getToken } = useAuth();

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  // get all commets
  const getAllComments = async (scope = "me") => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_PATHS.COMMENTS.GET_ALL}?scope=${scope}`, 
      {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
      setComments(response.data?.length > 0 ? response.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // delete comment
  const deleteComment = async (commentId) => {
    try {
      await axios.delete(API_PATHS.COMMENTS.DELETE(commentId),{
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });

      toast.success("Comment Deleted Successfully");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      getAllComments();
    } catch (error) {
      console.error("Error deleting research post:", error);
    }
  };

  useEffect(() => {
    getAllComments();
    return () => {};
  }, []);
  return (
    <DashboardLayout activeMenu='Comments'>
      <div className="w-auto sm:max-w-[900px] mx-auto">
        <h2 className="text-2xl font-semibold mt-5 mb-5">Comments</h2>

        {comments.length === 0 ? (
          <div className="text-gray-500 text-start py-2"> There is no comments... </div>
          ) : (
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
            getAllComments={getAllComments}
            onDelete={(commentId) =>
              setOpenDeleteAlert({ open: true, data: commentId || comment._id })
            }
          />
        )))}
      </div>

      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null });
        }}
        title="Delete Alert"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Are you sure you want to delete this comment?"
            onDelete={() => deleteComment(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  )
}
export default Comments