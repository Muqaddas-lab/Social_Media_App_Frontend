import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Comment from "../components/Comment";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaThumbsUp,
  FaHeart,
  FaCommentDots,
  FaUserCircle,
} from "react-icons/fa";

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID
  const getCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await API.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUserId(res.data.user?._id || res.data._id);
    } catch (error) {
      console.error("Failed to get current user:", error);
    }
  }, []);

  // Fetch post data
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/posts/${postId}`);
      setPost(res.data.post || res.data);
      setEditContent(res.data.post?.content || res.data.content || "");
    } catch (error) {
      console.error("Fetch post error:", error);
      alert("Failed to fetch post");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Add comment
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/posts/${postId}/comments`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      fetchPost();
    } catch (error) {
      console.error("Add comment error:", error);
      alert("Failed to add comment");
    }
  };

  // Edit post
  const handleEditPost = async () => {
    if (!editContent.trim()) return alert("Post content cannot be empty");
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/posts/${postId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost((prev) => ({ ...prev, content: editContent }));
      setIsEditing(false);
      alert("Post updated successfully!");
    } catch (error) {
      console.error("Edit post error:", error);
      alert("Failed to update post");
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Post deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Delete post error:", error);
      alert("Failed to delete post");
    }
  };

  // Like/unlike post
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPost();
    } catch (error) {
      console.error("Like post error:", error);
      alert("Failed to update like");
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content || "");
  };

  const isOwner = currentUserId && post?.user?._id === currentUserId;

  // Profile picture
  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return "/default-avatar.png";
    const picPath = profilePic.startsWith("/") ? profilePic : `/${profilePic}`;
    return `http://localhost:5000${picPath}`;
  };

  useEffect(() => {
    fetchPost();
    getCurrentUser();
  }, [fetchPost, getCurrentUser]);

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Loading post...</p>;
  if (!post) return <p style={{ textAlign: "center" }}>Post not found!</p>;

  return (
    <div style={styles.container}>
      <div style={styles.postCard}>
        {/* Post Header */}
        <div style={styles.postHeader}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {post.user?.profilePic ? (
                <img
                  src={getProfilePicUrl(post.user?.profilePic)}
                  alt="Profile"
                  style={styles.avatarImg}
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
              ) : (
                <FaUserCircle style={{ fontSize: "60px", color: "#aaa" }} />
              )}
            </div>
            <div>
              <h2 style={styles.userName}>{post.user?.name || "Unknown User"}</h2>
              <p style={styles.postDate}>
                {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwner && (
            <div style={styles.actionButtons}>
              {!isEditing ? (
                <>
                  <button style={{ ...styles.actionBtn, ...styles.editBtn }} onClick={() => setIsEditing(true)}>
                    <FaEdit /> Edit
                  </button>
                  <button style={{ ...styles.actionBtn, ...styles.deleteBtn }} onClick={handleDeletePost}>
                    <FaTrash /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button style={{ ...styles.actionBtn, ...styles.saveBtn }} onClick={handleEditPost}>
                    <FaSave /> Save
                  </button>
                  <button style={{ ...styles.actionBtn, ...styles.cancelBtn }} onClick={cancelEdit}>
                    <FaTimes /> Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Post Content */}
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={styles.editTextarea}
            rows={4}
          />
        ) : (
          <p style={styles.content}>{post.content || "No content available"}</p>
        )}

        {/* Post Stats */}
        <div style={styles.postStats}>
          <span style={styles.likeBtn} onClick={handleLike}>
            {post.likes?.includes(currentUserId) ? (
              <FaHeart style={{ color: "red" }} />
            ) : (
              <FaThumbsUp />
            )}{" "}
            {post.likes?.length || 0} Likes
          </span>
          <span>
            <FaCommentDots /> {post.comments?.length || 0} Comments
          </span>
        </div>
      </div>

      {/* Comments Section */}
      <div style={styles.commentsSection}>
        <h3 style={styles.commentsTitle}>
          <FaCommentDots style={{ marginRight: "8px" }} />
          Comments ({post.comments?.length || 0})
        </h3>

        {post.comments?.length > 0 ? (
          <div style={styles.commentsList}>
            {post.comments.map((c) => (
              <Comment key={c._id} comment={c} />
            ))}
          </div>
        ) : (
          <p style={styles.noComments}>No comments yet!</p>
        )}

        {/* Add Comment */}
        <div style={styles.commentInput}>
          <input
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
            style={styles.input}
          />
          <button onClick={handleAddComment} style={styles.button} disabled={!comment.trim()}>
            <FaCommentDots style={{ marginRight: "6px" }} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: 700, margin: "30px auto", padding: "0 20px", fontFamily: "Arial, sans-serif" },
  postCard: { backgroundColor: "#fff", padding: 25, borderRadius: 15, boxShadow: "0px 8px 20px rgba(0,0,0,0.1)", marginBottom: 25 },
  postHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  userInfo: { display: "flex", alignItems: "center", gap: "15px" },
  avatar: { width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", border: "3px solid #4e54c8", display: "flex", justifyContent: "center", alignItems: "center" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  userName: { color: "#4e54c8", marginBottom: 5, fontSize: 20, margin: 0 },
  postDate: { color: "#888", fontSize: 12, margin: 0 },
  actionButtons: { display: "flex", gap: 8 },
  actionBtn: { padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: "bold", cursor: "pointer", transition: "0.3s", display: "flex", alignItems: "center", gap: 5 },
  editBtn: { background: "#28a745", color: "white" },
  deleteBtn: { background: "#dc3545", color: "white" },
  saveBtn: { background: "#007bff", color: "white" },
  cancelBtn: { background: "#6c757d", color: "white" },
  content: { fontSize: 16, lineHeight: 1.6, marginBottom: 15 },
  editTextarea: { width: "100%", padding: 12, borderRadius: 10, border: "2px solid #4e54c8", outline: "none", fontSize: 16, lineHeight: 1.6, marginBottom: 15, fontFamily: "Arial, sans-serif" },
  postStats: { display: "flex", gap: 20, color: "#666", fontSize: 14, paddingTop: 15, borderTop: "1px solid #eee" },
  likeBtn: { cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: 5 },
  commentsSection: { backgroundColor: "#f9f9f9", padding: 20, borderRadius: 15 },
  commentsTitle: { color: "#4e54c8", marginBottom: 20, display: "flex", alignItems: "center" },
  commentsList: { maxHeight: 300, overflowY: "auto" },
  noComments: { color: "#888", fontStyle: "italic", textAlign: "center", padding: 20 },
  commentInput: { display: "flex", marginTop: 20, gap: 10 },
  input: { flex: 1, padding: "12px 15px", borderRadius: 10, border: "1px solid #ccc", outline: "none", fontSize: 14 },
  button: { padding: "12px 20px", borderRadius: 10, border: "none", background: "linear-gradient(90deg, #4e54c8, #8f94fb)", color: "#fff", cursor: "pointer", fontWeight: "bold", transition: "0.3s", whiteSpace: "nowrap", display: "flex", alignItems: "center" },
};

export default PostDetails;
