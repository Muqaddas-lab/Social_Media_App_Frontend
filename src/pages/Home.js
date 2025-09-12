import React, { useEffect, useState } from "react";
import { FaPlusCircle, FaSave, FaTimesCircle } from "react-icons/fa";
import API from "../api/api";
import PostCard from "../components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Create post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return alert("Post content cannot be empty");
    try {
      await API.post(
        "/posts",
        { content: newPost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPost("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  // Like post
  const handleLike = async (postId) => {
    try {
      await API.post(
        `/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Delete post
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await API.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Start editing
  const startEditing = (postId, currentContent) => {
    setEditingPostId(postId);
    setEditingContent(currentContent);
  };

  // Update post
  const handleUpdate = async (postId) => {
    if (!editingContent.trim()) return alert("Post content cannot be empty");
    try {
      await API.put(
        `/posts/${postId}`,
        { content: editingContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPostId(null);
      setEditingContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  // Add comment
  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    try {
      await API.post(
        `/posts/${postId}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>🏡 SocioSphere Feed</h2>

      {/* Create Post Form */}
      {token && (
        <form onSubmit={handleCreatePost} style={styles.form}>
          <textarea
            style={styles.textarea}
            placeholder="💭 What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <button style={styles.createBtn} type="submit">
            <FaPlusCircle style={{ marginRight: "6px" }} /> Post
          </button>
        </form>
      )}

      {/* Show Posts */}
      <div style={styles.postsContainer}>
        {posts.length > 0 ? (
          posts.map((post) =>
            editingPostId === post._id ? (
              <div key={post._id} style={styles.postWrapper}>
                <textarea
                  style={styles.textarea}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
                <button
                  style={styles.updateBtn}
                  onClick={() => handleUpdate(post._id)}
                >
                  <FaSave style={{ marginRight: "6px" }} /> Update
                </button>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setEditingPostId(null)}
                >
                  <FaTimesCircle style={{ marginRight: "6px" }} /> Cancel
                </button>
              </div>
            ) : (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onDeletePost={handleDelete}
                onUpdatePost={(id, content) => startEditing(id, content)}
                onAddComment={handleAddComment}
              />
            )
          )
        ) : (
          <p style={styles.noPosts}>✨ No posts available yet. Start sharing!</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: "700px", margin: "20px auto", padding: "0 15px" },
  header: {
    textAlign: "center",
    background: "linear-gradient(90deg, #6a11cb, #2575fc)",
    color: "white",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
    fontSize: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
    background: "#fff",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    resize: "none",
    fontSize: "14px",
  },
  createBtn: {
    background: "linear-gradient(90deg, #ff6a00, #ee0979)",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  updateBtn: {
    background: "linear-gradient(90deg, #36d1dc, #5b86e5)",
    color: "white",
    padding: "8px 12px",
    marginRight: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  cancelBtn: {
    background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  postsContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  postWrapper: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "10px",
    background: "#fff",
    boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
  },
  noPosts: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: "20px",
  },
};

export default Home;
