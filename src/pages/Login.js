import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await API.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.header}>
          <FaSignInAlt style={{ marginRight: "8px" }} /> Login
        </h2>

        <div style={styles.inputWrapper}>
          <FaEnvelope style={styles.icon} />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputWrapper}>
          <FaLock style={styles.icon} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>
          <FaSignInAlt style={{ marginRight: "6px" }} /> Login
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
    height: "80vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },
  form: {
    backgroundColor: "white",
    padding: "35px 40px",
    borderRadius: "15px",
    boxShadow: "0px 8px 25px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    width: "340px",
    animation: "fadeIn 0.6s ease-in-out",
  },
  header: {
    textAlign: "center",
    color: "#4e54c8",
    marginBottom: "10px",
    fontSize: "22px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#f5f5f5",
    borderRadius: "10px",
    padding: "8px 12px",
    border: "1px solid #ccc",
  },
  icon: {
    color: "#4e54c8",
    fontSize: "18px",
    marginRight: "8px",
  },
  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    flex: 1,
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #ff6a00, #ee0979)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
  },
};

export default Login;
