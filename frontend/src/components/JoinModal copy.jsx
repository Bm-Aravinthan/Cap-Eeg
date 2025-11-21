// src/components/JoinModal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const JoinModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // adjust URL to your backend route
      await axios.post("http://localhost:5000/api/students", formData);
      setMessage("🎉 Successfully joined!");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#FCF5F1] rounded-2xl p-6 w-[90%] max-w-md relative shadow-xl"
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-[#7D5531] hover:text-red-500 text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 text-[#7D5531] text-center">
          Join as a Student
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-[#7D5531]">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-[#e0c9b8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7D5531]/40"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#7D5531]">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-[#e0c9b8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7D5531]/40"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#7D5531]">University</label>
            <input
              type="text"
              name="university"
              required
              value={formData.university}
              onChange={handleChange}
              className="w-full border border-[#e0c9b8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7D5531]/40"
            />
          </div>

          {/* Message */}
          {message && (
            <p className="text-center text-sm text-[#7D5531] mt-2">{message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7D5531] text-white font-medium py-2 rounded-lg hover:bg-[#6c4629] transition"
          >
            {loading ? "Submitting..." : "Join Now"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinModal;
