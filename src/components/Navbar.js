import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUserCircle, FaSignInAlt, FaUserPlus, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <nav style={styles.navbar}>
      {/* Logo */}
      <div style={styles.logo}>🌊 SocioSphere</div>

      {/* Links */}
      <div style={styles.links}>
        <Link to="/" style={styles.link}>
          <FaHome style={styles.icon} /> Home
        </Link>
        {token ? (
          <>
            <Link to="/profile" style={styles.link}>
              <FaUserCircle style={styles.icon} /> Profile
            </Link>
            <button onClick={handleLogout} style={styles.button}>
              <FaSignOutAlt style={styles.icon} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              <FaSignInAlt style={styles.icon} /> Login
            </Link>
            <Link to="/register" style={styles.link}>
              <FaUserPlus style={styles.icon} /> Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Styles
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 35px",
    background: "linear-gradient(90deg, #00c6ff, #0072ff)", // Aqua blue gradient
    color: "white",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
    borderRadius: "0 0 12px 12px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontWeight: "bold",
    fontSize: "24px",
    letterSpacing: "1px",
    color: "#e0f7fa", // Light aqua
    textShadow: "2px 2px 8px rgba(0,0,0,0.2)",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "0.3s",
  },
  icon: {
    fontSize: "16px",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#ff6b6b",
    border: "none",
    color: "white",
    padding: "7px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "0.3s",
  },
};

// Hover effects
styles.link.onMouseOver = (e) => (e.target.style.color = "#00e5ff"); // Aqua glow
styles.link.onMouseOut = (e) => (e.target.style.color = "white");
styles.button.onMouseOver = (e) => (e.target.style.backgroundColor = "#ff3b3b");
styles.button.onMouseOut = (e) => (e.target.style.backgroundColor = "#ff6b6b");

export default Navbar;
