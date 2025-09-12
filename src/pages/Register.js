import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Name, email, and password are required");
      return;
    }

    try {
      const res = await API.post("/users/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.header}>
          <FaUserPlus style={{ marginRight: "10px", color: "#4e54c8" }} />
          Register
        </h2>

        {/* Name Field */}
        <div style={styles.inputGroup}>
          <FaUser style={styles.icon} />
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Email Field */}
        <div style={styles.inputGroup}>
          <FaEnvelope style={styles.icon} />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Password Field */}
        <div style={styles.inputGroup}>
          <FaLock style={styles.icon} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" style={styles.button}>
          <FaUserPlus style={{ marginRight: "8px" }} /> Register
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "85vh",
    background: "linear-gradient(120deg, #89f7fe, #66a6ff)",
  },
  form: {
    backgroundColor: "white",
    padding: "40px 45px",
    borderRadius: "15px",
    boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    width: "360px",
    transition: "0.3s",
  },
  header: {
    textAlign: "center",
    color: "#4e54c8",
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px 12px",
    background: "#f9f9f9",
    transition: "0.3s",
  },
  icon: {
    color: "#4e54c8",
    marginRight: "10px",
    fontSize: "16px",
  },
  input: {
    border: "none",
    outline: "none",
    flex: 1,
    background: "transparent",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #4e54c8, #8f94fb)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Register;
