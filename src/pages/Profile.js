import React, { useEffect, useState, useCallback } from "react";
import API, { getImageUrl } from "../api/api"; // ✅ Import getImageUrl helper
import { FaUser, FaEnvelope, FaInfoCircle, FaUpload, FaSave, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", bio: "", profilePic: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState({ fetch: false, update: false });
  const [messages, setMessages] = useState({ error: null, success: null });

  // ✅ Better token handling with error checking
  const getToken = useCallback(() => {
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  }, []);

  const hasToken = Boolean(getToken());

  const clearMessage = useCallback((type) => {
    setTimeout(() => setMessages((prev) => ({ ...prev, [type]: null })), 3000);
  }, []);

  const updateFormData = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ✅ Remove token safely
  const removeToken = useCallback(() => {
    try {
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }, []);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setMessages((prev) => ({ ...prev, error: "Please login first" }));
      return;
    }

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
        removeToken();
      } else if (error.response?.status === 404) {
        msg = "Profile not found";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (!navigator.onLine) {
        msg = "No internet connection. Please check your network.";
      }
      
      setMessages((prev) => ({ ...prev, error: msg }));
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  }, [getToken, removeToken]);

  // Update profile
  const handleUpdate = async () => {
    const token = getToken();
    if (!token) {
      setMessages((prev) => ({ ...prev, error: "Please login first" }));
      return;
    }

    // ✅ Validation
    if (!formData.name.trim()) {
      setMessages((prev) => ({ ...prev, error: "Name is required" }));
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, update: true }));
      setMessages({ error: null, success: null });

      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("bio", formData.bio.trim());
      
      if (file) {
        // ✅ Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          setMessages((prev) => ({ ...prev, error: "Please upload a valid image file (JPEG, PNG, GIF)" }));
          return;
        }
        
        // ✅ Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setMessages((prev) => ({ ...prev, error: "File size should be less than 5MB" }));
          return;
        }
        
        submitData.append("profilePic", file);
      }

      const res = await API.put("/users/profile", submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
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
          removeToken();
        } else if (error.response.status === 413) {
          msg = "File too large. Please choose a smaller image.";
        }
      } else if (error.request) {
        msg = "No response from server. Check your network connection.";
      } else {
        msg = error.message || msg;
      }

      setMessages((prev) => ({ ...prev, error: msg }));
      clearMessage("error");
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  // ✅ Fixed file preview with proper image URL handling
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (formData.profilePic) {
      // ✅ Use getImageUrl helper for correct image path
      setPreview(getImageUrl(formData.profilePic));
    } else {
      setPreview(null);
    }
  }, [file, formData.profilePic]);

  useEffect(() => {
    if (hasToken) fetchProfile();
  }, [hasToken, fetchProfile]);

  // ✅ Better error handling for missing token
  if (!hasToken) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, ...styles.errorMessage }}>
          <FaTimesCircle /> Please login to view your profile
        </div>
      </div>
    );
  }

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
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                  console.log("Image load failed, using default avatar");
                }}
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
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                style={styles.input}
                disabled={loading.update}
                maxLength={50}
                required
              />
              <textarea
                placeholder="Bio (optional)"
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                style={styles.textarea}
                rows={3}
                disabled={loading.update}
                maxLength={200}
              />

              {/* Custom file upload */}
              <label style={styles.uploadLabel}>
                <FaUpload /> Upload Profile Picture
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                  disabled={loading.update}
                />
              </label>

              {/* ✅ Show selected file info */}
              {file && (
                <div style={styles.fileInfo}>
                  <span>Selected: {file.name}</span>
                  <button 
                    onClick={() => setFile(null)} 
                    style={styles.removeFileBtn}
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                onClick={handleUpdate}
                style={{
                  ...styles.button,
                  ...(loading.update ? styles.buttonDisabled : {}),
                }}
                disabled={loading.update || !formData.name.trim()}
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

// ✅ Enhanced Styles
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
  loadingContainer: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    gap: "15px",
    padding: "40px 0"
  },
  imageContainer: { 
    position: "relative", 
    display: "inline-block", 
    marginBottom: "15px" 
  },
  avatar: { 
    width: "120px", 
    height: "120px", 
    borderRadius: "50%", 
    border: "3px solid #4e54c8", 
    objectFit: "cover",
    transition: "transform 0.3s ease"
  },
  imagePreviewBadge: { 
    position: "absolute", 
    top: 0, 
    right: 0, 
    background: "#28a745", 
    color: "white", 
    padding: "3px 7px", 
    borderRadius: "12px", 
    fontSize: "12px", 
    fontWeight: "bold" 
  },
  name: { color: "#4e54c8", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  bio: { fontSize: "14px", color: "#555", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  email: { fontSize: "12px", color: "#888", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { 
    padding: "12px 15px", 
    borderRadius: "10px", 
    border: "2px solid #e1e1e1", 
    outline: "none",
    fontSize: "14px",
    transition: "border-color 0.3s ease"
  },
  textarea: { 
    padding: "12px 15px", 
    borderRadius: "10px", 
    border: "2px solid #e1e1e1", 
    outline: "none", 
    resize: "vertical",
    fontSize: "14px",
    transition: "border-color 0.3s ease"
  },
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
    transition: "all 0.3s ease"
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "#f0f8ff",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#4e54c8"
  },
  removeFileBtn: {
    background: "#ff4b2b",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    cursor: "pointer",
    fontSize: "12px"
  },
  button: { 
    padding: "12px", 
    borderRadius: "10px", 
    border: "none", 
    background: "linear-gradient(90deg, #4e54c8, #8f94fb)", 
    color: "white", 
    fontWeight: "bold", 
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: "8px",
    fontSize: "14px",
    transition: "all 0.3s ease"
  },
  buttonDisabled: { 
    background: "#ccc", 
    cursor: "not-allowed",
    opacity: "0.6"
  },
  successMessage: { 
    color: "#28a745", 
    padding: "10px", 
    borderRadius: "8px", 
    background: "#e6ffed", 
    fontSize: "14px", 
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  errorMessage: { 
    color: "#dc3545", 
    padding: "10px", 
    borderRadius: "8px", 
    background: "#ffe6e6", 
    fontSize: "14px", 
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
};

// ✅ Enhanced CSS with better animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .spin { 
    animation: spin 1s linear infinite; 
  }
  @keyframes spin { 
    0% {transform: rotate(0deg);} 
    100% {transform: rotate(360deg);} 
  }
  .profile-card:hover { 
    transform: translateY(-3px); 
    box-shadow: 0px 15px 35px rgba(0,0,0,0.15); 
  }
  input:focus, textarea:focus { 
    border-color: #4e54c8 !important; 
    box-shadow: 0 0 0 3px rgba(78,84,200,0.15); 
  }
  .profile-card img:hover {
    transform: scale(1.05);
  }
  label:hover {
    background: #f0f8ff !important;
    border-color: #8f94fb !important;
  }
`;
document.head.appendChild(styleSheet);

export default Profile;