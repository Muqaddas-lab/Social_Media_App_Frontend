import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaEye,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";

const PostCard = ({ post, onLike, onAddComment, onUpdatePost, onDeletePost }) => {
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || "");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [profilePic, setProfilePic] = useState("/default-avatar.png");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.id || payload._id);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  useEffect(() => {
    if (post?.user?.profilePic) {
      const picPath = post.user.profilePic.startsWith("/")
        ? post.user.profilePic
        : `/${post.user.profilePic}`;
      setProfilePic(`http://localhost:5000${picPath}`);
    } else {
      setProfilePic("/default-avatar.png");
    }
  }, [post?.user?.profilePic]);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    onAddComment(post._id, comment);
    setComment("");
  };

  const handleEditPost = () => {
    if (!editContent.trim()) {
      alert("Post content cannot be empty");
      return;
    }
    onUpdatePost(post._id, editContent);
    setIsEditing(false);
  };

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      onDeletePost(post._id);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content || "");
  };

  const handleViewPost = () => {
    navigate(`/posts/${post._id}`);
  };

  const isOwner =
    currentUserId && String(post?.user?._id) === String(currentUserId);
  const hasLiked = currentUserId && post?.likes?.includes(currentUserId);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  return (
    <div style={styles.card}>
      {/* Post Header */}
      <div style={styles.postHeader}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            <img
              src={profilePic}
              alt="Profile"
              style={styles.avatarImg}
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </div>
          <div>
            <h3 style={styles.username}>{post?.user?.name || "Unknown User"}</h3>
            <p style={styles.postDate}>{formatDate(post?.createdAt)}</p>
          </div>
        </div>

        {isOwner && (
          <div style={styles.actionMenu}>
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ ...styles.actionBtn, ...styles.editBtn }}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={handleDeletePost}
                  style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                >
                  <FaTrash />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditPost}
                  style={{ ...styles.actionBtn, ...styles.saveBtn }}
                >
                  <FaSave />
                </button>
                <button
                  onClick={cancelEdit}
                  style={{ ...styles.actionBtn, ...styles.cancelBtn }}
                >
                  <FaTimes />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          style={styles.editTextarea}
          rows={3}
          placeholder="Edit your post..."
        />
      ) : (
        <p style={styles.content}>{post?.content}</p>
      )}

      {/* Post Actions */}
      <div style={styles.postActions}>
        <button
          style={{
            ...styles.likeButton,
            background: hasLiked
              ? "linear-gradient(90deg, #ff416c, #ff4b2b)"
              : "linear-gradient(90deg, #00c6ff, #0072ff)",
          }}
          onClick={() => onLike(post._id)}
        >
          {hasLiked ? <FaHeart /> : <FaRegHeart />} {post?.likes?.length || 0}
        </button>
        <button
          style={styles.commentButton}
          onClick={() => setShowComments(!showComments)}
        >
          <FaCommentDots /> {post?.comments?.length || 0}
        </button>
        <button style={styles.viewButton} onClick={handleViewPost}>
          <FaEye /> View
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={styles.commentsSection}>
          <div style={styles.commentsHeader}>
            <h4 style={styles.commentsTitle}>Comments</h4>
            <button
              onClick={() => setShowComments(false)}
              style={styles.closeComments}
            >
              ✕
            </button>
          </div>

          <div style={styles.commentsList}>
            {post?.comments?.length > 0 ? (
              post.comments.slice(0, 3).map((c, i) => (
                <div key={i} style={styles.commentItem}>
                  <div style={styles.commentAvatar}>
                    {c?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div style={styles.commentContent}>
                    <strong style={styles.commentAuthor}>
                      {c?.user?.name || "Anonymous"}
                    </strong>
                    <p style={styles.commentText}>{c.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noComments}>
                No comments yet. Be the first to comment!
              </p>
            )}

            {post?.comments?.length > 3 && (
              <button onClick={handleViewPost} style={styles.viewAllComments}>
                View all {post.comments.length} comments
              </button>
            )}
          </div>

          <div style={styles.commentBox}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              style={styles.commentInput}
            />
            <button
              onClick={handleAddComment}
              style={styles.commentBtn}
              disabled={!comment.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "20px",
    margin: "16px 0",
    boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
    border: "1px solid #e3f2fd",
    transition: "0.3s",
  },
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
  },
  userInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid #00c6ff",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  username: { color: "#0072ff", margin: 0, fontWeight: "bold", fontSize: "16px" },
  postDate: { color: "#888", fontSize: "12px" },
  actionMenu: { display: "flex", gap: "8px" },
  actionBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.3s",
  },
  editBtn: { background: "#00c6ff", color: "white" },
  deleteBtn: { background: "#ff4b2b", color: "white" },
  saveBtn: { background: "#28a745", color: "white" },
  cancelBtn: { background: "#6c757d", color: "white" },
  content: { color: "#333", lineHeight: "1.6", marginBottom: "15px" },
  editTextarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #0072ff",
    outline: "none",
    fontSize: "15px",
    marginBottom: "15px",
  },
  postActions: {
    display: "flex",
    gap: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #eee",
  },
  likeButton: {
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  commentButton: {
    background: "linear-gradient(90deg, #6a11cb, #2575fc)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  viewButton: {
    background: "linear-gradient(90deg, #00b09b, #96c93d)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  commentsSection: {
    marginTop: "16px",
    borderRadius: "12px",
    padding: "16px",
    backgroundColor: "#f9f9ff",
  },
  commentsHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  commentsTitle: { color: "#0072ff", margin: 0, fontSize: "16px" },
  closeComments: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#888",
  },
  commentsList: { maxHeight: "200px", overflowY: "auto" },
  commentItem: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
    padding: "8px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  commentAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#00c6ff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  commentAuthor: { color: "#0072ff", fontSize: "13px" },
  commentText: { margin: "4px 0 0 0", fontSize: "14px", color: "#333" },
  noComments: { color: "#888", fontStyle: "italic", textAlign: "center" },
  viewAllComments: {
    background: "none",
    border: "none",
    color: "#0072ff",
    cursor: "pointer",
    fontSize: "13px",
    textDecoration: "underline",
  },
  commentBox: { display: "flex", marginTop: "12px", gap: "8px" },
  commentInput: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
  },
  commentBtn: {
    background: "#0072ff",
    color: "white",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default PostCard;
