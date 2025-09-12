import React, { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import { FaUser, FaEnvelope, FaInfoCircle, FaUpload, FaSave, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", bio: "", profilePic: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState({ fetch: false, update: false });
  const [messages, setMessages] = useState({ error: null, success: null });

  const token = localStorage.getItem("token");
  const hasToken = Boolean(token);

  const clearMessage = useCallback((type) => {
    setTimeout(() => setMessages((prev) => ({ ...prev, [type]: null })), 3000);
  }, []);

  const updateFormData = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!hasToken) return setMessages((prev) => ({ ...prev, error: "Please login first" }));

    try {
      setLoading((prev) => ({ ...prev, fetch: true }));
      setMessages({ error: null, success: null });

      const res = await API.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = res?.data?.user || res?.data || {};
      setUser(userData);

      setFormData({
        name: userData?.name || "",
        bio: userData?.bio || "",
        profilePic: userData?.profilePic || "",
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      let msg = "Failed to fetch profile";
      if (error.response?.status === 401 || error.response?.status === 403) {
        msg = "Session expired. Please login again";
        localStorage.removeItem("token");
      } else if (error.response?.status === 404) msg = "Profile not found";
      setMessages((prev) => ({ ...prev, error: msg }));
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  }, [hasToken, token]);

  // Update profile
  const handleUpdate = async () => {
    if (!hasToken) return setMessages((prev) => ({ ...prev, error: "Please login first" }));

    try {
      setLoading((prev) => ({ ...prev, update: true }));
      setMessages({ error: null, success: null });

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("bio", formData.bio);
      if (file) submitData.append("profilePic", file);

      const res = await API.put("/users/profile", submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = res?.data?.user || res?.data || {};
      setUser(updatedUser);

      setFormData({
        name: updatedUser?.name || "",
        bio: updatedUser?.bio || "",
        profilePic: updatedUser?.profilePic || "",
      });

      setFile(null);
      setMessages((prev) => ({ ...prev, success: "✅ Profile updated successfully!" }));
      clearMessage("success");
    } catch (error) {
      console.error("Profile update error:", error);
      let msg = "Profile update failed";

      if (error.response) {
        msg = error.response?.data?.message || msg;
        if (error.response.status === 401 || error.response.status === 403) {
          msg = "Session expired. Please login again";
          localStorage.removeItem("token");
        }
      } else if (error.request) {
        msg = "No response from server. Check your network.";
      } else {
        msg = error.message;
      }

      setMessages((prev) => ({ ...prev, error: msg }));
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  // File preview
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (formData.profilePic) {
      setPreview(`http://localhost:5000${formData.profilePic}`);
    } else {
      setPreview(null);
    }
  }, [file, formData.profilePic]);

  useEffect(() => {
    if (hasToken) fetchProfile();
  }, [hasToken, fetchProfile]);

  if (!hasToken)
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, ...styles.errorMessage }}>
          <FaTimesCircle /> Please login to view your profile
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card }} className="profile-card">
        {loading.fetch ? (
          <div style={styles.loadingContainer}>
            <FaSpinner className="spin" size={30} color="#4e54c8" />
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            {/* Profile Picture */}
            <div style={styles.imageContainer}>
              <img
                src={preview || "/default-avatar.png"}
                alt="Profile"
                style={styles.avatar}
                onError={(e) => (e.target.src = "/default-avatar.png")}
              />
              {file && <div style={styles.imagePreviewBadge}>New</div>}
            </div>

            <h2 style={styles.name}><FaUser /> {formData.name || "Unnamed User"}</h2>
            <p style={styles.bio}><FaInfoCircle /> {formData.bio || "No bio added yet"}</p>
            <p style={styles.email}><FaEnvelope /> {user?.email || "No email"}</p>

            {messages.success && (
              <div style={styles.successMessage}>
                <FaCheckCircle /> {messages.success}
              </div>
            )}
            {messages.error && (
              <div style={styles.errorMessage}>
                <FaTimesCircle /> {messages.error}
              </div>
            )}

            {/* Profile Form */}
            <div style={styles.form}>
              <input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                style={styles.input}
                disabled={loading.update}
              />
              <textarea
                placeholder="Bio"
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                style={styles.textarea}
                rows={3}
                disabled={loading.update}
              />

              {/* Custom file upload */}
              <label style={styles.uploadLabel}>
                <FaUpload /> Upload Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  disabled={loading.update}
                />
              </label>

              <button
                onClick={handleUpdate}
                style={{
                  ...styles.button,
                  ...(loading.update ? styles.buttonDisabled : {}),
                }}
                disabled={loading.update}
              >
                {loading.update ? (
                  <>
                    <FaSpinner className="spin" /> Updating...
                  </>
                ) : (
                  <>
                    <FaSave /> Update Profile
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
    minHeight: "400px",
    transition: "all 0.3s ease",
  },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" },
  imageContainer: { position: "relative", display: "inline-block", marginBottom: "15px" },
  avatar: { width: "120px", height: "120px", borderRadius: "50%", border: "3px solid #4e54c8", objectFit: "cover" },
  imagePreviewBadge: { position: "absolute", top: 0, right: 0, background: "#28a745", color: "white", padding: "3px 7px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
  name: { color: "#4e54c8", marginBottom: "8px" },
  bio: { fontSize: "14px", color: "#555", marginBottom: "8px" },
  email: { fontSize: "12px", color: "#888", marginBottom: "15px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "12px 15px", borderRadius: "10px", border: "2px solid #e1e1e1", outline: "none" },
  textarea: { padding: "12px 15px", borderRadius: "10px", border: "2px solid #e1e1e1", outline: "none", resize: "vertical" },
  uploadLabel: {
    padding: "10px",
    borderRadius: "10px",
    border: "2px dashed #4e54c8",
    background: "#f9f9ff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#4e54c8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  button: { padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(90deg, #4e54c8, #8f94fb)", color: "white", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  buttonDisabled: { background: "#ccc", cursor: "not-allowed" },
  successMessage: { color: "#28a745", padding: "10px", borderRadius: "8px", background: "#e6ffed", fontSize: "14px", marginBottom: "10px" },
  errorMessage: { color: "#dc3545", padding: "10px", borderRadius: "8px", background: "#ffe6e6", fontSize: "14px", marginBottom: "10px" },
};

// Extra CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { 0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);} }
  .profile-card:hover { transform: translateY(-3px); box-shadow: 0px 15px 35px rgba(0,0,0,0.15); }
  input:focus, textarea:focus { border-color: #4e54c8 !important; box-shadow: 0 0 0 3px rgba(78,84,200,0.15); }
`;
document.head.appendChild(styleSheet);

export default Profile;
