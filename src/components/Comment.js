import React from "react";
import { FaUserCircle } from "react-icons/fa";

const Comment = ({ comment }) => {
  return (
    <div style={styles.comment}>
      {/* User Icon */}
      <div style={styles.avatar}>
        <FaUserCircle size={28} color="#4e54c8" />
      </div>

      {/* Comment Content */}
      <div>
        <strong style={styles.username}>
          {comment?.user?.name || "Anonymous"}:
        </strong>
        <span style={styles.text}> {comment?.text}</span>
      </div>
    </div>
  );
};

const styles = {
  comment: {
    background: "linear-gradient(135deg, #e0f7fa, #e8eaf6)",
    borderRadius: "12px",
    padding: "10px 14px",
    margin: "10px 0",
    boxShadow: "0px 3px 8px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  avatar: {
    flexShrink: 0,
  },
  username: {
    color: "#4e54c8",
    marginRight: "6px",
    fontWeight: "600",
    fontSize: "14px",
  },
  text: {
    color: "#333",
    fontSize: "14px",
  },
};

// Add hover effect with inline style hack
styles.comment.onMouseOver = (e) =>
  (e.currentTarget.style.boxShadow = "0px 5px 12px rgba(0,0,0,0.2)");
styles.comment.onMouseOut = (e) =>
  (e.currentTarget.style.boxShadow = "0px 3px 8px rgba(0,0,0,0.1)");

export default Comment;
