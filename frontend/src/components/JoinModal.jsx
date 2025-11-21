import React, { useState } from "react";
import axios from "axios";
import { API_PATHS } from "../utils/apiPaths";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export default function JoinModal({ isOpen, onClose }) {
  const { getToken } = useAuth();
  const [message, setMessage] = useState("");

  const sendRequest = async () => {
    try {
      const response = await axios.post(
        API_PATHS.AUTH.JOIN_REQUESTS,
        { message },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

    //   toast.success(response.data.message);
      toast.success("Request submitted successfully!");
      onClose();
    } catch (err) {
      toast.error("Error submitting request");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[95%] md:w-[450px]">
        <h2 className="text-xl font-semibold mb-3">Join Research Lab</h2>

        <p className="text-gray-600 text-sm mb-4">
          Please explain why you want to participate in research.
        </p>

        <textarea
          className="w-full border px-3 py-2 rounded-lg"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
        />

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-3 py-1 rounded-lg border">
            Cancel
          </button>
          <button onClick={sendRequest} className="px-4 py-1 rounded-lg bg-black text-white">
            Request
          </button>
        </div>
      </div>
    </div>
  );
}
